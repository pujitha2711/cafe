import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Download, Calendar, Tag, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    axios.get('/api/orders/my-orders')
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
    // Poll order statuses every 10 seconds to show preparation state shifts (Pending -> Accepted -> etc.)
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `aroma-haven-bill-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Could not retrieve PDF invoice.');
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SERVED': return 'bg-orange-100 text-orange-850 border-orange-250';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeStr) => {
    const d = new Date(timeStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-gray-400">Loading order history...</div>;
  }

  return (
    <div className="flex-1 p-6 space-y-8 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-black text-coffee-950 font-serif">Order History</h2>
        <p className="text-gray-500 text-xs">Track current active orders and inspect historical dine-in/delivery bills</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-3xl border border-coffee-200/20 shadow-sm flex flex-col items-center justify-center space-y-4">
          <ClipboardList className="w-12 h-12 text-coffee-300" />
          <h3 className="font-bold text-coffee-900">No Orders Found</h3>
          <p className="text-xs max-w-xs">You haven't placed any orders yet. Visit the order menu to select items.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-white rounded-3xl border border-coffee-200/20 shadow-sm overflow-hidden transition-all duration-300">
                
                {/* Header row summaries */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-coffee-50/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-700 to-coffee-900 text-amber-50 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-coffee-950">Order #CMS-{order.id}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatTime(order.createdAt)}</span>
                        <span className="font-bold">Total: ${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${getStatusBgColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button className="text-coffee-600 hover:text-coffee-800">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible item table dropdown */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-coffee-200/5 bg-amber-50/5 p-6 space-y-6 text-xs text-gray-600"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Items listed */}
                        <div className="space-y-3">
                          <h5 className="font-extrabold text-coffee-950 uppercase tracking-wider text-[10px] border-b border-coffee-100 pb-1.5">Ordered Items</h5>
                          <div className="space-y-2">
                            {order.orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-gray-500">
                                <span>{item.product.name} x {item.quantity}</span>
                                <span className="font-bold text-coffee-950">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Invoice & Shipping summaries */}
                        <div className="space-y-4">
                          <h5 className="font-extrabold text-coffee-950 uppercase tracking-wider text-[10px] border-b border-coffee-100 pb-1.5">Delivery Details</h5>
                          <div className="space-y-1.5 text-gray-500">
                            <p><span className="font-semibold text-coffee-950">Address:</span> {order.address || 'Cafe Dine-in/Pickup'}</p>
                            <p><span className="font-semibold text-coffee-950">Contact Phone:</span> {order.phone}</p>
                            <p><span className="font-semibold text-coffee-950">Payment Method:</span> {order.paymentMethod} ({order.paymentStatus})</p>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => handleDownloadInvoice(order.id)}
                              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-800 hover:shadow text-white font-bold text-[10px] flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Download PDF Bill
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
