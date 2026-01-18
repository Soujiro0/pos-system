import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, Loader2, CheckCircle2, Delete } from 'lucide-react';
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
                product_name: item.product_name,
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
                onSuccess(data);
                onClose();
            },
            onError: (err) => {
                toast.error(err.message);
            }
        });
    };

    const handleNumpadClick = (value) => {
        if (value === 'clear') {
            setAmountTendered('');
        } else if (value === 'backspace') {
            setAmountTendered(prev => prev.slice(0, -1));
        } else if (value === '.') {
            if (!amountTendered.includes('.')) {
                setAmountTendered(prev => prev + '.');
            }
        } else if (value === 'exact') {
            setAmountTendered(totalAmount.toString());
        } else {
            setAmountTendered(prev => prev + value);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-accent/10">
                    <h2 className="text-xl font-bold text-primary">Checkout</h2>
                    <button onClick={onClose} className="p-2 hover:bg-light/50 rounded-full transition-colors text-accent">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column - Payment Details */}
                        <div className="space-y-6">
                            {/* Amount Display */}
                            <div className="text-center space-y-1 bg-light/30 py-6 rounded-xl border border-accent/10">
                                <p className="text-sm text-accent font-medium uppercase tracking-wider">Total Amount</p>
                                <p className="text-4xl font-extrabold text-primary">₱{totalAmount.toFixed(2)}</p>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="text-sm font-medium text-primary mb-3 block">Payment Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-success bg-success/10 text-success' : 'border-accent/20 hover:border-accent/30 text-accent'}`}
                                    >
                                        <Banknote className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Cash</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-accent/20 hover:border-accent/30 text-accent'}`}
                                    >
                                        <CreditCard className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Card</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('digital_wallet')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'digital_wallet' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-accent/20 hover:border-accent/30 text-accent'}`}
                                    >
                                        <Smartphone className="w-6 h-6 mb-1" />
                                        <span className="text-xs font-semibold">Wallet</span>
                                    </button>
                                </div>
                            </div>

                            {/* Amount Tendered Display */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-primary">Amount Tendered</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-semibold">₱</span>
                                    <input
                                        type="text"
                                        readOnly
                                        value={amountTendered}
                                        className="w-full pl-8 pr-4 py-3 bg-white border border-accent/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success transition-all font-mono text-lg font-semibold text-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Change Display */}
                            <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl border border-success/20">
                                <span className="font-medium text-success">Change Due</span>
                                <span className="font-mono font-bold text-xl text-success">₱{change.toFixed(2)}</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={!isValid || isPending}
                                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg shadow-lg transition-all ${!isValid || isPending ? 'bg-light/70 text-accent cursor-not-allowed shadow-none' : 'bg-success hover:bg-success/90 text-white hover:shadow-success/30 transform active:scale-[0.98]'}`}
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

                        {/* Right Column - Numpad */}
                        <div className="bg-light/30 rounded-xl p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleNumpadClick(num.toString())}
                                        className="bg-white hover:bg-light/50 active:bg-light/70 text-primary font-bold py-4 rounded-lg transition-colors shadow-sm border border-accent/10 text-xl"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleNumpadClick('.')}
                                    className="bg-white hover:bg-light/50 active:bg-light/70 text-primary font-bold py-4 rounded-lg transition-colors shadow-sm border border-accent/10 text-xl"
                                >
                                    .
                                </button>
                                <button
                                    onClick={() => handleNumpadClick('0')}
                                    className="bg-white hover:bg-light/50 active:bg-light/70 text-primary font-bold py-4 rounded-lg transition-colors shadow-sm border border-accent/10 text-xl"
                                >
                                    0
                                </button>
                                <button
                                    onClick={() => handleNumpadClick('backspace')}
                                    className="bg-light/70 hover:bg-light active:bg-light/90 text-accent font-bold py-4 rounded-lg transition-colors shadow-sm border border-accent/10 flex items-center justify-center"
                                >
                                    <Delete className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleNumpadClick('clear')}
                                    className="bg-error/10 hover:bg-error/20 active:bg-error/30 text-error font-bold py-4 rounded-lg transition-colors shadow-sm border border-error/20 col-span-2 text-sm"
                                >
                                    CLEAR
                                </button>
                                <button
                                    onClick={() => handleNumpadClick('exact')}
                                    className="bg-success/10 hover:bg-success/20 active:bg-success/30 text-success font-bold py-4 rounded-lg transition-colors shadow-sm border border-success/20 text-sm"
                                >
                                    EXACT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
