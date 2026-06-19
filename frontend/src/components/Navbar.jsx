import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { Coffee, ShoppingBag, Bell, User, LogOut, Menu, X, Check, ShieldAlert, Palette } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cafe_theme') || 'theme-warm-crema';
    document.body.className = saved;
    return saved;
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('cafe_theme') || 'theme-warm-crema';
    document.body.className = saved;
  }, []);

  const handleThemeChange = (newTheme) => {
    document.body.className = newTheme;
    localStorage.setItem('cafe_theme', newTheme);
    setTheme(newTheme);
    setShowThemeMenu(false);
  };
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  const scrollToSection = (id) => {
    setIsOpen(false);
    if (!isLandingPage) {
      navigate('/#' + id);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect shadow-glass border-b border-coffee-200/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Coffee className="w-5 h-5 text-amber-100" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-coffee-900 font-serif">
              Morning<span className="text-coffee-600"> Place</span>
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('home')} className="text-coffee-950/80 hover:text-coffee-700 font-medium transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-coffee-950/80 hover:text-coffee-700 font-medium transition-colors">About</button>
            <button onClick={() => scrollToSection('specials')} className="text-coffee-950/80 hover:text-coffee-700 font-medium transition-colors">Specials</button>
            <button onClick={() => scrollToSection('reviews')} className="text-coffee-950/80 hover:text-coffee-700 font-medium transition-colors">Reviews</button>
            <button onClick={() => scrollToSection('contact')} className="text-coffee-950/80 hover:text-coffee-700 font-medium transition-colors">Contact</button>
          </div>

          {/* Action widgets */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            {user && user.role === 'ROLE_CUSTOMER' && (
              <Link to="/cart" className="relative p-2 rounded-xl text-coffee-800 hover:bg-coffee-100/50 hover:text-coffee-600 transition-all">
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications drop-down */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative p-2 rounded-xl text-coffee-800 hover:bg-coffee-100/50 hover:text-coffee-600 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border border-white animate-pulse"></span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white shadow-xl border border-coffee-200/30 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gradient-to-r from-coffee-800 to-coffee-900 text-amber-50 flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications ({unreadCount})</span>
                      <button onClick={() => setShowNotif(false)} className="text-amber-200 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-xs">No notifications yet.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={`p-3 text-xs transition-colors cursor-pointer flex gap-2 items-start ${notif.read ? 'bg-white hover:bg-gray-50' : 'bg-amber-50/50 hover:bg-amber-50'}`}
                          >
                            <div className="mt-0.5">
                              {notif.read ? (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-gray-700 ${!notif.read && 'font-semibold'}`}>{notif.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-xl text-coffee-800 hover:bg-coffee-100/50 hover:text-coffee-600 transition-all flex items-center gap-1.5"
                title="Change Background Theme"
              >
                <Palette className="w-5 h-5" />
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-white shadow-xl border border-coffee-200/30 p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-coffee-500 uppercase tracking-wider">
                    Background Flavor
                  </div>
                  <button
                    onClick={() => handleThemeChange('theme-warm-crema')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${theme === 'theme-warm-crema' ? 'bg-coffee-100 text-coffee-950 font-bold' : 'text-coffee-800 hover:bg-coffee-50'}`}
                  >
                    <span>Warm Latte (Crema)</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#fdfbf7] border-2 border-[#efe3cf]"></span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('theme-midnight-espresso')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${theme === 'theme-midnight-espresso' ? 'bg-coffee-900 text-amber-50 font-bold' : 'text-coffee-800 hover:bg-coffee-50'}`}
                  >
                    <span>Midnight Espresso</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#110804] border-2 border-[#4a2c1b]"></span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('theme-matcha-velvet')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${theme === 'theme-matcha-velvet' ? 'bg-green-100 text-green-950 font-bold' : 'text-coffee-800 hover:bg-coffee-50'}`}
                  >
                    <span>Matcha Velvet</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f7f9f5] border-2 border-[#c2d9ab]"></span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile/Auth Button */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-coffee-900 font-bold text-sm hover:text-coffee-600 transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 font-bold text-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {user && user.role === 'ROLE_CUSTOMER' && (
              <Link to="/cart" className="relative p-2 rounded-xl text-coffee-800">
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-coffee-900 hover:bg-coffee-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden glass-effect-strong border-t border-coffee-200/20 px-4 pt-2 pb-4 space-y-2">
          <button onClick={() => scrollToSection('home')} className="block w-full text-left py-2 px-3 rounded-lg text-coffee-950 hover:bg-coffee-100 font-medium">Home</button>
          <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 px-3 rounded-lg text-coffee-950 hover:bg-coffee-100 font-medium">About</button>
          <button onClick={() => scrollToSection('specials')} className="block w-full text-left py-2 px-3 rounded-lg text-coffee-950 hover:bg-coffee-100 font-medium">Specials</button>
          <button onClick={() => scrollToSection('reviews')} className="block w-full text-left py-2 px-3 rounded-lg text-coffee-950 hover:bg-coffee-100 font-medium">Reviews</button>
          <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 px-3 rounded-lg text-coffee-950 hover:bg-coffee-100 font-medium">Contact</button>
          <hr className="border-coffee-200/20 my-2" />
          {user ? (
            <div className="space-y-2">
              <Link to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 px-3 rounded-lg text-coffee-950 hover:bg-coffee-100 font-medium">
                <User className="w-5 h-5" /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg text-red-700 hover:bg-red-50 font-medium">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2.5 rounded-lg border border-coffee-400 text-coffee-900 font-bold text-sm">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-2.5 rounded-lg bg-coffee-800 text-white font-bold text-sm">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
