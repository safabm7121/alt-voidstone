import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUsers, FiArrowLeft, FiX } from 'react-icons/fi';

const SubscriberCount = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    api.get('/subscribe/count').then(res => setCount(res.data.count)).catch(() => {});
  }, []);
  return <span>{count} active subscribers</span>;
};

const AdminNewsletter = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isAdmin = user?.email === 'voidstonestudio@gmail.com' || user?.role === 'admin';
  if (!isAdmin) return <Navigate to="/" />;

  const handleSend = async () => {
    if (!subject || !htmlContent) return toast.error('Subject and content required');
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await api.post('/subscribe/send', { subject, content: htmlContent });
      toast.success(res.data.message);
      setSubject('');
      setHtmlContent('');
    } catch (err) {
      toast.error('Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#ff6b35] font-mono text-xs mb-8 transition">
            <FiArrowLeft className="w-3 h-3" /> BACK TO DASHBOARD
          </Link>

          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Send Newsletter</h1>
              <p className="text-sm text-gray-500 font-mono mt-2">
                <FiUsers className="inline mr-1" /> <SubscriberCount />
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-gray-700 text-gray-400 font-mono text-xs uppercase hover:border-gray-500 transition"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <motion.button
                onClick={handleSend}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-[#ff6b35] text-black font-black uppercase tracking-wider text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send to All'}
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject line..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-4 bg-[#111] border border-gray-700 text-white placeholder-gray-500 font-mono text-sm focus:border-[#ff6b35] focus:outline-none"
            />

            {showPreview ? (
              <div className="border border-gray-700 bg-white">
                <iframe
                  srcDoc={htmlContent}
                  title="Preview"
                  className="w-full min-h-[600px]"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            ) : (
              <textarea
                placeholder="Paste your HTML email content here..."
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={20}
                className="w-full p-4 bg-[#111] border border-gray-700 text-white placeholder-gray-500 font-mono text-sm focus:border-[#ff6b35] focus:outline-none resize-y"
              />
            )}
          </div>

          <div className="mt-8 p-6 border border-gray-800 bg-[#0f0f0f]">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-4">How to create your email</h2>
            <ol className="text-sm text-gray-400 font-mono space-y-2 list-decimal list-inside">
              <li>Design your email in <span className="text-[#ff6b35]">Google Docs</span> — add images, text, links</li>
              <li>Go to <span className="text-[#ff6b35]">File → Download → Web Page (.html)</span></li>
              <li>Open the downloaded file in a text editor (Notepad, VS Code)</li>
              <li>Copy everything between <code className="text-[#ff6b35]">&lt;body&gt;</code> and <code className="text-[#ff6b35]">&lt;/body&gt;</code></li>
              <li>Paste it in the text area above</li>
              <li>Write a subject line and click Send</li>
            </ol>
            <p className="text-xs text-gray-600 mt-4">Unsubscribe links are automatically added to every email.</p>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f0f] border border-gray-800 p-6 w-full max-w-sm text-center"
              onClick={e => e.stopPropagation()}
            >
              <FiSend className="w-12 h-12 text-[#ff6b35] mx-auto mb-4" />
              <h3 className="text-lg font-black text-white mb-2">Send Newsletter?</h3>
              <p className="text-gray-500 font-mono text-sm mb-2">This will be sent to <SubscriberCount />.</p>
              <p className="text-gray-600 font-mono text-xs mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 border border-gray-800 text-gray-400 font-mono uppercase tracking-wider text-sm hover:border-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSend}
                  className="flex-1 py-3 bg-[#ff6b35] text-black font-black uppercase tracking-wider text-sm hover:bg-[#ff8555] transition"
                >
                  Send Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNewsletter;