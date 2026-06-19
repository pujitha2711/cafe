import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Coffee, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Welcome to Aroma Haven support. How can I help you today? Ask about our specialty coffees, working hours, or active offers! ☕", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chatbot', { message: userText });
      setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Sorry, I am having trouble connecting right now. Can I help you with anything else?", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-[350px] sm:w-[380px] h-[480px] rounded-3xl bg-white shadow-2xl border border-coffee-200/40 overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-coffee-800 to-coffee-950 text-amber-50 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow">
                  <Coffee className="w-4 h-4 text-coffee-950" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide flex items-center gap-1 font-serif">
                    Aroma AI <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  </h4>
                  <span className="text-[10px] text-amber-200">Online | Barista Assistant</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-amber-50/20">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.isBot 
                        ? 'bg-white text-coffee-950 rounded-tl-none border border-coffee-100' 
                        : 'bg-gradient-to-br from-coffee-600 to-coffee-800 text-white rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-coffee-950 rounded-2xl rounded-tl-none border border-coffee-100 px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-coffee-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-coffee-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-coffee-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-coffee-100 flex gap-2">
              <input 
                type="text"
                placeholder="Ask something..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:outline-none focus:ring-1 focus:ring-coffee-500"
              />
              <button 
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-800 text-white hover:shadow-md active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-coffee-700 to-coffee-900 text-amber-50 flex items-center justify-center shadow-2xl hover:shadow-coffee-900/20 z-50 border border-coffee-600/30"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
