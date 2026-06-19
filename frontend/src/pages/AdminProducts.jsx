import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [error, setError] = useState('');

  const fetchCatalog = async () => {
    try {
      const pRes = await axios.get('/api/products');
      const cRes = await axios.get('/api/categories');
      setProducts(pRes.data);
      setCategories(cRes.data);
      if (cRes.data.length > 0) setCategoryId(cRes.data[0].id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsAvailable(true);
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setImageUrl(p.imageUrl);
    setCategoryId(p.category.id);
    setIsAvailable(p.available);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !categoryId) {
      setError('Please fill in name, price, and category.');
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80',
      categoryId: Number(categoryId),
      isAvailable
    };

    try {
      if (editingProduct) {
        const response = await axios.put(`/api/products/${editingProduct.id}`, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? response.data : p));
      } else {
        const response = await axios.post('/api/products', payload);
        setProducts(prev => [response.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from the menu?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete product.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-gray-400">Loading catalog...</div>;
  }

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-coffee-950 font-serif">Menu Catalog Control</h2>
          <p className="text-gray-500 text-xs">Configure cafe menu items, availability statuses, prices, and catalog categories</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-xl shadow hover:scale-[1.02] active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-coffee-200/20 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-amber-50/20 text-coffee-900 font-bold uppercase tracking-wider border-b border-coffee-100">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-coffee-50/10 transition-colors">
                <td className="px-6 py-3">
                  <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                </td>
                <td className="px-6 py-3">
                  <h4 className="font-bold text-coffee-950 leading-snug">{p.name}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1 max-w-[200px] mt-0.5">{p.description}</p>
                </td>
                <td className="px-6 py-3 text-gray-500">{p.category.name}</td>
                <td className="px-6 py-3 font-bold text-coffee-800">${p.price.toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {p.available ? 'Available' : 'Sold Out'}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-lg hover:bg-coffee-50 text-coffee-600 transition-colors" title="Edit Product"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete Product"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal popup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-coffee-100 pb-3">
                <h3 className="font-extrabold text-md font-serif text-coffee-950">{editingProduct ? 'Edit Catalog Item' : 'Add New Catalog Item'}</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-coffee-950"><X className="w-5 h-5" /></button>
              </div>

              {error && <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs flex gap-1 items-center"><AlertCircle className="w-4 h-4" /> {error}</div>}

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-coffee-900">Product Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-coffee-900">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-coffee-900">Price ($)</label>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-coffee-900">Category</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-coffee-200 bg-white rounded-lg focus:outline-none">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-coffee-900">Image URL</label>
                  <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="available" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="rounded border-coffee-300 text-coffee-600 focus:ring-coffee-500" />
                  <label htmlFor="available" className="font-bold text-coffee-900">Available in stock</label>
                </div>
              </div>

              <button type="submit" className="w-full py-3 mt-4 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-xl shadow">
                Save Product
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
