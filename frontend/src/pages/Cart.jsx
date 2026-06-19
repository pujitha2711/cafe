import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    discountCode,
    discountPercent,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotal
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ success: false, text: '' });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponMsg({ success: false, text: '' });
    if (!couponInput.trim()) return;

    const result = applyCoupon(couponInput);
    setCouponMsg({ success: result.success, text: result.message });
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[60vh] space-y-4 max-w-7xl mx-auto w-full">
        <div className="w-16 h-16 rounded-3xl bg-coffee-100 text-coffee-600 flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-lg text-coffee-950 font-serif">Your Cart is Empty</h3>
        <p className="text-gray-500 text-xs max-w-xs text-center">Looks like you haven't added any coffee or treats to your order yet.</p>
        <Link to="/menu" className="px-5 py-3 rounded-2xl bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs shadow hover:scale-[1.01] transition-transform">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-black text-coffee-950 font-serif">Your Shopping Cart</h2>
        <p className="text-gray-500 text-xs">Review your selected beverages and snacks before checking out</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <motion.div 
              layout
              key={item.product.id}
              className="p-4 rounded-3xl bg-white border border-coffee-200/20 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-coffee-950 leading-tight">{item.product.name}</h4>
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5">{item.product.category.name}</p>
                  <span className="text-xs font-bold text-coffee-800 block mt-1.5">${item.product.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Quantity adjuster */}
                <div className="flex items-center gap-2 border border-coffee-200/50 rounded-xl p-1 bg-amber-50/20">
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-white text-coffee-600 active:scale-90 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-coffee-950">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-white text-coffee-600 active:scale-90 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Invoice breakdown summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-6">
            <h3 className="font-extrabold text-md text-coffee-950 font-serif">Order Invoice</h3>

            {/* Coupon codes form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-[10px] font-bold text-coffee-900 block">Apply Promo Coupon</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coffee-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. COFFEE20"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-coffee-200 rounded-xl text-xs uppercase focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-coffee-800 hover:bg-coffee-950 text-white font-bold text-xs rounded-xl shadow transition-colors">
                  Apply
                </button>
              </div>
              
              {/* Show promo success/fail warnings */}
              {couponMsg.text && (
                <span className={`text-[10px] font-bold block ${couponMsg.success ? 'text-green-600' : 'text-red-500'}`}>
                  {couponMsg.text}
                </span>
              )}
              
              {discountPercent > 0 && (
                <div className="flex gap-1.5 items-center p-2 rounded-lg bg-green-50 text-green-700 text-[10px] font-semibold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>Promo applied: Flat 20% discount (Coupon: {discountCode}).</span>
                </div>
              )}
            </form>

            <hr className="border-coffee-200/10" />

            {/* Price lines */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({discountPercent * 100}%)</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Taxes (8% rate)</span>
                <span>${getTaxAmount().toFixed(2)}</span>
              </div>
              
              <hr className="border-coffee-200/10 my-2" />
              
              <div className="flex justify-between text-coffee-950 font-black text-sm">
                <span>Grand Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <Link to="/menu" className="text-xs font-bold text-coffee-700 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
