import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Sparkles, CheckCircle2, QrCode, ClipboardCheck, ArrowLeft, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Checkout() {
  const { cartItems, getSubtotal, getDiscountAmount, getTaxAmount, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD, UPI, CASH
  
  // Card Details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Status flags
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // stores the response order object on success
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!address.trim() || !phone.trim()) {
      setError('Please provide a delivery address and contact phone number.');
      return;
    }

    setIsPlacing(true);

    const orderPayload = {
      address,
      phone,
      paymentMethod,
      discount: getDiscountAmount(),
      tax: getTaxAmount(),
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await axios.post('/api/orders', orderPayload);
      setPlacedOrder(response.data);
      clearCart(); // Clear cart state locally
      
      if (paymentMethod === 'UPI') {
        const amountInInr = (getTotal() * 83).toFixed(2);
        const upiUrl = `upi://pay?pa=morningplace@upi&pn=Morning%20Place&am=${amountInInr}&cu=INR&tn=Order-CMS-${response.data.id}`;
        setTimeout(() => {
          window.location.href = upiUrl;
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please check ingredients availability.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!placedOrder) return;
    try {
      const response = await axios.get(`/api/orders/${placedOrder.id}/invoice`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mp-cafe-receipt-${placedOrder.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Could not download invoice PDF.');
    }
  };

  const handleSimulatePaymentConfirm = async () => {
    if (!placedOrder) return;
    try {
      const response = await axios.put(`/api/orders/${placedOrder.id}/pay-confirm`);
      setPlacedOrder(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to verify payment simulation.');
    }
  };

  // 1. Success feedback page
  if (placedOrder) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[70vh] space-y-6 max-w-md mx-auto w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-green-600 flex items-center justify-center shadow-lg"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-coffee-950 font-serif">Order Placed Successfully!</h2>
          <p className="text-xs text-gray-500">Your order <span className="font-extrabold">#CMS-{placedOrder.id}</span> has been created. The kitchen is review-ready.</p>
        </div>

        {/* invoice details summary */}
        <div className="w-full p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg text-xs space-y-3">
          <h4 className="font-bold text-coffee-950 text-center font-serif border-b border-coffee-100 pb-2">Receipt Overview</h4>
          <div className="flex justify-between text-gray-500">
            <span>Customer Name</span>
            <span className="font-semibold text-coffee-950">{user?.fullName}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Payment Method</span>
            <span className="font-semibold text-coffee-950 uppercase">{placedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Payment Status</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${placedOrder.paymentStatus === 'PAID' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
              {placedOrder.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Grand Total Paid</span>
            <span className="font-bold text-coffee-900 text-sm">${placedOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {placedOrder.paymentStatus === 'PENDING' && (
          <div className="w-full p-4 bg-amber-50/20 border border-coffee-200/40 rounded-3xl text-center space-y-2.5 shadow-sm">
            <p className="text-[10px] text-coffee-900 font-semibold leading-relaxed">Did you initiate payment on your UPI app or Card? Verify the payment below to update your receipt instantly.</p>
            <button 
              onClick={handleSimulatePaymentConfirm}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow active:scale-[0.98] transition-all"
            >
              Verify Payment Simulation
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2.5 w-full">
          <button 
            onClick={handleDownloadInvoice}
            className="w-full py-3.5 bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold text-xs rounded-xl shadow hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF Bill Receipt
          </button>
          
          <button 
            onClick={() => navigate('/orders')}
            className="w-full py-3.5 bg-white border border-coffee-200 text-coffee-950 font-bold text-xs rounded-xl hover:bg-coffee-50 active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <ClipboardCheck className="w-4 h-4" /> View My Orders
          </button>
        </div>
      </div>
    );
  }

  // 2. Checkout payment page
  return (
    <div className="flex-1 p-6 space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Link to="/cart" className="p-2 rounded-xl border border-coffee-200 text-coffee-700 hover:bg-coffee-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-coffee-950 font-serif">Checkout Details</h2>
          <p className="text-gray-500 text-xs">Verify your coordinates and choose your payment method</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{error}</div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Coordinates and Payment options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Coordinates */}
          <div className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-4">
            <h3 className="font-extrabold text-md text-coffee-950 font-serif">1. Delivery Coordinates</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-coffee-900">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                  <input 
                    type="tel"
                    required
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-coffee-900">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-coffee-400" />
                  <textarea 
                    required
                    placeholder="Enter complete shipping or cafe table address"
                    rows="3"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateways selection */}
          <div className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-6">
            <h3 className="font-extrabold text-md text-coffee-950 font-serif">2. Payment Gateway</h3>

            <div className="grid grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 font-bold text-xs transition-colors ${
                  paymentMethod === 'CARD' 
                    ? 'bg-coffee-600 border-coffee-700 text-white shadow' 
                    : 'bg-white border-coffee-200 text-coffee-900 hover:bg-coffee-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Credit Card
              </button>

              <button 
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 font-bold text-xs transition-colors ${
                  paymentMethod === 'UPI' 
                    ? 'bg-coffee-600 border-coffee-700 text-white shadow' 
                    : 'bg-white border-coffee-200 text-coffee-900 hover:bg-coffee-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                UPI / QR
              </button>

              <button 
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 font-bold text-xs transition-colors ${
                  paymentMethod === 'CASH' 
                    ? 'bg-coffee-600 border-coffee-700 text-white shadow' 
                    : 'bg-white border-coffee-200 text-coffee-900 hover:bg-coffee-50'
                }`}
              >
                <Coffee className="w-5 h-5" />
                Pay Cash
              </button>
            </div>

            {/* Simulated credit card input field block */}
            {paymentMethod === 'CARD' && (
              <div className="p-4 rounded-2xl bg-amber-50/20 border border-coffee-100 grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-coffee-900">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="4000 1234 5678 9010" 
                    maxLength="19"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-coffee-900">Expiry (MM/YY)</label>
                  <input 
                    type="text" 
                    placeholder="12/28" 
                    maxLength="5"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-coffee-900">CVV</label>
                  <input 
                    type="password" 
                    placeholder="•••" 
                    maxLength="3"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" 
                  />
                </div>
              </div>
            )}

            {/* Simulated UPI Scan block */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-amber-50/20 border border-coffee-100 flex flex-col items-center text-center space-y-2.5">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-coffee-100 flex items-center justify-center">
                  {/* Mock QR SVG representation */}
                  <svg className="w-full h-full text-coffee-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="6" height="6" rx="1" />
                    <rect x="16" y="2" width="6" height="6" rx="1" />
                    <rect x="2" y="16" width="6" height="6" rx="1" />
                    <path d="M16 16h2v2h-2zm2 2h2v2h-2zm-2 2h2v-2h-2zm4-4h2v2h-2z" />
                    <rect x="6" y="6" width="1" height="1" />
                    <rect x="17" y="6" width="1" height="1" />
                    <rect x="6" y="17" width="1" height="1" />
                  </svg>
                </div>
                <span className="text-[10px] font-extrabold text-coffee-900">UPI ID: morningplace@upi</span>
                <span className="text-xs font-black text-green-700">Amount: ₹{(getTotal() * 83).toFixed(2)} INR</span>
                <p className="text-[9px] text-gray-500 max-w-xs">Scan the QR code or click 'Pay & Confirm Order' below to open your UPI app and transfer the amount in Indian Rupees (INR).</p>
              </div>
            )}

            {/* Simulated Cash delivery warning */}
            {paymentMethod === 'CASH' && (
              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-250 text-yellow-900 text-xs">
                <p className="font-semibold">Cash On Delivery / Table Payment chosen.</p>
                <p className="text-[10px] text-yellow-800 mt-1">Please pay the cashier or delivery agent when your hot menu items arrive.</p>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Invoice and Checkout Button */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-4">
            <h3 className="font-extrabold text-md text-coffee-950 font-serif">Checkout Bill</h3>

            <div className="space-y-3 text-xs border-b border-coffee-200/10 pb-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex justify-between gap-4 text-gray-500">
                  <span className="truncate">{item.product.name} x {item.quantity}</span>
                  <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Taxes</span>
                <span>${getTaxAmount().toFixed(2)}</span>
              </div>
              <hr className="border-coffee-200/10 my-2" />
              <div className="flex justify-between text-coffee-950 font-black text-sm">
                <span>Final Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isPlacing}
              className="w-full py-4 mt-4 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:scale-[1.01] active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4.5 h-4.5" />
              {isPlacing ? 'Placing Order...' : 'Pay & Confirm Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
