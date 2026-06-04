import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { FiMail, FiHash } from 'react-icons/fi';

const VerifyEmail = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [mouseOnCard, setMouseOnCard] = useState(false);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [touchDevice, setTouchDevice] = useState(true);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try { setTouchDevice(!window.matchMedia('(hover: hover) and (pointer: fine)').matches); } catch (e) {}
    if (touchDevice) return;
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [touchDevice]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/auth/verify-email', { email, code }); navigate('/login'); }
    catch (err) { setError(err.response?.data?.error || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleCardMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a] relative overflow-hidden">
      {!touchDevice && <style>{`body,*,a,button,input{cursor:none!important}`}</style>}
      {!touchDevice && <>
        <motion.div className="fixed w-2 h-2 bg-white/80 rounded-full pointer-events-none z-[200]" style={{ top: 0, left: 0 }} animate={{ x: cursorPos.x - 4, y: cursorPos.y - 4 }} transition={{ type: "tween", duration: 0.05 }} />
        <motion.div className="fixed w-6 h-6 border border-white/40 rounded-full pointer-events-none z-[200]" style={{ top: 0, left: 0 }} animate={{ x: cursorPos.x - 12, y: cursorPos.y - 12, scale: mouseOnCard ? 1.5 : 1 }} transition={{ type: "tween", duration: 0.08 }} />
      </>}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-20">
        <div ref={cardRef} className="relative border border-gray-800 bg-[#0f0f0f] p-8 overflow-hidden" onMouseEnter={() => !touchDevice && setMouseOnCard(true)} onMouseLeave={() => !touchDevice && setMouseOnCard(false)} onMouseMove={handleCardMove}>
          {!touchDevice && <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" style={{ background: `radial-gradient(circle 200px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(255,255,255,0.05), transparent 70%)`, opacity: mouseOnCard ? 1 : 0 }} />}
          <div className="relative z-10">
            <div className="text-center mb-8"><h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Verify Email</h1><p className="text-gray-500 font-mono text-xs">Enter the code sent to your email</p></div>
            {error && <div className="border border-red-500/30 text-red-400 px-4 py-3 mb-6 text-sm font-mono">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" /></div>
              <div className="relative"><FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input required placeholder="Verification Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={8} className="w-full pl-10 pr-4 py-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono uppercase tracking-widest text-center text-lg" /></div>
              <button type="submit" disabled={loading} className="w-full bg-[#ff6b35] text-black py-4 font-black text-lg uppercase tracking-[0.2em] border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300 disabled:opacity-50">{loading ? '...' : 'Verify'}</button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;