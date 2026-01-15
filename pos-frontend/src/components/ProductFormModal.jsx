import { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';

export default function ProductFormModal({ product, isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        sku: '',
        barcode: '',
        category: '',
        description: '',
        image_url: '',
    });
    const [attributes, setAttributes] = useState([]);

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const isEditing = !!product;
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                sku: product.sku || '',
                barcode: product.barcode || '',
                category: product.category || '',
                description: product.description || '',
                image_url: product.image_url || '',
            });
            setAttributes(Object.entries(product.attributes || {}).map(([key, value]) => ({ key, value })));
        } else {
            setFormData({
                name: '',
                price: '',
                sku: '',
                barcode: '',
                category: '',
                description: '',
                image_url: '',
            });
            setAttributes([]);
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAttribute = () => {
        setAttributes([...attributes, { key: '', value: '' }]);
    };

    const handleRemoveAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = value;
        setAttributes(newAttributes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...formData };

        // Clean up empty strings
        if (!data.sku) delete data.sku;
        if (!data.barcode) delete data.barcode;
        if (!data.image_url) delete data.image_url;

        // Convert attributes array to object
        data.attributes = attributes.reduce((acc, curr) => {
            if (curr.key.trim()) {
                acc[curr.key.trim()] = curr.value;
            }
            return acc;
        }, {});

        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id: product.id, ...data });
                toast.success('Product updated successfully');
            } else {
                await createMutation.mutateAsync(data);
                toast.success('Product created successfully');
            }
            onClose();
        } catch (error) {
            console.error("Failed to save product:", error);
            toast.error(`Failed to save: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="e.g. Wireless Mouse"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Price *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="e.g. Electronics"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Image URL</label>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">SKU (Optional)</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="Leave blank to auto-generate"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Barcode</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="Scan barcode..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                            placeholder="Product description..."
                        ></textarea>
                    </div>

                    {/* Attributes Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Attributes</label>
                            <button
                                type="button"
                                onClick={handleAddAttribute}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Attribute</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {attributes.map((attr, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={attr.key}
                                        onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                        placeholder="Name (e.g. Color)"
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                    <input
                                        type="text"
                                        value={attr.value}
                                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                        placeholder="Value (e.g. Red)"
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttribute(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {attributes.length === 0 && (
                                <p className="text-sm text-gray-400 italic text-center py-2 border border-dashed border-gray-200 rounded-lg">
                                    No attributes added. Click "Add Attribute" to define custom properties.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
