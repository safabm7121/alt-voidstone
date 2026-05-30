import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiTrash2, FiLink, FiX } from 'react-icons/fi';

const mainCategories = ['Men', 'Women', 'Art'];
const subCategoriesByGender = {
  Men: ['Accessories', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Coats', 'Bags', 'Shoes', 'Hats'],
  Women: ['Accessories', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Coats', 'Dresses', 'Skirts', 'Bags', 'Shoes', 'Hats']
};

const CreateProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [imageLinks, setImageLinks] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [mainCategory, setMainCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', designer: 'Voidstone Studio', stock_quantity: '0'
  });

  if (!user || user.email !== 'voidstonestudio@gmail.com') return null;

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
    maxSize: 5 * 1024 * 1024
  });

  const addImageLinks = () => {
    if (imageLinks.trim()) {
      const links = imageLinks.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
      setImages([...images, ...links]);
      setImageLinks('');
      toast.success(`${links.length} URL(s) added`);
    }
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.name || !form.description || !form.price || !mainCategory) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    if ((mainCategory === 'Men' || mainCategory === 'Women') && !subCategory) {
      setError(`Please select a subcategory for ${mainCategory}`);
      setLoading(false);
      return;
    }

    let category = mainCategory;
    if (mainCategory !== 'Art' && subCategory) category = `${mainCategory} ${subCategory}`;

    try {
      await api.post('/products', {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity) || 0,
        category,
        images,
        tags
      });
      toast.success('Product created!');
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="max-w-3xl mx-auto px-4 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-8">Create New Product</h1>

          {error && (
            <div className="border border-red-500/30 text-red-400 p-4 mb-6 font-mono text-sm bg-red-500/5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 border border-gray-800 bg-[#0f0f0f] p-8">
            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Product Name *</label>
              <input required placeholder="Product name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Description *</label>
              <textarea required placeholder="Product description" rows={4} value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Price (DT) *</label>
                <input required type="number" step="0.001" placeholder="0.000" value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Stock Quantity</label>
                <input type="number" placeholder="0" value={form.stock_quantity}
                  onChange={e => setForm({...form, stock_quantity: e.target.value})}
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Main Category *</label>
                <select value={mainCategory} onChange={e => { setMainCategory(e.target.value); setSubCategory(''); }}
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white focus:border-[#ff6b35] focus:outline-none transition font-mono">
                  {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {(mainCategory === 'Men' || mainCategory === 'Women') && (
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Subcategory *</label>
                  <select value={subCategory} onChange={e => setSubCategory(e.target.value)}
                    className="w-full p-3 bg-[#111] border border-gray-800 text-white focus:border-[#ff6b35] focus:outline-none transition font-mono">
                    <option value="">Select subcategory</option>
                    {subCategoriesByGender[mainCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Designer</label>
              <input placeholder="Voidstone Studio" value={form.designer}
                onChange={e => setForm({...form, designer: e.target.value})}
                className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Images</label>
              <div {...getRootProps()} className={`border-2 border-dashed p-8 text-center cursor-pointer transition ${isDragActive ? 'border-[#ff6b35] bg-[#ff6b35]/5' : 'border-gray-800 hover:border-gray-600'}`}>
                <input {...getInputProps()} />
                <FiUpload className="mx-auto text-3xl text-gray-500 mb-2" />
                <p className="font-mono text-sm text-gray-500">{isDragActive ? 'Drop images here...' : 'Drag & drop images or click to select'}</p>
                <p className="text-xs text-gray-600 font-mono mt-1">JPG, PNG, WebP up to 5MB each</p>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Or add image URLs</label>
                <div className="flex gap-2">
                  <textarea placeholder="https://example.com/image.jpg" rows={2} value={imageLinks}
                    onChange={e => setImageLinks(e.target.value)}
                    className="flex-1 p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono text-sm" />
                  <button type="button" onClick={addImageLinks}
                    className="px-4 py-2 border border-gray-800 text-gray-400 hover:border-[#ff6b35] hover:text-[#ff6b35] transition">
                    <FiLink />
                  </button>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group border border-gray-800">
                      <img src={img} alt="" className="w-full h-24 object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Tags</label>
              <input placeholder="Type tag and press Enter" value={tagInput}
                onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono" />
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-[#111] border border-gray-800 px-3 py-1 text-xs font-mono text-gray-300">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-400"><FiX size={14} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button type="button" onClick={() => navigate('/products')}
                className="px-6 py-3 border border-gray-800 text-gray-400 font-mono uppercase tracking-wider hover:border-[#ff6b35] hover:text-[#ff6b35] transition">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#ff6b35] text-black py-3 font-black uppercase tracking-wider border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProduct;