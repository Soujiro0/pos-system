import { useState } from 'react';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard';
import ProductFormModal from '../components/ProductFormModal';
import InventoryModal from '../components/InventoryModal';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [inventoryProduct, setInventoryProduct] = useState(null);

    const { data: products, isLoading, isError, error } = useProducts(searchTerm, categoryFilter);
    const deleteMutation = useDeleteProduct();

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleManageStock = (product) => {
        setInventoryProduct(product);
        setIsInventoryModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Product deleted successfully');
            } catch (err) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleCloseInventoryModal = () => {
        setIsInventoryModalOpen(false);
        setInventoryProduct(null);
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm">Manage your product catalog</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-200 transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative grow">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="relative min-w-50">
                    <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by category..."
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : isError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                    Error loading products: {error.message}
                </div>
            ) : products?.data?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search or add a new product.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products?.data?.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onManageStock={handleManageStock}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <ProductFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    product={editingProduct}
                />
            )}

            {/* Inventory Modal */}
            {isInventoryModalOpen && (
                <InventoryModal
                    isOpen={isInventoryModalOpen}
                    onClose={handleCloseInventoryModal}
                    product={inventoryProduct}
                />
            )}
        </div>
    );
}
