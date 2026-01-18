import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 font-medium">Loading Overview...</span>
            </div>
        </div>
    );

    if (!data) return <div className="text-center p-8 text-rose-500 font-bold">Failed to load dashboard data.</div>;

    const { today, inventory, top_products, sales_trend } = data;

    // Format sales trend for chart
    const chartData = sales_trend ? sales_trend.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: parseFloat(item.sales),
        profit: parseFloat(item.profit)
    })) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Dashboard Overview</h1>
                    <p className="text-accent mt-1">Real-time business insights for today.</p>
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
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <MetricCard
                    title="Net Profit"
                    value={`₱${parseFloat(today.total_profit).toFixed(2)}`}
                    icon={TrendingUp}
                    trend="+8% margin"
                    trendUp={true}
                    color="text-secondary"
                    bg="bg-secondary/10"
                />
                <MetricCard
                    title="Transactions"
                    value={today.transaction_count}
                    icon={Package}
                    trend="Steady volume"
                    trendUp={null}
                    color="text-secondary"
                    bg="bg-secondary/10"
                />
                <MetricCard
                    title="Low Stock"
                    value={inventory.low_stock_count}
                    icon={AlertCircle}
                    trend="Needs attention"
                    trendUp={false}
                    color="text-rose-600"
                    bg="bg-rose-50"
                    isAlert={inventory.low_stock_count > 0}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="bg-white rounded-3xl shadow-sm border border-accent/10 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-bold text-primary text-lg">Sales</h2>
                            <p className="text-xs text-gray-400">Revenue for the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value) => `₱${parseFloat(value).toFixed(2)}`}
                                />
                                <Bar dataKey="sales" name="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Net Profit Chart */}
                <div className="bg-white rounded-3xl shadow-sm border border-accent/10 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-bold text-primary text-lg">Net Profit</h2>
                            <p className="text-xs text-gray-400">Profit for the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value) => `₱${parseFloat(value).toFixed(2)}`}
                                />
                                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Row */}
            <div className="grid grid-cols-1 gap-8">
                {/* Top Products */}
                <div className="bg-white rounded-3xl shadow-sm border border-accent/10 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 bg-light/30/30">
                        <h2 className="font-bold text-primary text-lg">Top Products</h2>
                        <p className="text-xs text-gray-400">Best performers this week</p>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-50">
                                {top_products.map((p, i) => (
                                    <tr key={i} className="group hover:bg-light/30/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                                    i === 1 ? 'bg-slate-100 text-slate-600' :
                                                        i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-light/30 text-gray-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-primary text-sm">{p.product_name}</span>
                                                    <span className="text-xs text-gray-400">{p.total_quantity} units</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-secondary font-mono text-sm">₱{parseFloat(p.total_revenue).toFixed(0)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, trend, trendUp, color, bg, isAlert }) {
    return (
        <div className={`relative overflow-hidden p-6 rounded-3xl shadow-sm border border-accent/10 bg-white group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${isAlert ? 'ring-2 ring-rose-500 ring-offset-2' : ''}`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-sm`}>
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
                <p className="text-sm font-medium text-accent mb-1">{title}</p>
                <h3 className="text-2xl font-black text-primary tracking-tight">{value}</h3>
                {trend && <p className="text-xs text-gray-400 mt-2 font-medium">{trend}</p>}
            </div>
        </div>
    );
}
