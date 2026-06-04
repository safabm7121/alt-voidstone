import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [mouseOnCard, setMouseOnCard] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    await register(form);
    window.location.href = '/verify-email';
  } catch (err) {
    setError(err.response?.data?.error || t('auth.registerFailed'));
    setLoading(false);
  }
};

  const handleCardMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setSpotlightPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a] relative overflow-hidden">
      <style>{`
        body, * { cursor: none !important; }
        a, button, [role="button"], input { cursor: none !important; }
      `}</style>

      <motion.div
        className="fixed w-2 h-2 bg-white/80 rounded-full pointer-events-none z-[200]"
        style={{ top: 0, left: 0 }}
        animate={{ x: cursorPos.x - 4, y: cursorPos.y - 4 }}
        transition={{ type: "tween", duration: 0.05 }}
      />
      <motion.div
        className="fixed w-6 h-6 border border-white/40 rounded-full pointer-events-none z-[200]"
        style={{ top: 0, left: 0 }}
        animate={{
          x: cursorPos.x - 12,
          y: cursorPos.y - 12,
          scale: mouseOnCard ? 1.5 : 1,
        }}
        transition={{ type: "tween", duration: 0.08 }}
      />

      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-20">
        <div 
          ref={cardRef}
          className="relative border border-gray-800 bg-[#0f0f0f] p-8 overflow-hidden"
          onMouseEnter={() => setMouseOnCard(true)}
          onMouseLeave={() => setMouseOnCard(false)}
          onMouseMove={handleCardMove}
        >
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 200px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(255,255,255,0.05), transparent 70%)`,
              opacity: mouseOnCard ? 1 : 0,
            }}
          />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">{t('auth.register')}</h1>
              <p className="text-gray-500 font-mono text-xs">Join Voidstone Studio</p>
            </div>

            {error && (
              <div className="border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm font-mono">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input required placeholder={t('auth.firstName')} value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                </div>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input required placeholder={t('auth.lastName')} value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                </div>
              </div>

              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" required placeholder={t('auth.email')} value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} required placeholder={t('auth.password')} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#ff6b35] text-black py-4 font-black text-lg uppercase tracking-[0.2em] border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '...' : t('auth.register')}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6 font-mono">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-[#ff6b35] hover:text-[#ff8555] transition">{t('auth.login')}</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;