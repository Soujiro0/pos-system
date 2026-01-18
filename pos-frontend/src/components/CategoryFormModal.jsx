import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories';

export default function CategoryFormModal({ category, isOpen, onClose }) {
    const [name, setName] = useState('');
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const isEditing = !!category;
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (category) {
            setName(category.name);
        } else {
            setName('');
        }
    }, [category, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id: category.id, name });
                toast.success('Category updated successfully');
            } else {
                await createMutation.mutateAsync({ name });
                toast.success('Category created successfully');
            }
            onClose();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-accent/10">
                    <h2 className="text-xl font-bold text-primary">
                        {isEditing ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-light/50 rounded-full text-accent transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">Category Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-4 py-2 rounded-lg border border-accent/20 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                            placeholder="e.g. Beverages"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-primary hover:bg-light/50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
