import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, Star, MessageSquarePlus, ShoppingCart, MessageCircle, X, ShieldAlert, QrCode, Phone, MapPin, CheckCircle2, Download, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Menu() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Review modal state
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // UPI Instant Pay states
  const [upiProduct, setUpiProduct] = useState(null);
  const [upiQuantity, setUpiQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const openUpiPayModal = (product) => {
    setUpiProduct(product);
    setUpiQuantity(1);
    setDeliveryAddress(user?.address || '');
    setContactPhone(user?.phoneNumber || '');
    setPlacingOrder(false);
    setPlacedOrder(null);
    setShowSimulator(false);
    setPaymentSuccess(false);
  };

  const handleUpiPaymentAndOrder = async () => {
    if (!deliveryAddress.trim() || !contactPhone.trim()) {
      alert('Please provide your phone number and delivery address/table number.');
      return;
    }

    setPlacingOrder(true);

    const subtotal = upiProduct.price * upiQuantity;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = subtotal + tax;
    const amountInInr = (totalAmount * 83).toFixed(2);

    const orderPayload = {
      address: deliveryAddress,
      phone: contactPhone,
      paymentMethod: 'UPI',
      discount: 0,
      tax: tax,
      items: [{
        productId: upiProduct.id,
        quantity: upiQuantity
      }]
    };

    try {
      const response = await axios.post('/api/orders', orderPayload);
      const orderData = response.data;
      setPlacedOrder(orderData);
      
      const upiUrl = `upi://pay?pa=morningplace@upi&pn=Morning%20Place&am=${amountInInr}&cu=INR&tn=Order-CMS-${orderData.id}`;
      
      // Redirect to UPI deep link
      window.location.href = upiUrl;
      
      // Launch simulator overlay
      setShowSimulator(true);
      setPlacingOrder(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order.');
      setPlacingOrder(false);
    }
  };

  const handleConfirmUpiPayment = async () => {
    if (!placedOrder) return;
    setPlacingOrder(true);
    try {
      const response = await axios.put(`/api/orders/${placedOrder.id}/pay-confirm`);
      setPlacedOrder(response.data);
      setPaymentSuccess(true);
      setShowSimulator(false);
      setPlacingOrder(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm payment.');
      setPlacingOrder(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingInvoice(true);
    try {
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mp-cafe-receipt-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Could not download invoice PDF.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    // Fetch categories
    axios.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    // Check query params
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(Number(catParam));
    }
  }, [searchParams]);

  // Fetch products depending on category
  useEffect(() => {
    const url = selectedCategory === 'all' 
      ? '/api/products' 
      : `/api/products?categoryId=${selectedCategory}`;
    
    axios.get(url)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [selectedCategory]);

  const openReviewModal = async (product) => {
    setReviewProduct(product);
    setReviewError('');
    setReviewSuccess('');
    setCommentInput('');
    setRatingInput(5);
    try {
      const response = await axios.get(`/api/products/${product.id}/reviews`);
      setReviews(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!commentInput.trim()) {
      setReviewError('Please enter a comment.');
      return;
    }

    try {
      const response = await axios.post(`/api/products/${reviewProduct.id}/reviews`, {
        rating: ratingInput,
        comment: commentInput
      });
      setReviews(prev => [response.data, ...prev]);
      setReviewSuccess('Review submitted! AI Sentiment analyzed.');
      setCommentInput('');
      
      // Update local product rating to reflect changes
      setProducts(prev => prev.map(p => {
        if (p.id === reviewProduct.id) {
          const newAvg = (reviews.reduce((sum, r) => sum + r.rating, 0) + ratingInput) / (reviews.length + 1);
          return { ...p, rating: Math.round(newAvg * 10) / 10 };
        }
        return p;
      }));
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-100 text-green-700';
      case 'NEGATIVE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Search and Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-coffee-950 font-serif">Aroma Haven Menu</h2>
          <p className="text-gray-500 text-xs">Fresh beverages and bakery products handcrafted daily</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
          <input 
            type="text"
            placeholder="Search coffee, tea, panini..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-coffee-200/10">
        <button
          onClick={() => { setSelectedCategory('all'); setSearchParams({}) }}
          className={`px-4.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-gradient-to-r from-coffee-600 to-coffee-800 text-white shadow' 
              : 'bg-white text-coffee-950 border border-coffee-200/35 hover:bg-coffee-50'
          }`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setSearchParams({ category: cat.id }) }}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-gradient-to-r from-coffee-600 to-coffee-800 text-white shadow' 
                : 'bg-white text-coffee-950 border border-coffee-200/35 hover:bg-coffee-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No items found matching your filter options.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-3xl border border-coffee-200/20 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div className="relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                {!product.available && (
                  <div className="absolute inset-0 bg-coffee-950/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">Sold Out</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-md text-coffee-950 font-serif leading-tight">{product.name}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-coffee-800 rounded-lg shrink-0">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-coffee-200/5">
                  <button 
                    onClick={() => openReviewModal(product)}
                    className="text-[10px] font-bold text-coffee-500 hover:text-coffee-700 flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" /> Reviews
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold mr-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {product.rating}
                    </span>
                    
                    <button
                      disabled={!product.available}
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                        } else {
                          openUpiPayModal(product);
                        }
                      }}
                      className="px-2.5 py-1.5 text-[9px] font-extrabold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow active:scale-95 disabled:opacity-40 transition-all"
                      title="Instant UPI Order"
                    >
                      UPI Pay ₹
                    </button>

                    <button
                      disabled={!product.available}
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                        } else {
                          addToCart(product);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-gradient-to-r from-coffee-600 to-coffee-800 text-white hover:shadow-md active:scale-95 disabled:opacity-40 transition-all"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Sentiment Modal */}
      <AnimatePresence>
        {reviewProduct && (
          <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-coffee-100 flex items-center justify-between bg-gradient-to-r from-coffee-800 to-coffee-900 text-amber-50">
                <div>
                  <h3 className="font-extrabold text-md font-serif">{reviewProduct.name} - Reviews</h3>
                  <p className="text-[10px] text-amber-200">Customer feedback and AI sentiment analysis</p>
                </div>
                <button onClick={() => setReviewProduct(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200"><X className="w-5 h-5" /></button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Form to submit review */}
                {user ? (
                  <form onSubmit={handlePostReview} className="p-4 rounded-2xl bg-amber-50/20 border border-coffee-100 space-y-4">
                    <h4 className="font-bold text-xs text-coffee-950">Write a Review</h4>
                    
                    {reviewError && <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {reviewError}</div>}
                    {reviewSuccess && <div className="p-2.5 rounded-xl bg-amber-50 text-coffee-800 text-xs font-semibold">{reviewSuccess}</div>}

                    <div className="flex gap-4 items-center">
                      <label className="text-xs font-bold text-coffee-900">Rating:</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRatingInput(val)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-5 h-5 ${val <= ratingInput ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <textarea
                        placeholder="Tell us what you think! AI will automatically analyze your review sentiment."
                        rows="3"
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        className="w-full px-3 py-2 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                      />
                    </div>

                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-xl shadow">
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center text-xs text-gray-500">
                    Please <Link to="/login" className="font-bold text-coffee-700 hover:underline">sign in</Link> to submit a review.
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-coffee-900 uppercase tracking-wider">Customer Feedback ({reviews.length})</h4>
                  
                  {reviews.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 bg-amber-50/5 rounded-2xl">No reviews yet for this product. Be the first to share your thoughts!</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="py-4 space-y-2 first:pt-0">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-bold text-xs text-coffee-950">{rev.user.fullName}</span>
                            <div className="flex gap-2 items-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${getSentimentColor(rev.sentiment)}`}>
                                AI: {rev.sentiment}
                              </span>
                              <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                                <Star className="w-3 h-3 fill-amber-500" /> {rev.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed">{rev.comment}</p>
                          <span className="text-[9px] text-gray-400 block">Posted recently</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPI Instant Pay Modal */}
      <AnimatePresence>
        {upiProduct && (
          <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2 border-b border-coffee-100">
                <div>
                  <h3 className="font-extrabold text-lg text-coffee-950 font-serif">
                    {paymentSuccess ? 'Order Payment Receipt' : showSimulator ? 'UPI Secure Gateway' : 'Quick Bill Generator'}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    {paymentSuccess ? 'Your invoice is ready for download' : showSimulator ? 'Scan QR or simulate payment' : 'Configure items & delivery details'}
                  </p>
                </div>
                {!placingOrder && (
                  <button onClick={() => setUpiProduct(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* PAYMENT SUCCESS & DOWNLOAD RECEIPT VIEW */}
              {paymentSuccess && placedOrder ? (
                <div className="space-y-6">
                  {/* Success animation */}
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white animate-bounce shadow">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-coffee-950 text-sm">Payment Verified!</h4>
                    <p className="text-[10px] text-gray-500">Thank you! Your order is now accepted by the kitchen.</p>
                  </div>

                  {/* High fidelity Paper Receipt Mockup */}
                  <div className="p-5 bg-amber-50/15 border-2 border-dashed border-coffee-200 rounded-2xl space-y-4 text-xs font-mono relative overflow-hidden bg-white shadow-inner">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coffee-200 via-coffee-300 to-coffee-200"></div>
                    <div className="text-center space-y-1">
                      <h5 className="font-black font-serif text-coffee-900 tracking-wider text-sm">MORNING PLACE CAFE</h5>
                      <p className="text-[9px] text-gray-400">128 Gourmet Street, Coffee Valley</p>
                      <p className="text-[9px] text-gray-400">Phone: +1 234 567 890</p>
                    </div>

                    <hr className="border-dashed border-coffee-200" />

                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span>Invoice:</span>
                        <span className="font-bold">#CMS-{placedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(placedOrder.createdAt || Date.now()).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-bold">{user?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span>{placedOrder.phone || contactPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Address/Table:</span>
                        <span className="truncate max-w-[180px]">{placedOrder.address || deliveryAddress}</span>
                      </div>
                    </div>

                    <hr className="border-dashed border-coffee-200" />

                    {/* Table list */}
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between font-bold text-coffee-900 border-b border-coffee-100 pb-1">
                        <span>Item</span>
                        <span>Qty</span>
                        <span className="text-right">Total</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span className="truncate max-w-[180px]">{upiProduct.name}</span>
                        <span>x{upiQuantity}</span>
                        <span>${(upiProduct.price * upiQuantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <hr className="border-dashed border-coffee-200" />

                    {/* Totals */}
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal:</span>
                        <span>${(upiProduct.price * upiQuantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>GST / Tax (5%):</span>
                        <span>${(upiProduct.price * upiQuantity * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-coffee-950 text-xs border-t border-coffee-100 pt-1 mt-1 font-sans">
                        <span>Grand Total (USD):</span>
                        <span>${(upiProduct.price * upiQuantity * 1.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-green-700 text-xs mt-0.5 font-sans">
                        <span>Grand Total Paid (INR):</span>
                        <span>₹{((upiProduct.price * upiQuantity * 1.05) * 83).toFixed(2)}</span>
                      </div>
                    </div>

                    <hr className="border-dashed border-coffee-200" />

                    <div className="text-center text-[9px] text-coffee-600 font-semibold space-y-1">
                      <p>Payment Mode: UPI (GPay/Paytm)</p>
                      <p>Status: PAID & APPROVED</p>
                      <p className="mt-1 italic">Scan below or save copy for your records</p>
                    </div>

                    <div className="flex justify-center pt-2">
                      <div className="w-40 h-8 bg-gray-100 flex items-center justify-center border border-gray-200 rounded text-[8px] tracking-[5px] text-gray-400 font-sans">
                        |||||I||||||II||||I||||II
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(placedOrder.id)}
                      disabled={downloadingInvoice}
                      className="w-full py-3 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-bold text-xs rounded-xl shadow hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {downloadingInvoice ? 'Downloading PDF...' : 'Download PDF Bill Receipt'}
                    </button>
                    <button
                      onClick={() => setUpiProduct(null)}
                      className="w-full py-3 bg-white border border-coffee-200 text-coffee-950 font-bold text-xs rounded-xl hover:bg-coffee-50 active:scale-95 transition-all"
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              ) : showSimulator && placedOrder ? (
                /* DESKTOP UPI SIMULATOR SCREEN */
                <div className="space-y-6">
                  {/* Smartphone wrapper */}
                  <div className="mx-auto max-w-[260px] bg-coffee-950 rounded-[36px] p-3 border-4 border-coffee-800 shadow-xl relative">
                    {/* Screen notches */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-coffee-950 rounded-full z-20 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-800 mr-2"></span>
                      <span className="w-8 h-1 rounded bg-gray-900"></span>
                    </div>

                    <div className="bg-[#1f2937] text-white rounded-[28px] overflow-hidden p-4 pt-6 space-y-4 text-center font-sans relative min-h-[360px] flex flex-col justify-between">
                      {/* Top bar info */}
                      <div className="flex justify-between text-[8px] text-gray-400">
                        <span>12:30 PM</span>
                        <span className="flex items-center gap-0.5">
                          <span>5G</span>
                          <span className="w-3.5 h-2 border border-gray-400 rounded-sm bg-gray-300"></span>
                        </span>
                      </div>

                      <div className="space-y-1 mt-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center mx-auto shadow-md">
                          <Coffee className="w-5 h-5 text-amber-100" />
                        </div>
                        <h5 className="font-extrabold text-[10px] tracking-wide uppercase">Morning Place Cafe</h5>
                        <p className="text-[8px] text-gray-400">UPI ID: morningplace@upi</p>
                      </div>

                      {/* Payment amount */}
                      <div className="bg-[#111827] rounded-xl p-3 border border-[#374151] space-y-1">
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Request Amount</span>
                        <span className="text-md font-black text-green-400">
                          ₹{((upiProduct.price * upiQuantity * 1.05) * 83).toFixed(2)} INR
                        </span>
                      </div>

                      {/* QR code scanning simulator */}
                      <div className="space-y-1">
                        <div className="w-24 h-24 bg-white p-1.5 rounded-lg mx-auto flex items-center justify-center border border-gray-600">
                          <svg className="w-full h-full text-[#111827]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="6" height="6" rx="1" />
                            <rect x="16" y="2" width="6" height="6" rx="1" />
                            <rect x="2" y="16" width="6" height="6" rx="1" />
                            <rect x="6" y="6" width="1" height="1" />
                            <rect x="17" y="6" width="1" height="1" />
                            <rect x="6" y="17" width="1" height="1" />
                            <path d="M16 16h2v2h-2zm2 2h2v2h-2zm-2 2h2v-2h-2zm4-4h2v2h-2z" />
                          </svg>
                        </div>
                        <span className="text-[8px] text-gray-400">Scan QR from mobile UPI app</span>
                      </div>

                      {/* Simulated PIN Dots */}
                      <div className="space-y-1.5">
                        <div className="flex gap-1.5 justify-center">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        </div>
                        <span className="text-[7px] text-gray-400 block">Simulating secure UPI tunnel...</span>
                      </div>

                      {/* Confirm button inside phone */}
                      <button
                        onClick={handleConfirmUpiPayment}
                        disabled={placingOrder}
                        className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-extrabold text-[10px] rounded-xl shadow active:scale-[0.98] transition-all"
                      >
                        {placingOrder ? 'Verifying PIN...' : 'Pay & Approve'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 text-center max-w-xs mx-auto">
                    We've redirected your browser to the UPI app link. If you're on a desktop browser, use this phone emulator to simulate a successful payment.
                  </p>
                </div>
              ) : (
                /* DEFAULT: BILL & FORM ENTRY VIEW */
                <div className="space-y-5">
                  {/* Single item details and quantity selector */}
                  <div className="flex gap-4 items-center bg-amber-50/20 p-4 rounded-2xl border border-coffee-100">
                    <img src={upiProduct.imageUrl} alt={upiProduct.name} className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-coffee-950 truncate font-serif">{upiProduct.name}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{upiProduct.description}</p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => setUpiQuantity(Math.max(1, upiQuantity - 1))}
                          className="p-1 rounded bg-coffee-100 hover:bg-coffee-200 text-coffee-950 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-coffee-950">{upiQuantity}</span>
                        <button
                          onClick={() => setUpiQuantity(upiQuantity + 1)}
                          className="p-1 rounded bg-coffee-100 hover:bg-coffee-200 text-coffee-950 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Generated Bill Breakdown */}
                  <div className="p-4 rounded-2xl bg-amber-50/10 border border-coffee-100/30 text-xs space-y-2">
                    <h4 className="font-bold text-coffee-900 font-serif border-b border-coffee-100/20 pb-1">Generated Invoice Bill</h4>
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal:</span>
                      <span>${(upiProduct.price * upiQuantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>GST / Tax (5%):</span>
                      <span>${(upiProduct.price * upiQuantity * 0.05).toFixed(2)}</span>
                    </div>
                    <hr className="border-coffee-100/10" />
                    <div className="flex justify-between text-coffee-950 font-extrabold">
                      <span>Grand Total (USD):</span>
                      <span>${(upiProduct.price * upiQuantity * 1.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-700 font-black text-sm pt-0.5">
                      <span>Total (INR converted):</span>
                      <span>₹{((upiProduct.price * upiQuantity * 1.05) * 83).toFixed(2)} INR</span>
                    </div>
                    <span className="text-[8px] text-coffee-500 block text-right mt-0.5">Rate: 1 USD = ₹83</span>
                  </div>

                  {/* Coordinates Info Form */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-coffee-900 uppercase tracking-wide">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coffee-400" />
                        <input 
                          type="tel"
                          required
                          placeholder="Contact phone number"
                          value={contactPhone}
                          onChange={e => setContactPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-coffee-900 uppercase tracking-wide">Delivery Address / Table Number</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-coffee-400" />
                        <textarea 
                          required
                          placeholder="Address or Cafe Table Number"
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          rows="2"
                          className="w-full pl-9 pr-4 py-2 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Place Order button */}
                  <button 
                    onClick={handleUpiPaymentAndOrder}
                    disabled={placingOrder}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    {placingOrder ? 'Processing Invoice...' : `Pay ₹${((upiProduct.price * upiQuantity * 1.05) * 83).toFixed(2)} with UPI App`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
