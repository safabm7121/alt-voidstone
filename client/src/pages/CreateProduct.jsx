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
    if (mainCategory !== 'Art' && subCategory) {
      category = `${mainCategory} ${subCategory}`;
    }

    const productData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category,
      designer: form.designer || 'Voidstone Studio',
      stock_quantity: parseInt(form.stock_quantity) || 0,
      images,
      tags
    };

    try {
      await api.post('/products', productData);
      toast.success('Product created!');
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-8">Create New Product</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input required placeholder="Product name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea required placeholder="Product description" rows={4} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (DT) *</label>
              <input required type="number" step="0.001" placeholder="0.000" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <input type="number" placeholder="0" value={form.stock_quantity}
                onChange={e => setForm({...form, stock_quantity: e.target.value})}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Main Category *</label>
              <select value={mainCategory} onChange={e => { setMainCategory(e.target.value); setSubCategory(''); }}
                className="w-full p-3 border rounded-xl">
                {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {(mainCategory === 'Men' || mainCategory === 'Women') && (
              <div>
                <label className="block text-sm font-medium mb-2">Subcategory *</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)}
                  className="w-full p-3 border rounded-xl">
                  <option value="">Select subcategory</option>
                  {subCategoriesByGender[mainCategory].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Designer</label>
            <input placeholder="Voidstone Studio" value={form.designer}
              onChange={e => setForm({...form, designer: e.target.value})}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input {...getInputProps()} />
              <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
              <p>{isDragActive ? 'Drop images here...' : 'Drag & drop images or click to select'}</p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each</p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Or add image URLs</label>
              <div className="flex gap-2">
                <textarea placeholder="https://example.com/image.jpg" rows={2} value={imageLinks}
                  onChange={e => setImageLinks(e.target.value)}
                  className="flex-1 p-3 border rounded-xl text-sm" />
                <button type="button" onClick={addImageLinks}
                  className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                  <FiLink />
                </button>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input placeholder="Type tag and press Enter" value={tagInput}
              onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
              className="w-full p-3 border rounded-xl" />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}><FiX size={14} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition font-medium">
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProduct;