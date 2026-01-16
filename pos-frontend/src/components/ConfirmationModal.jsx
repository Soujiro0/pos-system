import { AlertTriangle, X, Loader2 } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // danger | primary
    isLoading = false
}) {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-w-25"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all flex items-center justify-center min-w-25 ${isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
