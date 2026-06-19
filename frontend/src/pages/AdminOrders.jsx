import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Check, X, Coffee, Calendar, Phone, MapPin, Download, AlertCircle } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    axios.get('/api/orders/all')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // Short poll orders every 10 seconds for real-time queue synchronization
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/status?status=${newStatus}`);
      // Update state locally
      setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status. Please review raw stock levels.');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `aroma-haven-invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PREPARING': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'SERVED': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'COMPLETED': return 'bg-green-50 text-green-800 border-green-200';
      default: return 'bg-red-50 text-red-800 border-red-200';
    }
  };

  const formatTime = (timeStr) => {
    const d = new Date(timeStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-gray-400">Loading order queue...</div>;
  }

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-black text-coffee-950 font-serif">Customer Orders Queue</h2>
        <p className="text-gray-500 text-xs">Review incoming orders, accept/reject, and process delivery states</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-3xl border border-coffee-200/20 shadow-sm flex flex-col items-center justify-center space-y-4">
          <ClipboardList className="w-12 h-12 text-coffee-300" />
          <h3 className="font-bold text-coffee-900">Queue is Empty</h3>
          <p className="text-xs">No customer orders have been logged yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-sm space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Order Info */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-extrabold text-sm text-coffee-950">Order #CMS-{order.id}</h4>
                  <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-bold text-coffee-900">Customer:</span> {order.user.fullName} ({order.user.email})</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-coffee-500" /> {order.address || 'Cafe Dine-in/Pickup'}</p>
                  <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-coffee-500" /> {order.phone || order.user.phoneNumber}</p>
                  <p className="font-semibold text-coffee-950 mt-1">
                    Items: {order.orderItems.map(item => `${item.product.name} (x${item.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatTime(order.createdAt)}</span>
                  <span>Total Bill: <span className="font-bold text-coffee-900">${order.totalAmount.toFixed(2)}</span></span>
                  <span className="uppercase font-bold">({order.paymentMethod} - {order.paymentStatus})</span>
                </div>
              </div>

              {/* State Machine Action Controls */}
              <div className="flex flex-wrap gap-2 shrink-0 md:justify-end">
                {order.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                      className="px-4 py-2 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'REJECTED')}
                      className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}

                {order.status === 'ACCEPTED' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Coffee className="w-4 h-4" /> Start Preparing
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Serve Order
                  </button>
                )}

                {order.status === 'SERVED' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Complete Order
                  </button>
                )}

                {order.status === 'COMPLETED' && (
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1 px-3 py-1 bg-green-50 rounded-xl">
                    <Check className="w-4 h-4" /> Order Complete
                  </span>
                )}

                {order.status === 'REJECTED' && (
                  <span className="text-xs font-bold text-red-700 flex items-center gap-1 px-3 py-1 bg-red-50 rounded-xl">
                    <X className="w-4 h-4" /> Order Rejected
                  </span>
                )}

                {/* Print PDF receipt button */}
                {(order.status === 'COMPLETED' || order.status === 'SERVED') && (
                  <button 
                    onClick={() => handleDownloadInvoice(order.id)}
                    className="p-2 border border-coffee-200 hover:bg-coffee-50 text-coffee-800 rounded-xl"
                    title="Download Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
