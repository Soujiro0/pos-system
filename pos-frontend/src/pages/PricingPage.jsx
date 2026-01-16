import { useState } from 'react';
import { Plus, Tag, Percent, History, Loader2, ArrowRight } from 'lucide-react';
import { useTaxes, useCreateTax, useDiscounts, useCreateDiscount, usePriceLogs } from '../hooks/useAdminPricing';
import { toast } from 'sonner';

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState('taxes');

    return (
        <div className="space-y-6">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100 max-w-fit">
                {['taxes', 'discounts', 'logs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        {tab === 'logs' ? 'Price History' : tab}
                    </button>
                ))}
            </div>

            {activeTab === 'taxes' && <TaxSection />}
            {activeTab === 'discounts' && <DiscountSection />}
            {activeTab === 'logs' && <LogsSection />}
        </div>
    );
}

const inputClassName = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none hover:bg-white";
const labelClassName = "block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide";
const buttonClassName = "w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-700 transition-all transform active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed";

function TaxSection() {
    const { data: taxes, isLoading } = useTaxes();
    const createTax = useCreateTax();
    const [form, setForm] = useState({ name: '', percentage: '', type: 'exclusive', category: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTax.mutateAsync(form);
            toast.success('Tax rate created');
            setForm({ name: '', percentage: '', type: 'exclusive', category: '' });
        } catch (err) {
            toast.error('Failed to create tax');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Rate</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-6 text-center"><Loader2 className="animate-spin mx-auto w-5 h-5 text-indigo-500" /></td></tr>
                            ) : taxes?.map(tax => (
                                <tr key={tax.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tax.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-xs font-bold">{tax.percentage}%</span>
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${tax.type === 'inclusive' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {tax.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{tax.category || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                        <Plus className="w-4 h-4" />
                    </div>
                    Add Tax Rate
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClassName}>Name</label>
                        <input required className={inputClassName} placeholder="e.g. VAT" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClassName}>Percentage (%)</label>
                        <input required type="number" step="0.01" className={inputClassName} placeholder="12" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClassName}>Type</label>
                        <div className="relative">
                            <select className={`${inputClassName} appearance-none cursor-pointer`} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="exclusive">Exclusive</option>
                                <option value="inclusive">Inclusive</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClassName}>Category <span className="text-gray-400 font-normal lowercase ml-1">(Optional)</span></label>
                        <input className={inputClassName} placeholder="e.g. Essentials" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                    </div>
                    <button disabled={createTax.isPending} className={buttonClassName}>
                        {createTax.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Tax Rate'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function DiscountSection() {
    const { data: discounts, isLoading } = useDiscounts();
    const createDiscount = useCreateDiscount();
    const [form, setForm] = useState({
        code: '', type: 'percent', value: '',
        min_quantity: 0, priority: 0,
        is_stackable: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createDiscount.mutateAsync({
                ...form,
                value: parseFloat(form.value),
                min_quantity: parseInt(form.min_quantity),
                priority: parseInt(form.priority)
            });
            toast.success('Discount created');
            setForm({ code: '', type: 'percent', value: '', min_quantity: 0, priority: 0, is_stackable: false });
        } catch (err) {
            toast.error('Failed to create discount');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isLoading ? <Loader2 className="animate-spin text-indigo-500" /> : discounts?.map(discount => (
                        <div key={discount.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow group">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-sm font-bold font-mono tracking-tight border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                        {discount.code || 'AUTO-APPLY'}
                                    </span>
                                    <span className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded">Priority: {discount.priority}</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                                    {discount.type === 'percent' ? `${discount.value}% OFF` : `₱${discount.value} OFF`}
                                </div>
                                <div className="text-sm text-gray-500 space-y-1.5 pt-2 border-t border-gray-50">
                                    {discount.min_quantity > 0 && <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Min Qty: <span className="font-semibold text-gray-700">{discount.min_quantity}</span></p>}
                                    {discount.is_stackable && <p className="text-indigo-600 flex items-center gap-1.5 font-medium"><Tag className="w-3.5 h-3.5" /> Stackable</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                        <Plus className="w-4 h-4" />
                    </div>
                    Add Discount
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClassName}>Code <span className="text-gray-400 font-normal lowercase ml-1">(Optional)</span></label>
                        <input className={`${inputClassName} font-mono uppercase tracking-wider`} placeholder="SUMMER2025" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-gray-400" /> Leave empty for automatic discount</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClassName}>Type</label>
                            <div className="relative">
                                <select className={`${inputClassName} appearance-none cursor-pointer`} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="percent">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className={labelClassName}>Value</label>
                            <input required type="number" step="0.01" className={inputClassName} placeholder="10" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClassName}>Min Qty</label>
                            <input type="number" className={inputClassName} value={form.min_quantity} onChange={e => setForm({ ...form, min_quantity: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClassName}>Priority</label>
                            <input type="number" className={inputClassName} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setForm({ ...form, is_stackable: !form.is_stackable })}>
                        <input type="checkbox" id="stackable" checked={form.is_stackable} onChange={() => { }} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                        <label htmlFor="stackable" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Stackable with other discounts</label>
                    </div>
                    <button disabled={createDiscount.isPending} className={buttonClassName}>
                        {createDiscount.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Discount'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function LogsSection() {
    const { data: logs, isLoading } = usePriceLogs();

    if (isLoading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto w-8 h-8 text-indigo-500" /></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Product</th>
                        <th className="px-6 py-4 font-semibold">Old Price</th>
                        <th className="px-6 py-4 font-semibold">New Price</th>
                        <th className="px-6 py-4 font-semibold">Reason</th>
                        <th className="px-6 py-4 font-semibold">User ID</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs?.data?.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {log.product?.name || 'Unknown Product'}
                            </td>
                            <td className="px-6 py-4 text-gray-400 line-through">₱{log.old_amount}</td>
                            <td className="px-6 py-4 font-bold text-indigo-600">₱{log.new_amount}</td>
                            <td className="px-6 py-4 text-gray-600">
                                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700 border border-gray-200">{log.reason}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-400">#{log.changed_by || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
