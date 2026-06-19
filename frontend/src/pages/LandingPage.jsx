import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Coffee, Clock, Heart, Award, ArrowRight, Star, Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import heroBg from '../assets/morning_place_landing.png';

export default function LandingPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Fetch products and show 3-4 top items on landing page
    axios.get('/api/products')
      .then(res => {
        setFeaturedProducts(res.data.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&q=80", title: "Artisanal Brewing" },
    { url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=500&q=80", title: "Fresh Roasts" },
    { url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=80", title: "Cozy Ambiance" },
    { url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80", title: "Gourmet Selections" },
    { url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=500&q=80", title: "Espresso Art" },
    { url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&q=80", title: "Sweet Treats" }
  ];

  return (
    <div className="bg-amber-50/20" id="home">
      {/* 1. HERO SECTION */}
      <section 
        className="relative h-[85vh] bg-cover bg-center flex items-center" 
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-950 via-coffee-950/80 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-amber-50 space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold tracking-wider uppercase">
              <Coffee className="w-3.5 h-3.5" /> Welcome to Morning Place
            </span>
            <h1 className="text-4xl sm:text-6xl font-black font-serif leading-tight glow-text">
              Crafting Moments, <br />
              <span className="text-amber-400">One Sip At A Time</span>
            </h1>
            <p className="text-amber-100/80 text-sm sm:text-lg">
              Experience the rich legacy of roasted specialty beans, fresh ingredients, and a warm dining atmosphere designed for coffee lovers.
            </p>
            <div className="flex gap-4 pt-2">
              <Link to={user ? "/menu" : "/register"} className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 text-coffee-950 font-extrabold text-sm rounded-2xl hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                Order Online Now <ArrowRight className="w-4 h-4" />
              </Link>
              {!user && (
                <Link to="/login" className="px-6 py-3.5 border border-amber-500/40 text-amber-300 font-bold text-sm rounded-2xl hover:bg-white/5 active:scale-95 transition-all">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT US */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-coffee-600">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-black text-coffee-950 font-serif">Brewed With Passion Since 2012</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Morning Place began as a humble espresso cart in the heart of the city. Guided by our founders' passion for micro-lot single-origin beans, we have grown into a community sanctuary where friends meet, ideas brew, and premium coffee is celebrated.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-coffee-200/20 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-coffee-700"><Heart className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-sm text-coffee-950">Mission</h4>
                  <p className="text-xs text-gray-500">Provide ethical, specialty-grade coffee with heart.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-coffee-200/20 shadow-sm flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-coffee-700"><Award className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-sm text-coffee-950">Specialty</h4>
                  <p className="text-xs text-gray-500">Custom in-house roasting profiles and fresh sourdough.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-coffee-800 to-coffee-950 text-amber-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h5 className="font-bold text-xs">Working Hours</h5>
                  <p className="text-[10px] text-amber-200">Daily: 07:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            <img className="rounded-3xl shadow-md w-full h-64 object-cover rotate-[-2deg] hover:rotate-0 transition-transform duration-300" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80" alt="Cafe Kitchen" />
            <img className="rounded-3xl shadow-md w-full h-64 object-cover translate-y-6 rotate-[2deg] hover:rotate-0 transition-transform duration-300" src="https://images.unsplash.com/photo-1498804103079-a6351b050096?w=500&q=80" alt="Dine In" />
          </div>
        </div>
      </section>

      {/* 3. FEATURED MENU */}
      <section className="py-20 bg-coffee-100/30" id="specials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-wider text-coffee-600">Featured Specials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-coffee-950 font-serif">Customer Favorites</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Explore our highly recommended artisan creations handcrafted by our lead baristas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 py-8">Loading favorites...</div>
            ) : (
              featuredProducts.map((product) => (
                <div key={product.id} className="rounded-3xl bg-white border border-coffee-200/20 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-lg text-coffee-950 font-serif">{product.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-coffee-800 text-xs font-bold">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-4 h-4 fill-amber-500" /> {product.rating}
                      </span>
                      <button 
                        onClick={() => {
                          if (!user) {
                            navigate('/login');
                          } else {
                            addToCart(product);
                            navigate('/cart');
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-800 text-white hover:shadow"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center pt-4">
            <Link to="/menu" className="inline-flex items-center gap-2 text-coffee-700 hover:text-coffee-900 font-extrabold text-sm transition-colors">
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. GALLERY */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs uppercase font-extrabold tracking-wider text-coffee-600">Visual Journey</span>
          <h2 className="text-3xl sm:text-4xl font-black text-coffee-950 font-serif font-bold">Our Cafe Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {galleryImages.map((img, i) => (
            <div key={i} className="relative rounded-3xl overflow-hidden group shadow-sm h-60">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-coffee-950/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-amber-50 font-bold text-sm font-serif">{img.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. REVIEWS & TESTIMONIALS */}
      <section className="py-20 bg-gradient-to-br from-coffee-900 to-coffee-950 text-amber-50" id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif">Loved By Customers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex gap-1 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /></div>
              <p className="text-amber-100/80 text-xs italic">"Hands down the best Vanilla Latte in the valley! The atmosphere is perfect for study sessions and the baristas are always smiling."</p>
              <h5 className="font-bold text-xs text-amber-300">— Sarah Jenkins</h5>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex gap-1 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /></div>
              <p className="text-amber-100/80 text-xs italic">"The sourdough avocado toast combined with their single-origin cold brew is my daily ritual. High-end coffee and premium service!"</p>
              <h5 className="font-bold text-xs text-amber-300">— David Miller</h5>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex gap-1 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /></div>
              <p className="text-amber-100/80 text-xs italic">"I love their AI chat support assistant. Ordered and tracked my sandwich in seconds. The automated delivery is incredibly fast."</p>
              <h5 className="font-bold text-xs text-amber-300">— Amanda Ross</h5>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT US */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="contact">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-coffee-600">Get In Touch</span>
              <h2 className="text-3xl sm:text-4xl font-black text-coffee-950 font-serif">Drop By Or Contact Us</h2>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-coffee-600" />
                <span className="text-gray-600 text-sm">128 Gourmet Street, Coffee Valley, CV 90210</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-coffee-600" />
                <span className="text-gray-600 text-sm">+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-coffee-600" />
                <span className="text-gray-600 text-sm">support@cafemanage.com</span>
              </div>
            </div>
          </div>

          {/* Simple Contact Form */}
          <form className="p-8 rounded-3xl bg-white border border-coffee-200/20 shadow-lg space-y-4">
            <h3 className="font-extrabold text-lg text-coffee-950 font-serif">Send Us A Message</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="w-full px-4 py-3 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" />
              <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none" />
            </div>
            <textarea placeholder="Your Message..." rows="4" className="w-full px-4 py-3 border border-coffee-200 rounded-xl text-xs focus:ring-1 focus:ring-coffee-500 focus:outline-none"></textarea>
            <button type="submit" onClick={e => { e.preventDefault(); alert("Thanks! We'll get back to you shortly.") }} className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-950 text-amber-50 font-extrabold text-xs rounded-xl shadow hover:shadow-md">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-coffee-950 text-amber-200/70 text-xs py-8 border-t border-coffee-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-amber-50 text-sm font-serif">Morning Place</span>
          </div>
          <p>© 2026 Morning Place. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
