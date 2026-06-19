import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { Search, Sparkles, Coffee, User, MapPin, Phone, RefreshCw, ShoppingCart, Star, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user, updateProfile } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [search, setSearch] = useState('');
  
  // Profile editing state
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [editSuccess, setEditSuccess] = useState('');

  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    // 1. Fetch categories
    axios.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    // 2. Fetch AI Recommendations
    axios.get('/api/ai/recommendations')
      .then(res => {
        setRecommendations(res.data);
        setLoadingRecs(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingRecs(false);
      });

    // 3. Fetch active orders
    axios.get('/api/orders/my-orders')
      .then(res => {
        // Show active orders (PENDING, ACCEPTED, PREPARING, SERVED)
        const active = res.data.filter(o => o.status !== 'COMPLETED' && o.status !== 'REJECTED');
        setActiveOrders(active);
      })
      .catch(err => console.error(err));
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setEditSuccess('');
    // Mock profile update API or just update client context
    updateProfile({ phoneNumber: phone, address });
    setEditSuccess('Profile details updated successfully!');
    setTimeout(() => setEditSuccess(''), 3000);
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-purple-100 text-purple-800';
      case 'SERVED': return 'bg-orange-100 text-orange-850';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* 1. Welcome Card */}
      <div className="rounded-3xl bg-gradient-to-r from-coffee-800 to-coffee-950 p-8 text-amber-50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Coffee className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-3 max-w-lg">
          <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 font-bold text-[10px] uppercase tracking-wider">Customer Lobby</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">Welcome Back, {user?.fullName}!</h2>
          <p className="text-amber-100/70 text-xs sm:text-sm">Enjoy premium roasted coffee and hand-crafted delicacies delivered straight to your table or doorstep.</p>
          <div className="pt-2">
            <Link to="/menu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-coffee-950 font-bold text-xs shadow hover:scale-[1.02] transition-transform">
              Browse Menu <Coffee className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI and Categories */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. AI Recommendation Shelf */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-coffee-950 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> AI Recommendations
              </h3>
              <span className="text-[10px] font-bold text-coffee-500 uppercase">Tailored for you</span>
            </div>

            {loadingRecs ? (
              <div className="text-center py-6 text-xs text-gray-400">Analyzing your favorites...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map(prod => (
                  <div key={prod.id} className="p-4 rounded-2xl bg-white border border-coffee-200/20 shadow-sm flex gap-4 hover:shadow transition-shadow">
                    <img src={prod.imageUrl} alt={prod.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex flex-col justify-between py-0.5">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase tracking-wider mb-1">AI Choice</span>
                        <h4 className="font-bold text-sm text-coffee-950 leading-tight">{prod.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] text-gray-500 font-bold">{prod.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-6 pt-2">
                        <span className="text-xs font-bold text-coffee-900">${prod.price.toFixed(2)}</span>
                        <button 
                          onClick={() => {
                            addToCart(prod);
                            navigate('/cart');
                          }}
                          className="p-1.5 rounded-lg bg-coffee-100 text-coffee-700 hover:bg-coffee-600 hover:text-white transition-colors"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Horizontal Categories Grid */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-coffee-950 font-serif">Quick Browse Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => navigate(`/menu?category=${cat.id}`)}
                  className="relative h-28 rounded-2xl overflow-hidden shadow-sm hover:shadow cursor-pointer group"
                >
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-coffee-950/80 via-coffee-950/40 to-transparent flex items-end p-4">
                    <span className="text-amber-50 font-bold text-xs tracking-wide">{cat.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Track Order & Edit Profile */}
        <div className="space-y-8">
          {/* 4. Active Order Tracker */}
          <div className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-4">
            <h3 className="font-extrabold text-md text-coffee-950 font-serif flex items-center gap-2">
              <Clock className="w-5 h-5 text-coffee-600" /> Track Live Orders
            </h3>
            
            {activeOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 bg-amber-50/10 rounded-2xl">No active orders right now. Order some coffee! ☕</div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-2xl bg-amber-50/20 border border-coffee-100 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-coffee-950">Order #CMS-{order.id}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">Total: ${order.totalAmount.toFixed(2)} | Method: {order.paymentMethod}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${getStatusBgColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link to="/orders" className="text-[10px] font-bold text-coffee-700 hover:underline">View Order History</Link>
                </div>
              </div>
            )}
          </div>

          {/* 5. Quick Profile Section */}
          <div className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-4">
            <h3 className="font-extrabold text-md text-coffee-950 font-serif flex items-center gap-2">
              <User className="w-5 h-5 text-coffee-600" /> My Profile Details
            </h3>
            
            {editSuccess && (
              <div className="p-2.5 rounded-xl bg-amber-50 text-coffee-800 text-xs font-semibold">{editSuccess}</div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-coffee-900">Registered Email</label>
                <input type="text" disabled value={user?.email || ''} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-coffee-900">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coffee-400" />
                  <input 
                    type="text" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-coffee-200 rounded-lg text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-coffee-900">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-coffee-400" />
                  <textarea 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows="2"
                    className="w-full pl-8 pr-3 py-2 border border-coffee-200 rounded-lg text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-lg shadow hover:shadow-md">
                Update Details
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
