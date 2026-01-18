import { useState } from 'react';
import { X, Save, Loader2, ArrowUpCircle, ArrowDownCircle, AlertCircle, History } from 'lucide-react';
import { useInventory, useInventoryAction } from '../hooks/useInventory';
import { toast } from 'sonner';

export default function InventoryModal({ product, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('history');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');

    const { data: inventory, isLoading } = useInventory(product?.id);
    const mutation = useInventoryAction(product?.id);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e, action) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync({
                action, // 'add', 'remove', 'adjust'
                quantity: parseInt(quantity),
                reason
            });
            toast.success(`Stock ${action === 'add' ? 'added' : action === 'remove' ? 'removed' : 'adjusted'} successfully`);
            setQuantity('');
            setReason('');
            setActiveTab('history');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update stock');
        }
    };

    const isLowStock = inventory?.is_low_stock;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-accent/10 flex items-center justify-between bg-light/30/50">
                    <div>
                        <h2 className="text-xl font-bold text-primary">{product.name}</h2>
                        <p className="text-accent text-sm font-mono mt-1">SKU: {product.sku}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-light/50 rounded-full text-accent transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Stock Summary */}
                <div className="p-6 bg-white border-b border-accent/10 flex items-center gap-6">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-accent mb-1">Current Stock</p>
                        <div className="flex items-center gap-3">
                            <span className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-primary'}`}>
                                {inventory?.quantity ?? '...'}
                            </span>
                            {isLowStock && (
                                <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full border border-red-100 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Low Stock
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-light/50 p-1 rounded-lg">
                        {['history', 'add', 'remove', 'adjust'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-accent hover:text-primary'
                                    } capitalize`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-primary mb-4 flex items-center gap-2">
                                        <History className="w-4 h-4 text-accent" />
                                        Recent Transactions
                                    </h3>
                                    {inventory?.transactions?.length > 0 ? (
                                        <div className="space-y-3">
                                            {inventory.transactions.map((tx) => (
                                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-accent/10 hover:border-accent/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${tx.type === 'in' ? 'bg-green-50 text-green-600' :
                                                                tx.type === 'out' ? 'bg-red-50 text-red-600' :
                                                                    'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {tx.type === 'in' ? <ArrowUpCircle className="w-5 h-5" /> :
                                                                tx.type === 'out' ? <ArrowDownCircle className="w-5 h-5" /> :
                                                                    <Edit2 className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-primary capitalize">{tx.type} ({tx.reason})</p>
                                                            <p className="text-xs text-accent">{new Date(tx.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-mono font-medium ${tx.type === 'in' ? 'text-green-600' :
                                                            tx.type === 'out' ? 'text-red-600' : 'text-blue-600'
                                                        }`}>
                                                        {tx.type === 'in' ? '+' : tx.type === 'out' ? '-' : ''}{tx.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center italic py-8">No transaction history found.</p>
                                    )}
                                </div>
                            )}

                            {['add', 'remove', 'adjust'].includes(activeTab) && (
                                <form onSubmit={(e) => handleSubmit(e, activeTab)} className="max-w-md mx-auto space-y-5 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">
                                            {activeTab === 'adjust' ? 'New Total Quantity' : 'Quantity'}
                                        </label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2 rounded-lg border border-accent/20 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-primary mb-1">Reason</label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows="2"
                                            className="w-full px-4 py-2 rounded-lg border border-accent/20 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary resize-none"
                                            placeholder={`Why are you ${activeTab === 'add' ? 'adding' : activeTab === 'remove' ? 'removing' : 'adjusting'} stock?`}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className={`w-full py-2.5 rounded-lg font-medium text-white shadow-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'add' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' :
                                                activeTab === 'remove' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                            }`}
                                    >
                                        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        <span className="capitalize">Confirm {activeTab}</span>
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper icon
function Edit2(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    )
}
