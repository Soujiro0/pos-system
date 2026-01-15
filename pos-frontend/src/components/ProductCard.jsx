import { Edit2, Trash2, Package } from 'lucide-react';

export default function ProductCard({ product, onEdit, onDelete }) {
    return (
        <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
            <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                        }}
                    />
                ) : (
                    <Package className="w-12 h-12 text-gray-300" />
                )}

                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {product.sku}
                        </p>
                    </div>
                    <span className="font-bold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                    </span>
                </div>

                {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 grow">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                        {product.category || 'Uncategorized'}
                    </span>
                    {product.barcode && (
                        <span className="text-gray-400 font-mono">
                            {product.barcode}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
