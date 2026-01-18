import { useState } from 'react';
import { Plus, Search, Loader2, Edit, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import CategoryFormModal from '../components/CategoryFormModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useCategories, useDeleteCategory } from '../hooks/useCategories';

export default function CategoriesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, id: null, name: '' });

    const { data: categories, isLoading, isError, error } = useCategories();
    const deleteMutation = useDeleteCategory();

    const handleEdit = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (category) => {
        setDeleteConfirmation({
            isOpen: true,
            id: category.id,
            name: category.name
        });
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(deleteConfirmation.id);
            toast.success('Category deleted successfully');
            setDeleteConfirmation({ isOpen: false, id: null, name: '' });
        } catch (error) {
            toast.error(error.message || 'Failed to delete category');
        }
    };

    const filteredCategories = categories?.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Categories</h1>
                    <p className="text-accent text-sm">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-secondary/20 transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Category</span>
                </button>
            </div>

            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/50" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                </div>
            ) : isError ? (
                <div className="bg-error/10 text-error p-4 rounded-lg text-center">
                    Error loading categories: {error.message}
                </div>
            ) : filteredCategories?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-accent/10 border-dashed">
                    <div className="w-16 h-16 bg-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Tag className="w-8 h-8 text-accent/50" />
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-1">No categories found</h3>
                    <p className="text-accent">Try adding a new category.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-accent/10 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-light/30 border-b border-accent/10 text-accent uppercase tracking-wider text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/5">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-light/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary font-bold text-xs">
                                                {category.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-primary">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-accent font-mono text-xs">{category.slug}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-2 text-accent hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                                                title="Edit Category"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(category)}
                                                className="p-2 text-accent hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                                title="Delete Category"
                                            >
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

            <CategoryFormModal
                isOpen={isModalOpen}
                category={editingCategory}
                onClose={() => setIsModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, name: '' })}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
