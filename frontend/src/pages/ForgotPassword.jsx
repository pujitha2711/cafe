import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Mail, Lock, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Request code, 2 = Verify and reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const msg = await resetPassword(email, code, newPassword);
      setMessage(msg);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-amber-50/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white border border-coffee-200/20 shadow-xl space-y-6"
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center shadow-lg">
            <Coffee className="w-6 h-6 text-amber-50" />
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight text-coffee-950 font-serif">Reset Password</h2>
          <p className="text-gray-500 text-xs">Recover access to your account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-coffee-800 text-xs flex gap-2 items-center">
            <CheckCircle2 className="w-4 h-4 text-coffee-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-coffee-900">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                <input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all"
            >
              {isLoading ? 'Requesting Code...' : 'Send Recovery Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-coffee-900">Verification Code</label>
              <input 
                type="text"
                required
                placeholder="6-digit code from console logs"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-coffee-900">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-coffee-900">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all"
            >
              {isLoading ? 'Resetting Password...' : 'Save Password'}
            </button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-coffee-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      </motion.div>
    </div>
  );
}
