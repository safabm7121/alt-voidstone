import { useState } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api.post('/subscribe', { email });
      toast.success(res.data.message);
      setEmail('');
    } catch (err) {
      toast.error('Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
   <section className="relative z-10 border-t-4 border-b-4 border-gray-800 py-16 px-4 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto text-center">
      <motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, amount: 0.3 }}
  className="border-2 border-gray-800 p-8 md:p-12"
>
          <div className="text-center mb-8">
            <p className="text-xs font-mono text-gray-500 tracking-[0.3em] uppercase mb-2">
              The Voidstone Dispatch
            </p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Join the Inner Circle
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-12 h-[1px] bg-[#ff6b35]" />
              <span className="text-[10px] font-mono text-gray-600 tracking-[0.2em]">NO. 001 — EST. 2024</span>
              <div className="w-12 h-[1px] bg-[#ff6b35]" />
            </div>
          </div>

          <div className="border-t border-gray-800 mb-6" />

          <p className="text-gray-400 font-mono text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            Receive early access to new drops, exclusive behind-the-scenes content, 
            and invitations to private events. No spam — just artistry.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 bg-[#111] border border-gray-700 text-white placeholder-gray-500 font-mono text-sm focus:border-[#ff6b35] focus:outline-none transition-colors"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-[#ff6b35] text-black font-black uppercase tracking-wider text-sm border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? '...' : 'Subscribe'}
            </motion.button>
          </form>

          <div className="border-t border-gray-800 mt-8 pt-4">
            <p className="text-[10px] font-mono text-gray-600 tracking-[0.2em]">
              BY SUBSCRIBING, YOU AGREE TO RECEIVE EMAILS FROM VOIDSTONE STUDIO.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;