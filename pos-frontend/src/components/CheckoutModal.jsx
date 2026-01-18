import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCheckout } from '../hooks/useTransactions';

export default function CheckoutModal({ isOpen, onClose, cartData, onSuccess, initialPaymentMethod = 'cash' }) {
    const [amountTendered, setAmountTendered] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
    const { mutate: checkout, isPending } = useCheckout();

    const totalAmount = parseFloat(cartData?.total || 0);
    const change = Math.max(0, (parseFloat(amountTendered) || 0) - totalAmount);
    const isValid = (parseFloat(amountTendered) || 0) >= totalAmount;

    useEffect(() => {
        if (isOpen) {
            setAmountTendered('');
            setPaymentMethod(initialPaymentMethod);
        }
    }, [isOpen, initialPaymentMethod]);

    if (!isOpen) return null;

    const handleCheckout = () => {
        if (!isValid) return;

        const payload = {
            items: cartData.items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name, // You might need to add name to simulation item or fetch it
                sku: item.sku,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            total_amount: totalAmount,
            tax_amount: cartData.breakdown?.total_tax || 0,
            discount_amount: cartData.breakdown?.total_discount || 0,
            amount_tendered: parseFloat(amountTendered),
            change: change,
            payment_method: paymentMethod
        };

        checkout(payload, {
            onSuccess: (data) => {
                toast.success('Transaction Completed!');
                onSuccess(data); // Pass transaction data to parent (for Receipt)
                onClose();
            },
            onError: (err) => {
                toast.error(err.message);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Amount Display */}
                    <div className="text-center space-y-1 bg-gray-50 py-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Amount</p>
                        <p className="text-4xl font-extrabold text-gray-900">₱{totalAmount.toFixed(2)}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                        >
                            <Banknote className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Cash</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                        >
                            <CreditCard className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Card</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('digital_wallet')}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'digital_wallet' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                        >
                            <Smartphone className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">E-Wallet</span>
                        </button>
                    </div>

                    {/* Amount Tendered Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Amount Tendered</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₱</span>
                            <input
                                type="number"
                                autoFocus
                                value={amountTendered}
                                onChange={(e) => setAmountTendered(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-lg font-semibold"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Change Display */}
                    <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="font-medium text-emerald-900">Change Due</span>
                        <span className="font-mono font-bold text-xl text-emerald-700">₱{change.toFixed(2)}</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={!isValid || isPending}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-emerald-200 transition-all ${!isValid || isPending ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-300 transform active:scale-[0.98]'}`}
                    >
                        {isPending ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                <span>Complete Payment</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
