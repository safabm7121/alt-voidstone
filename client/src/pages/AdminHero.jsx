import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUpload, FiTrash2, FiLink, FiSave } from 'react-icons/fi';

const AdminHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hero, setHero] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('upload');

  if (!user || user.email !== 'voidstonestudio@gmail.com') return <Navigate to="/" />;

  useEffect(() => { fetchHero(); }, []);

  const fetchHero = async () => {
    try {
      const res = await api.get('/hero/active');
      if (res.data.hero) {
        setHero(res.data.hero);
        setTitle(res.data.hero.title || '');
        setSubtitle(res.data.hero.subtitle || '');
        setButtonText(res.data.hero.buttonText || '');
      }
    } catch (err) { console.error('Error fetching hero:', err); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaUrl('');
      setPreview(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlPreview = () => {
    if (mediaUrl.trim()) { setMediaFile(null); setPreview(mediaUrl); }
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve({ imageData: base64, imageType: file.type, fileSize: file.size });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mediaFile) {
        const { imageData, imageType, fileSize } = await readFileAsBase64(mediaFile);
        await api.post('/hero/upload', { imageData, imageType, fileSize });
      } else if (mediaUrl && preview) {
        const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)/i.test(mediaUrl);
        await api.post('/hero/upload', { mediaUrl, imageType: isVideo ? 'video/mp4' : 'image/jpeg', fileSize: 0 });
      }
      await api.put('/hero/text', { title, subtitle, buttonText });
      toast.success('Hero updated successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update hero');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete hero media? This cannot be undone.')) {
      try {
        await api.delete('/hero/image');
        setHero(null); setPreview(null); setMediaFile(null); setMediaUrl('');
        toast.success('Hero media deleted');
        navigate('/');
      } catch (err) { toast.error('Failed to delete hero media'); }
    }
  };

  const getMediaSrc = (h) => {
    if (!h?.mediaData) return null;
    if (h.isUrl) return h.mediaData;
    return `data:${h.mediaType};base64,${h.mediaData}`;
  };

  const isVideo = (file, url) => {
    if (file) return file.type.startsWith('video/');
    if (url) return /\.(mp4|webm|ogg|mov|avi|mkv)/i.test(url);
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="max-w-4xl mx-auto px-4 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Edit Hero Section</h1>
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[#ff6b35] transition font-mono text-sm">← Back to site</button>
          </div>

          {hero && (
            <div className="border border-gray-800 bg-[#0f0f0f] p-6 mb-8">
              <h2 className="text-lg font-black text-white mb-4 uppercase tracking-tighter">Current Hero</h2>
              <div className="relative overflow-hidden h-64 border border-gray-800">
                {hero.mediaCategory === 'video' ? (
                  <video src={getMediaSrc(hero)} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                  <img src={getMediaSrc(hero)} alt="Current hero" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-2xl font-black uppercase">{hero.title}</p>
                    <p className="text-sm font-mono text-gray-300">{hero.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border border-gray-800 bg-[#0f0f0f] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VOIDSTONE STUDIO"
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Subtitle</label>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Handcrafted maximalism..."
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Explore Collection"
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tighter">Hero Media</h3>
                <div className="flex gap-2 mb-6">
                  <button type="button" onClick={() => setTab('upload')}
                    className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition border ${tab === 'upload' ? 'bg-[#ff6b35] text-black border-[#ff6b35]' : 'border-gray-800 text-gray-400 hover:border-[#ff6b35] hover:text-[#ff6b35]'}`}>
                    <FiUpload className="inline mr-2" />Upload File
                  </button>
                  <button type="button" onClick={() => setTab('url')}
                    className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition border ${tab === 'url' ? 'bg-[#ff6b35] text-black border-[#ff6b35]' : 'border-gray-800 text-gray-400 hover:border-[#ff6b35] hover:text-[#ff6b35]'}`}>
                    <FiLink className="inline mr-2" />URL
                  </button>
                </div>

                {tab === 'upload' ? (
                  <div className="border-2 border-dashed border-gray-800 p-8 text-center hover:border-[#ff6b35] transition cursor-pointer">
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="hero-media-upload" />
                    <label htmlFor="hero-media-upload" className="cursor-pointer">
                      <FiUpload className="mx-auto text-4xl text-gray-500 mb-3" />
                      <p className="text-gray-500 font-mono text-sm">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-600 font-mono mt-1">Images: JPG, PNG, WebP, GIF | Videos: MP4, WebM</p>
                      <p className="text-xs text-gray-600 font-mono">Max: 50MB (images) / 200MB (videos)</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/hero-image.jpg or .mp4"
                      className="flex-1 p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
                    <button type="button" onClick={handleUrlPreview}
                      className="px-6 py-3 border border-gray-800 text-gray-400 font-mono text-sm hover:border-[#ff6b35] hover:text-[#ff6b35] transition">Preview</button>
                  </div>
                )}
              </div>

              {preview && (
                <div className="mt-6">
                  <h4 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Preview</h4>
                  <div className="relative overflow-hidden max-h-80 border border-gray-800">
                    {isVideo(mediaFile, mediaUrl) ? (
                      <video src={preview} controls className="w-full max-h-80" />
                    ) : (
                      <img src={preview} alt="Preview" className="w-full object-contain max-h-80 bg-[#111]" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <button type="button" onClick={handleDelete}
                  className="flex items-center gap-2 px-6 py-3 border border-red-500/30 text-red-400 font-mono text-sm uppercase tracking-wider hover:bg-red-500/10 transition">
                  <FiTrash2 />Delete Hero Media
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => navigate('/')}
                    className="px-6 py-3 border border-gray-800 text-gray-400 font-mono text-sm uppercase tracking-wider hover:border-[#ff6b35] hover:text-[#ff6b35] transition">Cancel</button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#ff6b35] text-black font-black uppercase tracking-wider border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition disabled:opacity-50">
                    <FiSave />{loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminHero;