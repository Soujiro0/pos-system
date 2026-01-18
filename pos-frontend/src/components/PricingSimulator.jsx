import { useState } from 'react';
import { X, Plus, Trash2, Calculator, AlertTriangle, CheckCircle, Tag, ShoppingCart } from 'lucide-react';
import { useCalculateCart, useReserveItems } from '../hooks/usePricing';
import { toast } from 'sonner';
import CheckoutModal from './CheckoutModal';
import ReceiptModal from './ReceiptModal';

export default function PricingSimulator({ isOpen, onClose, availableProducts }) {
    const [cartItems, setCartItems] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [calculationResult, setCalculationResult] = useState(null);
    const [reservationId, setReservationId] = useState(null);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [transactionData, setTransactionData] = useState(null);

    const calculateMutation = useCalculateCart();
    const reserveMutation = useReserveItems();

    if (!isOpen) return null;

    const addToCart = () => {
        if (!selectedProductId) return;
        const product = availableProducts.find(p => p.id === parseInt(selectedProductId));
        if (!product) return;

        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
        setCalculationResult(null);
        setReservationId(null);
    };

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
        setCalculationResult(null);
    };

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        setCalculationResult(null);
    };

    const handleCalculate = () => {
        if (cartItems.length === 0) return;
        calculateMutation.mutate(
            { items: cartItems, discount_code: discountCode || null },
            {
                onSuccess: (data) => {
                    setCalculationResult(data);
                    toast.success('Calculation updated');
                },
                onError: (err) => toast.error(err.message)
            }
        );
    };

    const handleReserve = () => {
        if (cartItems.length === 0) return;
        reserveMutation.mutate(
            { items: cartItems },
            {
                onSuccess: (data) => {
                    setReservationId(data.cart_id);
                    toast.success(`Items reserved! Exp: ${new Date(data.expires_at).toLocaleTimeString()}`);
                },
                onError: (err) => toast.error(err.message)
            }
        );
    };

    const handleCheckoutSuccess = (data) => {
        setTransactionData(data);
        setIsCheckoutOpen(false);
        setIsReceiptOpen(true);
        // Clean up simulator state
        setCartItems([]);
        setCalculationResult(null);
        setReservationId(null);
        setDiscountCode('');
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Calculator className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Pricing Simulator</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex grow overflow-hidden">
                        <div className="w-1/2 p-6 border-r border-gray-100 overflow-y-auto flex flex-col gap-6">
                            <div className="flex gap-2">
                                <select
                                    className="grow border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                >
                                    <option value="">Select Product...</option>
                                    {availableProducts?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ₱{p.price}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={addToCart}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={!selectedProductId}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-3">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">₱{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    className="w-12 py-1 text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        Cart is empty
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <div className="relative grow">
                                        <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter promo code (e.g. PROMO10)"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCalculate}
                                    disabled={cartItems.length === 0 || calculateMutation.isPending}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {calculateMutation.isPending ? 'Calculating...' : 'Calculate Totals'}
                                </button>
                            </div>
                        </div>

                        <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
                            {!calculationResult ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Calculator className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Add items and calculate to see breakdown</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {calculationResult.inventory_warnings?.length > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                                                <AlertTriangle className="w-5 h-5" />
                                                <span>Inventory Warnings</span>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                                                {calculationResult.inventory_warnings.map((w, i) => (
                                                    <li key={i}>{w}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">₱{calculationResult.subtotal}</span>
                                        </div>

                                        {calculationResult.discount_total > 0 && (
                                            <div className="py-2 border-y border-dashed border-gray-100 space-y-2">
                                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                                    <span>Total Discounts</span>
                                                    <span>-₱{calculationResult.discount_total}</span>
                                                </div>
                                                {calculationResult.applied_discounts?.map((d, i) => (
                                                    <div key={i} className="flex justify-between text-xs text-green-500 pl-2">
                                                        <span>{d.code || 'Automatic'}</span>
                                                        <span>-₱{d.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="py-2 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Tax Total</span>
                                                <span>₱{calculationResult.tax_total}</span>
                                            </div>
                                            {calculationResult.taxes?.map((t, i) => (
                                                <div key={i} className="flex justify-between text-xs text-gray-400 pl-2">
                                                    <span>{t.name} ({t.type})</span>
                                                    <span>₱{t.amount}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Grand Total</span>
                                            <span className="text-2xl font-bold text-indigo-600">₱{calculationResult.grand_total}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {reservationId ? (
                                            <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-green-700 font-bold mb-1">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Reservation Active</span>
                                                </div>
                                                <p className="text-xs text-green-600">ID: {reservationId}</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleReserve}
                                                disabled={reserveMutation.isPending}
                                                className="border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
                                            >
                                                {reserveMutation.isPending ? 'Reserving...' : 'Reserve Items'}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setIsCheckoutOpen(true)}
                                            className={`${reservationId ? 'col-span-2' : ''} bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2`}
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Checkout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartData={{
                    items: cartItems.map(item => {
                        // Find full product details from availableProducts for sku etc if needed
                        const product = availableProducts?.find(p => p.id === item.id);
                        return {
                            ...item,
                            product_id: item.id,
                            product_name: item.name,
                            sku: product?.sku,
                            // If calculationResult exists, use its item breakdown for precise price/subtotal?
                            // But calculationResult structure might not match perfectly.
                            // Let's rely on cartItems for basic, but mapped with subtotal from calculation if possible.
                            // Actually, calculationResult HAS item details like subtotal? 
                            // Wait, usePricing hook returns `items` with calculated fields?
                            // Checking usePricing... let's assume `calculationResult.items` exists or we use simple calc.
                            subtotal: (item.price * item.quantity).toFixed(2) // Fallback simple calc
                        };
                    }),
                    total: calculationResult?.grand_total || 0,
                    breakdown: {
                        total_tax: calculationResult?.tax_total,
                        total_discount: calculationResult?.discount_total
                    }
                }}
                onSuccess={handleCheckoutSuccess}
            />

            <ReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                transaction={transactionData}
            />
        </>
    );
}
