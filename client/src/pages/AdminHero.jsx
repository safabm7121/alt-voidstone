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

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const res = await api.get('/hero/active');
      if (res.data.hero) {
        setHero(res.data.hero);
        setTitle(res.data.hero.title || '');
        setSubtitle(res.data.hero.subtitle || '');
        setButtonText(res.data.hero.buttonText || '');
      }
    } catch (err) {
      console.error('Error fetching hero:', err);
    }
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
    if (mediaUrl.trim()) {
      setMediaFile(null);
      setPreview(mediaUrl);
    }
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
      // Upload media first if there is one
      if (mediaFile) {
        const { imageData, imageType, fileSize } = await readFileAsBase64(mediaFile);
        await api.post('/hero/upload', { imageData, imageType, fileSize });
      } else if (mediaUrl && preview) {
        const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)/i.test(mediaUrl);
        await api.post('/hero/upload', {
          mediaUrl,
          imageType: isVideo ? 'video/mp4' : 'image/jpeg',
          fileSize: 0
        });
      }

      // Save text
      await api.put('/hero/text', { title, subtitle, buttonText });
      
      toast.success('Hero updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.error || 'Failed to update hero');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete hero media? This cannot be undone.')) {
      try {
        await api.delete('/hero/image');
        setHero(null);
        setPreview(null);
        setMediaFile(null);
        setMediaUrl('');
        toast.success('Hero media deleted');
        navigate('/');
      } catch (err) {
        toast.error('Failed to delete hero media');
      }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Edit Hero Section</h1>
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 transition">← Back to site</button>
          </div>

          {/* Current Hero Preview */}
          {hero && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Current Hero</h2>
              <div className="relative rounded-xl overflow-hidden h-64">
                {hero.mediaCategory === 'video' ? (
                  <video src={getMediaSrc(hero)} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                  <img src={getMediaSrc(hero)} alt="Current hero" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-2xl font-bold">{hero.title}</p>
                    <p className="text-sm opacity-80">{hero.subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VOIDSTONE STUDIO"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle</label>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Handcrafted maximalism..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Explore Collection"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Hero Media</h3>
                
                <div className="flex gap-2 mb-6">
                  <button type="button" onClick={() => setTab('upload')}
                    className={`px-4 py-2 rounded-lg transition ${tab === 'upload' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <FiUpload className="inline mr-2" />Upload File
                  </button>
                  <button type="button" onClick={() => setTab('url')}
                    className={`px-4 py-2 rounded-lg transition ${tab === 'url' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <FiLink className="inline mr-2" />URL
                  </button>
                </div>

                {tab === 'upload' ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition cursor-pointer">
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="hero-media-upload" />
                    <label htmlFor="hero-media-upload" className="cursor-pointer">
                      <FiUpload className="mx-auto text-4xl text-gray-400 mb-3" />
                      <p className="text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400 mt-1">Images: JPG, PNG, WebP, GIF | Videos: MP4, WebM, OGG, MOV, AVI, MKV</p>
                      <p className="text-sm text-gray-400">Max: 50MB (images) / 200MB (videos)</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/hero-image.jpg or .mp4"
                      className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
                    <button type="button" onClick={handleUrlPreview}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition">Preview</button>
                  </div>
                )}
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <div className="relative rounded-xl overflow-hidden max-h-80">
                    {isVideo(mediaFile, mediaUrl) ? (
                      <video src={preview} controls className="w-full rounded-xl max-h-80" />
                    ) : (
                      <img src={preview} alt="Preview" className="w-full rounded-xl object-contain max-h-80 bg-gray-100 dark:bg-gray-700" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t">
                <button type="button" onClick={handleDelete}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition">
                  <FiTrash2 />Delete Hero Media
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition font-medium">
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