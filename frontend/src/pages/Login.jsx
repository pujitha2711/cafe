import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import bgImage from '../assets/morning_place_espresso.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Read registered state from registration redirect
  const isRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 bg-coffee-950 overflow-hidden">
      {/* Background Image */}
      <img 
        src={bgImage} 
        alt="Morning Place background" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-coffee-950/70 via-coffee-950/80 to-coffee-950"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-coffee-200/20 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center shadow-lg">
            <Coffee className="w-6 h-6 text-amber-50" />
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight text-coffee-950 font-serif">Welcome Back</h2>
          <p className="text-gray-500 text-xs font-sans">Sign in to your Morning Place account to place orders</p>
        </div>

        {/* Signup Success Banner */}
        {isRegistered && !error && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex gap-2 items-center font-sans">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Account created successfully! You can now log in.</span>
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2 items-center font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900 font-sans">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <input 
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-coffee-900 font-sans">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-coffee-600 hover:underline font-sans">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 font-sans"
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 font-sans">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-coffee-700 hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
