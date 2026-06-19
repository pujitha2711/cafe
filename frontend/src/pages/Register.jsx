import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, User, Mail, Phone, Lock, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import bgImage from '../assets/morning_place_interior.png';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Address is collected at registration time
      await register(fullName, email, phoneNumber, address, password);
      // Redirect directly to login with registered state, bypassing email verification
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex bg-amber-50/10">
      {/* Left Panel - Hero Image (only on md and up) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-coffee-950">
        <img 
          src={bgImage} 
          alt="Morning Place interior" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-950 via-coffee-950/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 text-amber-50 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <Coffee className="w-8 h-8 text-amber-300" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold font-serif leading-tight">Morning Place</h1>
            <p className="text-amber-100/80 text-sm leading-relaxed max-w-md font-sans">
              A premium sanctuary for coffee connoisseurs. Register today to unlock freshly-brewed espresso, artisanal pastries, and personalized AI-guided morning rituals.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-amber-200/60 font-bold tracking-wide uppercase pt-4 border-t border-white/10 font-sans">
            <span>Specialty Roasts</span>
            <span>•</span>
            <span>Artisanal Sourdough</span>
            <span>•</span>
            <span>Cozy Ambience</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (full screen on small, half screen on md) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-coffee-200/20 shadow-xl"
        >
          {/* Header */}
          <div className="space-y-1.5">
            {/* Mobile-only Cafe Name logo */}
            <div className="md:hidden flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center shadow-lg">
                <Coffee className="w-5 h-5 text-amber-50" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-coffee-950 font-serif">Morning Place</span>
            </div>
            <h2 className="font-extrabold text-2xl tracking-tight text-coffee-950 font-serif">Create Account</h2>
            <p className="text-gray-500 text-xs">Join Morning Place to order fresh morning roasts & breakfast</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                  <input 
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                  <input 
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                <input 
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-coffee-400" />
                <textarea 
                  required
                  placeholder="Enter your street address, apartment, city, and zip code"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows="2"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-3 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-coffee-700 hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
