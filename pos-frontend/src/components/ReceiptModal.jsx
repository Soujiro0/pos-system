import { X, Printer, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';

export default function ReceiptModal({ isOpen, onClose, transaction }) {
    if (!isOpen || !transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:overflow-visible receipt-portal">
            <div className="flex min-h-full items-center justify-center p-4 text-center print:p-0 print:block print:min-h-0">
                <div id="receipt-modal-content" className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all animate-in fade-in zoom-in duration-200 print:shadow-none print:w-full print:max-w-none print:rounded-none">

                    {/* Close Button (Hidden on Print) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors print:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 space-y-6 print:p-0">
                        {/* Header */}
                        <div className="text-center space-y-2 border-b border-dashed border-gray-200 pb-6">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 print:hidden">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">POS System</h2>
                            <p className="text-sm text-gray-500">123 Store Address, City, Country</p>
                            <p className="text-xs text-gray-400 mt-1">{transaction.id}</p>
                            <p className="text-xs text-gray-400">{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm a')}</p>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            {transaction.items?.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <div className="flex-1 pr-4">
                                        <p className="font-medium text-gray-900">{item.product_name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                    <span className="font-mono font-medium text-gray-900">₱{parseFloat(item.subtotal).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                            {parseFloat(transaction.discount_amount) > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount</span>
                                    <span>-₱{parseFloat(transaction.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            {parseFloat(transaction.tax_amount) > 0 && (
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Tax</span>
                                    <span>₱{parseFloat(transaction.tax_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                                <span>TOTAL</span>
                                <span>₱{parseFloat(transaction.total_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm print:bg-transparent print:p-0">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Payment Method</span>
                                <span className="font-medium capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tendered</span>
                                <span className="font-medium">₱{parseFloat(transaction.amount_tendered).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Change</span>
                                <span className="font-medium">₱{parseFloat(transaction.change).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-400 pt-4">
                            <p>Thank you for your purchase!</p>
                            <p className="mt-1">Please come again.</p>
                        </div>

                        {/* Actions (Hidden on Print) */}
                        <button
                            onClick={handlePrint}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 print:hidden"
                        >
                            <Printer className="w-5 h-5" />
                            Print Receipt
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors print:hidden"
                        >
                            New Sale
                        </button>
                    </div>
                </div>

                {/* Print Styles */}
                <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    
                    /* Hide everything in the main app */
                    #root { display: none !important; }
                    
                    /* Show only our portal */
                    /* Note: Portals are outside #root, so they remain visible if not hidden by body rules */
                    
                    body {
                        background: white;
                        visibility: visible;
                    }

                    .receipt-portal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white !important;
                        display: block !important;
                        padding: 20px;
                        overflow: visible !important; /* Allow simple flow */
                    }

                    #receipt-modal-content {
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: none !important;
                        transform: none !important;
                    }
                    
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
            </div>
        </div>,
        document.body
    );
}
