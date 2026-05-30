import { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiSend, FiMail, FiUser, FiMessageSquare } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact/send', form);
      toast.success('Message sent!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="max-w-2xl mx-auto px-4 py-20 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-center mb-4">Contact Us</h1>
          <p className="text-center text-gray-500 font-mono text-sm mb-12">Get in touch with Voidstone Studio</p>
          
          <div className="border border-gray-800 bg-[#0f0f0f] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FiUser className="absolute left-3 top-4 text-gray-500" />
                <input 
                  required 
                  placeholder="Your Name" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" 
                />
              </div>
              
              <div className="relative">
                <FiMail className="absolute left-3 top-4 text-gray-500" />
                <input 
                  required 
                  type="email" 
                  placeholder="Your Email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" 
                />
              </div>
              
              <div className="relative">
                <FiMessageSquare className="absolute left-3 top-4 text-gray-500" />
                <textarea 
                  required 
                  rows="6" 
                  placeholder="Your Message" 
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})} 
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono resize-none" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ff6b35] text-black py-4 font-black text-lg uppercase tracking-[0.2em] border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiSend className="w-5 h-5" />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;