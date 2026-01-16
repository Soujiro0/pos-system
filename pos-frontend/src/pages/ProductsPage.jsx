import { useState } from 'react';
import { Plus, Search, Filter, Loader2, Calculator, LayoutGrid, List, MoreHorizontal, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard';
import ProductFormModal from '../components/ProductFormModal';
import InventoryModal from '../components/InventoryModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Pagination from '../components/Pagination';
import PricingSimulator from '../components/PricingSimulator';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [inventoryProduct, setInventoryProduct] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, name: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

    const { data: products, isLoading, isError, error } = useProducts(searchTerm, categoryFilter, currentPage, perPage);
    const deleteMutation = useDeleteProduct();

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleManageStock = (product) => {
        setInventoryProduct(product);
        setIsInventoryModalOpen(true);
    };

    const handleDelete = (id) => {
        const product = products?.data?.find(p => p.id === id);
        setDeleteConfirmation({
            isOpen: true,
            id,
            name: product?.name
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation.id) return;

        try {
            await deleteMutation.mutateAsync(deleteConfirmation.id);
            toast.success('Product deleted successfully');
            setDeleteConfirmation({ isOpen: false, id: null, name: '' });
        } catch (err) {
            toast.error('Failed to delete product');
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSimulatorOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all font-medium"
                    >
                        <Calculator className="w-5 h-5" />
                        <span className="hidden md:inline">Simulate</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm shadow-indigo-200 transition-all font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Search & Filter & View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative grow w-full">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter by category..."
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm shrink-0">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
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
                <>
                    {viewMode === 'grid' ? (
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
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Product</th>
                                        <th className="px-6 py-4 font-semibold">SKU</th>
                                        <th className="px-6 py-4 font-semibold">Category</th>
                                        <th className="px-6 py-4 font-semibold">Price</th>
                                        <th className="px-6 py-4 font-semibold">Stock</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products?.data?.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                        {product.image ? (
                                                            <img src={`http://localhost:8000/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                                            <td className="px-6 py-4 text-gray-500">{product.category || '-'}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">₱{parseFloat(product.price).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 ${(product.inventory?.quantity ?? 0) <= (product.inventory?.low_stock_threshold ?? 10) ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${(product.inventory?.quantity ?? 0) <= (product.inventory?.low_stock_threshold ?? 10) ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    <span className="font-medium">{product.inventory?.quantity ?? 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleManageStock(product)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Manage Stock">
                                                        <Package className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Pagination */}
            {products && (
                <Pagination
                    currentPage={products.current_page}
                    lastPage={products.last_page}
                    onPageChange={setCurrentPage}
                    total={products.total}
                    perPage={perPage}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                    }}
                />
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

            {isSimulatorOpen && (
                <PricingSimulator
                    isOpen={isSimulatorOpen}
                    onClose={() => setIsSimulatorOpen(false)}
                    availableProducts={products?.data || []}
                />
            )}

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, name: '' })}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteConfirmation.name || 'this product'}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
