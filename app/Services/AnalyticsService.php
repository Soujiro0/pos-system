<?php

namespace App\Services;

use App\Models\DailySalesSummary;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get sales summary for a date range.
     */
    public function getSalesSummary($startDate, $endDate)
    {
        // For historical data, use the summary table
        $summaries = DailySalesSummary::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        // If today is included, calculate real-time stats and merge/append
        if (Carbon::today()->between(Carbon::parse($startDate), Carbon::parse($endDate))) {
            $today = Carbon::today()->toDateString();
            $todaySummary = $this->calculateDailySummary($today);
            
            // Remove existing entry for today from historical if it exists (to avoid partial data) and append real-time
            $summaries = $summaries->reject(function ($s) use ($today) {
                return $s->date->toDateString() === $today;
            });
            
            // Create a temporary object for today if not already saved
            if ($todaySummary) {
                $summaries->push((object) [
                    'date' => Carbon::now(),
                    'total_sales' => $todaySummary['total_sales'],
                    'total_profit' => $todaySummary['total_profit'],
                    'transaction_count' => $todaySummary['transaction_count']
                ]);
            }
        }

        return [
            'total_revenue' => $summaries->sum('total_sales'),
            'total_profit' => $summaries->sum('total_profit'),
            'total_transactions' => $summaries->sum('transaction_count'),
            'daily_trend' => $summaries->map(fn($s) => [
                'date' => Carbon::parse($s->date)->format('Y-m-d'),
                'sales' => (float) $s->total_sales,
                'profit' => (float) $s->total_profit
            ])->values()
        ];
    }

    /**
     * Calculate summary for a specific day from raw transactions.
     */
    public function calculateDailySummary($date)
    {
        $transactions = Transaction::whereDate('created_at', $date)
            ->with(['items.product']) // Eager load for cost calculation
            ->get();

        if ($transactions->isEmpty()) {
            return null;
        }

        $totalSales = $transactions->sum('total_amount');
        $totalTax = $transactions->sum('tax_amount');
        $totalDiscount = $transactions->sum('discount_amount');
        $transactionCount = $transactions->count();

        // Calculate Profit: Sales - (Cost * Quantity) for each item
        $totalCost = $transactions->flatMap->items->sum(function ($item) {
            // Use product cost if available, otherwise 0 (or strictly tracks at time of sale if we had PriceLog, but simplified here)
            // Ideally we should snapshot cost at transaction time, but for now we look up current product cost
            $cost = $item->product->cost ?? 0; 
            return $item->quantity * $cost;
        });

        $totalProfit = $totalSales - $totalCost - $totalTax; // Net Profit = Sales - COGS - Tax

        return [
            'date' => $date,
            'total_sales' => $totalSales,
            'total_tax' => $totalTax,
            'total_discount' => $totalDiscount,
            'total_profit' => $totalProfit,
            'transaction_count' => $transactionCount
        ];
    }

    /**
     * Store/Update daily summary in DB.
     */
    public function generateAndStoreDailySummary($date)
    {
        $data = $this->calculateDailySummary($date);
        
        if ($data) {
            DailySalesSummary::updateOrCreate(
                ['date' => $date],
                $data
            );
        }
    }

    /**
     * Get current inventory valuation.
     */
    public function getInventoryValuation()
    {
        // Join Inventory and Products to calc value
        return Inventory::join('tbl_products', 'tbl_inventories.product_id', '=', 'tbl_products.id')
            ->select(DB::raw('SUM(tbl_inventories.quantity * tbl_products.cost) as total_value'))
            ->value('total_value') ?? 0;
    }

    /**
     * Get low stock count.
     */
    public function getLowStockCount()
    {
        return Inventory::whereRaw('quantity <= low_stock_threshold')->count();
    }

    /**
     * Get top selling products.
     */
    public function getTopSellingProducts($limit = 5)
    {
         return TransactionItem::select('product_name', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();
    }
}
