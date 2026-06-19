import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Verify() {
  const { verify } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const msg = await verify(email, code);
      setMessage(msg);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Verification failed.');
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
          <h2 className="font-extrabold text-2xl tracking-tight text-coffee-950 font-serif">Verify Account</h2>
          <p className="text-gray-500 text-xs">Enter verification code sent to your console logs</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-coffee-900">Email Address</label>
            <input 
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-coffee-900">6-Digit Verification Code</label>
            <input 
              type="text"
              required
              placeholder="e.g. 123456"
              maxLength="6"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-coffee-200 text-xs text-center tracking-widest font-mono font-bold focus:ring-1 focus:ring-coffee-500 focus:outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all"
          >
            {isLoading ? 'Verifying Account...' : 'Verify Email'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already verified?{' '}
          <Link to="/login" className="font-bold text-coffee-700 hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
