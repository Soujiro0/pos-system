<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AnalyticsService;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected $analytics;

    public function __construct(AnalyticsService $analytics)
    {
        $this->analytics = $analytics;
    }

    public function dashboard(Request $request)
    {
        $today = Carbon::today()->toDateString();
        $dailyData = $this->analytics->calculateDailySummary($today);
        
        return response()->json([
            'today' => $dailyData ?? [
                'total_sales' => 0,
                'total_profit' => 0,
                'transaction_count' => 0
            ],
            'inventory' => [
                'low_stock_count' => $this->analytics->getLowStockCount(),
                'valuation' => $this->analytics->getInventoryValuation()
            ],
            'top_products' => $this->analytics->getTopSellingProducts(5)
        ]);
    }

    public function sales(Request $request)
    {
        $start = $request->query('start_date', Carbon::now()->subDays(30)->toDateString());
        $end = $request->query('end_date', Carbon::now()->toDateString());
        
        return response()->json(
            $this->analytics->getSalesSummary($start, $end)
        );
    }
}
