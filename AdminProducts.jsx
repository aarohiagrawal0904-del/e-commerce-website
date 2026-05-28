import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { Plus, Edit3, Trash2, Sparkles, X, ShoppingBag, Eye, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchProductsAndCats = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/api/products');
      const catRes = await api.get('/api/products/categories/all');
      
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCats();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: p.category_id || '',
      imageUrl: p.image_url
    });
    setIsModalOpen(true);
  };

  // AI Description Generator hook
  const handleAiGenerate = async () => {
    if (!formData.name.trim()) {
      alert('Please fill in the Product Name before triggering AI generation!');
      return;
    }

    const catObj = categories.find(c => String(c.id) === String(formData.categoryId));
    const catName = catObj ? catObj.name : 'General';

    setAiGenerating(true);
    try {
      const res = await api.post('/api/ai/generate-description', {
        productName: formData.name,
        categoryName: catName
      });

      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          description: res.data.description
        }));
      }
    } catch (err) {
      console.error('Gemini description generation failed:', err);
      alert('AI failed to resolve parameters. Please provide a description manually.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === '') {
      alert('Please provide product name, price, and stock limits.');
      return;
    }

    setFormSubmitting(true);
    try {
      let res;
      if (editingId) {
        // Edit product
        res = await api.put(`/api/admin/products/${editingId}`, formData);
      } else {
        // Add product
        res = await api.post('/api/admin/products', formData);
      }

      if (res.data.success) {
        alert(editingId ? 'Product edited successfully!' : 'Product added successfully!');
        setIsModalOpen(false);
        fetchProductsAndCats();
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      alert(err.customMessage || 'Product sync failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (confirm('Are you absolutely sure you want to delete this product? This action is irreversible.')) {
      try {
        const res = await api.delete(`/api/admin/products/${productId}`);
        if (res.data.success) {
          alert('Product deleted successfully.');
          fetchProductsAndCats();
        }
      } catch (err) {
        console.error('Delete product failed:', err);
        alert('Could not delete product.');
      }
    }
  };

  return (
    <div className="min-h-screen flex text-left">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Products</h1>
            <p className="text-xs text-dark-300 mt-1">Add, update stock details, delete listings, and leverage Gemini AI to write descriptions.</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow self-start transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-dark-300 uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4 pl-5">Preview</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-dark-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 pl-5">
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded bg-dark-950 border border-white/5" />
                      </td>
                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="font-bold text-white truncate">{p.name}</div>
                        <p className="text-[10px] text-dark-300 line-clamp-1 mt-0.5">{p.description}</p>
                      </td>
                      <td className="py-4 px-4 font-medium text-dark-200">{p.category_name}</td>
                      <td className="py-4 px-4 font-bold text-white">₹{parseFloat(p.price).toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.stock > 10
                            ? 'bg-green-950/20 text-green-400'
                            : p.stock > 0
                            ? 'bg-yellow-950/20 text-yellow-400'
                            : 'bg-red-950/20 text-red-400'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right pr-5 space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 bg-dark-800 hover:bg-purple-950/20 border border-white/5 hover:border-purple-500/20 text-dark-200 hover:text-purple-400 rounded-lg inline-flex"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-dark-800 hover:bg-red-950/20 border border-white/5 hover:border-red-500/20 text-dark-200 hover:text-red-400 rounded-lg inline-flex"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL DIALOGUE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-purple-950/40 to-dark-900 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-400">
                  <ShoppingBag className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">{editingId ? 'Modify Product' : 'Add New Product'}</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-dark-300 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form Body Scroll */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-dark-200 uppercase tracking-widest pl-0.5">Product Title</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-4 py-2.5 glass-input rounded-xl text-xs"
                    placeholder="Vortex Wireless Mechanical Keyboard"
                    disabled={formSubmitting}
                  />
                </div>

                {/* 2. Category Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-dark-200 uppercase tracking-widest pl-0.5">Store Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="block w-full px-3.5 py-2.5 bg-dark-800 border border-white/5 text-dark-100 rounded-xl text-xs"
                    disabled={formSubmitting}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Description + AI button! */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-0.5">
                    <label className="text-[10px] font-bold text-dark-200 uppercase tracking-widest">Description</label>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || formSubmitting}
                      className="flex items-center space-x-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
                    >
                      {aiGenerating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>{aiGenerating ? 'AI composing...' : '✨ Generate with Gemini'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="block w-full px-4 py-2.5 glass-input rounded-xl text-xs resize-none"
                    placeholder="Provide descriptions or trigger Gemini AI to write custom copywriting optimized for keywords..."
                    disabled={formSubmitting}
                  />
                </div>

                {/* 4. Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-dark-200 uppercase tracking-widest pl-0.5">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="block w-full px-4 py-2.5 glass-input rounded-xl text-xs"
                      placeholder="189.99"
                      disabled={formSubmitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-dark-200 uppercase tracking-widest pl-0.5">Stock Volume</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="block w-full px-4 py-2.5 glass-input rounded-xl text-xs"
                      placeholder="50"
                      disabled={formSubmitting}
                    />
                  </div>
                </div>

                {/* 5. Image Url */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-dark-200 uppercase tracking-widest pl-0.5">Product Image Link</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="block w-full px-4 py-2.5 glass-input rounded-xl text-xs"
                    placeholder="https://unsplash.com/photos/..."
                    disabled={formSubmitting}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={formSubmitting || aiGenerating}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-xl shadow transition duration-200 disabled:opacity-50 mt-6"
                >
                  <span>{formSubmitting ? 'Syncing DB...' : editingId ? 'Update Listing' : 'Publish Product'}</span>
                </button>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminProducts;
