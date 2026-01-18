import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, RefreshCcw, LayoutGrid, List, Keyboard } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/useCartStore';
import { useCalculateCart } from '../hooks/usePricing';
import { useHotkeys } from '../hooks/useHotkeys';
import ConfirmationModal from '../components/ConfirmationModal';
import CheckoutModal from '../components/CheckoutModal';
import ReceiptModal from '../components/ReceiptModal';

export default function TerminalPage() {
    const [selectedCategory, setSelectedCategory] = useState(null); // null = All
    const [searchTerm, setSearchTerm] = useState('');
    const [isClearCartOpen, setIsClearCartOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [initialPaymentMethod, setInitialPaymentMethod] = useState('cash');
    const searchInputRef = useRef(null);

    // Fetch Data
    const { data: categoriesData } = useCategories();

    const { data: productsData, isLoading: isProductsLoading } = useProducts(
        searchTerm,
        selectedCategory?.slug || '',
        1,
        100
    );

    // Cart Store
    const {
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totals,
        setTotals
    } = useCartStore();

    const calculateMutation = useCalculateCart();

    const handleClearCart = () => {
        if (cartItems.length > 0) {
            setIsClearCartOpen(true);
        }
    };

    const confirmClearCart = () => {
        clearCart();
        setIsClearCartOpen(false);
    };

    const handleCheckout = (method = 'cash') => {
        if (cartItems.length === 0) return;
        setInitialPaymentMethod(method);
        setIsCheckoutOpen(true);
    };

    const handleTransactionSuccess = (transaction) => {
        setLastTransaction(transaction);
        setIsCheckoutOpen(false);
        setIsReceiptOpen(true);
        clearCart();
    };

    useHotkeys({
        'f2': () => searchInputRef.current?.focus(),
        'f4': handleClearCart,
        'escape': () => {
            setSearchTerm('');
            setSelectedCategory(null);
            setIsClearCartOpen(false);
            setIsShortcutsOpen(false);
            searchInputRef.current?.blur();
        },
        'enter': () => {
            // 1. If Clear Cart Modal is open, confirm it
            if (isClearCartOpen) {
                confirmClearCart();
                return;
            }

            // 2. If searching, add first result
            if (searchTerm && products.length > 0) {
                const firstProduct = products[0];
                addItem(firstProduct);
                setSearchTerm('');
                // Optional: toast.success(`Added ${firstProduct.name}`);
            }
        }
    });

    // Trigger calculation when cart items change
    useEffect(() => {
        if (cartItems.length === 0) {
            setTotals({ subtotal: 0, tax: 0, discount: 0, total: 0 });
            return;
        }

        const payload = {
            items: cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        calculateMutation.mutate(payload, {
            onSuccess: (data) => {
                setTotals({
                    subtotal: data.subtotal || 0,
                    tax: data.tax_total || 0,
                    discount: data.discount_total || 0,
                    total: data.grand_total || 0
                });
            },
            onError: (error) => {
                console.error("Calculation failed:", error);
            }
        });
    }, [cartItems, setTotals]);

    const categories = categoriesData || [];
    const products = productsData?.data || [];
    // Use totals from store instead of local calculation
    // Default to 0 if propery is missing (e.g. from stale localStorage)
    const subtotal = totals?.subtotal || 0;
    const tax = totals?.tax || 0;
    const total = totals?.total || 0;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* LEFT MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Header / Search */}
                <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search products... (F2)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:outline-none text-gray-900 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setIsShortcutsOpen(true)}
                        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Keyboard Shortcuts"
                    >
                        <Keyboard className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Categories Sidebar */}
                    <div className="w-24 lg:w-28 flex flex-col items-center py-6 space-y-3 overflow-y-auto border-r border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all w-20 h-20 gap-1.5 ${!selectedCategory
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-2'
                                : 'text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                                }`}
                        >
                            <div className={`p-1.5 rounded-full ${!selectedCategory ? 'bg-white/20' : 'bg-gray-100'}`}>
                                <Search className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wide">All</span>
                        </button>

                        <div className="w-16 h-px bg-gray-200 my-2" />

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-20 h-20 gap-1 ${selectedCategory?.id === cat.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-2'
                                    : 'text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                                    }`}
                            >
                                <span className="text-xl">{cat.icon || cat.name.charAt(0)}</span>
                                <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 px-1">
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 p-6 overflow-y-scroll bg-gray-50">
                        {isProductsLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
                                Loading products...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                                {products.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addItem(product)}
                                        className="group bg-white rounded-2xl border border-gray-200 p-3 flex flex-col items-start hover:border-indigo-600 hover:ring-2 hover:ring-indigo-600/20 hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden h-full"
                                    >
                                        <div className="w-full aspect-4/3 bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <span className="text-2xl font-bold opacity-30">#</span>
                                                </div>
                                            )}

                                            {/* Stock Badge */}
                                            {(product.inventory?.quantity || 0) < 10 && (
                                                <div className="absolute top-2 left-2 bg-rose-500/90 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                                    {product.inventory?.quantity} Left
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight mb-auto group-hover:text-indigo-600 px-1">
                                            {product.name}
                                        </h3>

                                        <div className="w-full pt-3 mt-2 flex items-center justify-between border-t border-gray-50">
                                            <span className="font-bold text-lg text-indigo-600">₱{Number(product.price).toFixed(2)}</span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR - CART */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-30 relative">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">Current Sale</h2>
                        <span className="text-xs text-gray-400 font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all"
                        title="Clear Cart (F4)"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                <CreditCard className="w-8 h-8 opacity-30" />
                            </div>
                            <p className="text-sm font-medium">Cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100 group hover:border-indigo-200 transition-all">
                                <div className="flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-6 h-6 rounded bg-white shadow-sm text-gray-600 hover:text-indigo-600 hover:shadow flex items-center justify-center transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <span className="font-bold text-sm w-6 text-center text-gray-800">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-6 h-6 rounded bg-white shadow-sm text-gray-600 hover:text-rose-600 hover:shadow flex items-center justify-center transition-all"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
                                            {item.name}
                                        </h4>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="ml-2 text-gray-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs text-gray-500">
                                            ₱{Number(item.price).toFixed(2)} / unit
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            ₱{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Totals */}
                <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-20">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-gray-900">₱{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-medium text-gray-900">₱{tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-100 my-2" />
                        <div className="flex justify-between items-end">
                            <span className="text-base font-bold text-gray-800">Total</span>
                            <span className="text-3xl font-extrabold text-indigo-600 leading-none">₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleCheckout('card')}
                            disabled={cartItems.length === 0}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CreditCard className="w-5 h-5" />
                            Card
                        </button>
                        <button
                            onClick={() => handleCheckout('cash')}
                            disabled={cartItems.length === 0}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Pay Cash
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isClearCartOpen}
                onClose={() => setIsClearCartOpen(false)}
                onConfirm={confirmClearCart}
                title="Clear Cart"
                message="Are you sure you want to remove all items from the cart? This action cannot be undone."
                confirmText="Clear Cart"
                cancelText="Keep Items"
                variant="danger"
            />

            {/* Keyboard Shortcuts Modal */}
            {isShortcutsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Keyboard className="w-6 h-6 text-indigo-600" />
                                Keyboard Shortcuts
                            </h3>
                            <button onClick={() => setIsShortcutsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <Minus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'F2', action: 'Search Products' },
                                { key: 'Enter', action: 'Add First Found Product' },
                                { key: 'F4', action: 'Clear Cart' },
                                { key: 'Esc', action: 'Clear Search / Cancel' },
                            ].map((shortcut) => (
                                <div key={shortcut.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-600 font-medium">{shortcut.action}</span>
                                    <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 shadow-sm min-w-12 text-center">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400">Pro Tip: Use Enter to quickly add searched items.</p>
                        </div>
                    </div>
                </div>
            )}

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartData={{
                    items: cartItems.map(item => ({
                        product_id: item.id,
                        product_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: (item.price * item.quantity),
                        sku: item.sku || 'N/A' // Ensure SKU is handled if missing
                    })),
                    total: total,
                    breakdown: {
                        total_tax: tax,
                        total_discount: totals?.discount || 0
                    }
                }}
                onSuccess={handleTransactionSuccess}
                initialPaymentMethod={initialPaymentMethod} // Pass this if CheckoutModal supports it
            />

            <ReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                transaction={lastTransaction}
            />
        </div>
    );
}
