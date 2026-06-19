import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, RefreshCw, AlertTriangle, Layers, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for adding new inventory item
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  // Quick edit state
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQty, setEditQty] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve inventory items.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdd = () => {
    setItemName('');
    setQuantity('');
    setUnit('kg');
    setLowStockThreshold('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!itemName || quantity === '' || lowStockThreshold === '') {
      setError('Please fill in all details.');
      return;
    }

    const payload = {
      itemName,
      quantity: Number(quantity),
      unit,
      lowStockThreshold: Number(lowStockThreshold)
    };

    try {
      const res = await axios.post('/api/inventory', payload);
      setInventory(prev => [res.data, ...prev]);
      setSuccess('Inventory item added successfully!');
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding inventory item.');
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditQty(item.quantity);
    setError('');
    setSuccess('');
  };

  const handleSaveQty = async (id) => {
    setError('');
    setSuccess('');
    if (editQty === '' || isNaN(Number(editQty))) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    try {
      const res = await axios.put(`/api/inventory/${id}/stock`, null, {
        params: { quantity: Number(editQty) }
      });
      setInventory(prev => prev.map(item => item.id === id ? res.data : item));
      setEditingItemId(null);
      setSuccess('Stock updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating stock level.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-gray-400">Loading stock inventory catalog...</div>;
  }

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-coffee-950 font-serif flex items-center gap-2">
            <Layers className="w-6 h-6 text-coffee-700" /> Stock Inventory Control
          </h2>
          <p className="text-gray-500 text-xs">Manage coffee beans, milk, syrups, and packaging material stock levels</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-xl shadow hover:scale-[1.02] active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200/50 text-green-800 text-xs font-semibold">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200/50 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-coffee-200/20 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-amber-50/20 text-coffee-900 font-bold uppercase tracking-wider border-b border-coffee-100">
            <tr>
              <th className="px-6 py-4">Ingredient Name</th>
              <th className="px-6 py-4">Stock level</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4">Min. Threshold</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">No inventory materials registered.</td>
              </tr>
            ) : (
              inventory.map(item => {
                const isLowStock = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item.id} className={`hover:bg-coffee-50/10 transition-colors ${isLowStock ? 'bg-red-50/10' : ''}`}>
                    <td className="px-6 py-4 font-bold text-coffee-950">{item.itemName}</td>
                    <td className="px-6 py-4 font-semibold">
                      {editingItemId === item.id ? (
                        <input 
                          type="number" 
                          step="0.1"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-24 px-2 py-1 border border-coffee-200 rounded-lg text-xs"
                          placeholder="Qty"
                        />
                      ) : (
                        <span>{item.quantity.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 uppercase">{item.unit}</td>
                    <td className="px-6 py-4 text-gray-500">{item.lowStockThreshold.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingItemId === item.id ? (
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleSaveQty(item.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleStartEdit(item)}
                          className="px-3 py-1.5 border border-coffee-200 text-coffee-800 rounded-xl hover:bg-coffee-50 transition-colors font-semibold"
                        >
                          Quick Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Item Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-coffee-200/20"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-coffee-800 to-coffee-950 text-amber-50 flex items-center justify-between">
                <span className="font-extrabold text-sm font-serif">Add Material to Stock</span>
                <button onClick={() => setShowModal(false)} className="text-amber-200 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-coffee-800 uppercase">Material Name</label>
                  <input 
                    type="text" 
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-2 border border-coffee-200 rounded-xl text-xs"
                    placeholder="e.g. Espresso Coffee Beans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-coffee-800 uppercase">Initial Qty</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-coffee-200 rounded-xl text-xs"
                      placeholder="e.g. 15.0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-coffee-800 uppercase">Measurement Unit</label>
                    <select 
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-2 border border-coffee-200 rounded-xl text-xs bg-white"
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="liters">liters (Liters)</option>
                      <option value="units">units (Items)</option>
                      <option value="grams">grams (Grams)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-coffee-800 uppercase">Low Stock Threshold Limit</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-4 py-2 border border-coffee-200 rounded-xl text-xs"
                    placeholder="e.g. 5.0 (Triggers warning below this value)"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-coffee-200 text-coffee-800 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-950 text-amber-50 font-bold text-xs rounded-xl shadow hover:scale-[1.02] active:scale-95 transition-transform"
                  >
                    Register Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
