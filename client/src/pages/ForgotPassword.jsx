import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import MagicCard from '../components/ui/MagicCard';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      // Still show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-900 via-black to-purple-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <MagicCard gradientColor="#5227FF" gradientOpacity={0.3} gradientSize={250} className="p-0">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-gray-400 text-sm">Enter your email to receive a reset code</p>
            </div>

            {sent ? (
              <div className="text-center space-y-6">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                  If an account exists with this email, a reset code has been sent.
                </div>
                <Link to="/reset-password" className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition text-center">
                  Go to Reset Password
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" required placeholder="Email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition">
                  {loading ? '...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
                <FiArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </div>
        </MagicCard>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;