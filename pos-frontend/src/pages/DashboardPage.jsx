import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/analytics/dashboard')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load analytics", err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 font-medium">Loading Overview...</span>
            </div>
        </div>
    );

    if (!data) return <div className="text-center p-8 text-rose-500 font-bold">Failed to load dashboard data.</div>;

    const { today, inventory, top_products } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time business insights for today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Live Updates
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Today's Sales"
                    value={`₱${parseFloat(today.total_sales).toFixed(2)}`}
                    icon={DollarSign}
                    trend="+12% vs yesterday"
                    trendUp={true}
                    gradient="from-emerald-500 to-teal-600"
                />
                <MetricCard
                    title="Net Profit"
                    value={`₱${parseFloat(today.total_profit).toFixed(2)}`}
                    icon={TrendingUp}
                    trend="+8% margin"
                    trendUp={true}
                    gradient="from-indigo-500 to-violet-600"
                />
                <MetricCard
                    title="Transactions"
                    value={today.transaction_count}
                    icon={Package}
                    trend="Steady volume"
                    trendUp={null}
                    gradient="from-blue-500 to-cyan-600"
                />
                <MetricCard
                    title="Low Stock"
                    value={inventory.low_stock_count}
                    icon={AlertCircle}
                    trend="Needs attention"
                    trendUp={false}
                    gradient="from-rose-500 to-pink-600"
                    isAlert={inventory.low_stock_count > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Products */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">Top Selling Products</h2>
                            <p className="text-xs text-gray-400">Ranked by revenue volume</p>
                        </div>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">View Full Report</button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-50">
                                {top_products.map((p, i) => (
                                    <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                                    i === 1 ? 'bg-slate-100 text-slate-600' :
                                                        i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <span className="font-bold text-gray-700">{p.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 font-medium uppercase">Units</span>
                                                <span className="font-semibold text-gray-600">{p.total_quantity}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-400 font-medium uppercase">Revenue</span>
                                                <span className="font-bold text-indigo-600 font-mono">₱{parseFloat(p.total_revenue).toFixed(2)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {top_products.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                            No sales data available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Valuation */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-32 h-32 text-indigo-600" />
                        </div>

                        <h2 className="font-bold text-gray-800 text-lg mb-6 relative z-10">Inventory Valuation</h2>

                        <div className="relative z-10">
                            <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Asset Value</span>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mt-2 tracking-tight">
                                ₱{parseFloat(inventory.valuation).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                <span>Based on purchase cost</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <h3 className="font-bold text-lg mb-4 relative z-10 text-gray-800">System Status</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm text-gray-500 border-b border-gray-100 pb-2">
                                <span>Database</span>
                                <span className="text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    Connected
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500 pb-1">
                                <span>Last Sync</span>
                                <span className="text-gray-900 font-medium">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, trend, trendUp, gradient, isAlert }) {
    return (
        <div className={`relative overflow-hidden p-6 rounded-3xl shadow-sm border border-gray-100 bg-white group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isAlert ? 'ring-2 ring-rose-500 ring-offset-2' : ''}`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trendUp !== null && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendUp ? 'Up' : 'Down'}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h3>
                {trend && <p className="text-xs text-gray-400 mt-2 font-medium">{trend}</p>}
            </div>

            {/* Decorative Background Blob */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
        </div>
    );
}
