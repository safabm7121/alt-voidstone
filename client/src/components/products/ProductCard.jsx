import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDT } from '../../utils/format';
import { FiEdit, FiTrash2, FiPlus, FiX, FiLink } from 'react-icons/fi';

const ProductCard = ({ product, onDelete, onUpdate }) => {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [imageLinkInput, setImageLinkInput] = useState('');

  const isAdmin = user?.email === 'voidstonestudio@gmail.com';

  const mainCategories = ['Men', 'Women', 'Art'];
  const subCategoriesByGender = {
    Men: ['Accessories', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Coats', 'Bags', 'Shoes', 'Hats'],
    Women: ['Accessories', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Coats', 'Dresses', 'Skirts', 'Bags', 'Shoes', 'Hats']
  };

  const splitCategory = (cat) => {
    if (!cat) return { main: 'Art', sub: '' };
    const parts = cat.split(' ');
    return parts.length >= 2 ? { main: parts[0], sub: parts.slice(1).join(' ') } : { main: cat, sub: '' };
  };

  const openEdit = () => {
    const { main, sub } = splitCategory(product.category);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      designer: product.designer || 'Voidstone Studio',
      stock_quantity: product.stock_quantity?.toString() || '0',
      mainCategory: main,
      subCategory: sub
    });
    setImages([...product.images] || []);
    setTags([...product.tags] || []);
    setEditOpen(true);
  };

  const addImageLink = () => {
    if (imageLinkInput.trim() && imageLinkInput.startsWith('http')) {
      setImages([...images, imageLinkInput.trim()]);
      setImageLinkInput('');
    }
  };

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleSave = async () => {
    setLoading(true);
    try {
      let category = form.mainCategory;
      if (form.mainCategory !== 'Art' && form.subCategory) {
        category = `${form.mainCategory} ${form.subCategory}`;
      }

      const updatedProduct = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category,
        designer: form.designer,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        images,
        tags
      };

      await api.put(`/products/${product._id}`, updatedProduct);
      toast.success('Product updated!');
      setEditOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${product._id}`);
      toast.success('Product deleted!');
      setDeleteConfirm(false);
      if (onDelete) onDelete(product._id);
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleAdd = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    addToCart(product);
  };

  // Parallax animation variants
  const parallaxVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -8,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const imageParallaxVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <motion.div
        className="border border-gray-800 bg-[#0f0f0f] overflow-hidden break-inside-avoid rounded-xl shadow-xl hover:border-gray-700 transition-colors duration-300"
        variants={parallaxVariants}
        initial="initial"
        whileHover="hover"
      >
        <Link to={`/products/${product._id}`} className="relative block overflow-hidden">
          <motion.img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-64 object-cover"
            variants={imageParallaxVariants}
            initial="initial"
            whileHover="hover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-20">
              <button
                onClick={(e) => { e.preventDefault(); openEdit(); }}
                className="p-2 bg-black/80 border border-gray-700 hover:border-white transition rounded-lg"
              >
                <FiEdit className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setDeleteConfirm(true); }}
                className="p-2 bg-black/80 border border-gray-700 hover:border-red-500 transition rounded-lg"
              >
                <FiTrash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}
        </Link>

        <div className="p-4">
          <h3 className="font-semibold text-base truncate text-white">{product.name}</h3>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{product.category}</p>
          <p className="text-xl font-black mt-1 text-white">{formatDT(product.price)}</p>
          <button
            onClick={handleAdd}
            className="mt-3 w-full bg-white/10 text-white py-2 font-bold uppercase tracking-wider text-sm border border-white/20 hover:bg-white hover:text-black transition-all duration-300 rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f0f0f] border border-gray-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Edit Product</h2>
                <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-[#111] transition border border-gray-800 rounded-lg">
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <input placeholder="Product Name" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono rounded-lg" />

                <textarea placeholder="Description" rows={3} value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono rounded-lg" />

                <div className="grid grid-cols-3 gap-3">
                  <input type="number" step="0.001" placeholder="Price" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono rounded-lg" />
                  <input type="number" placeholder="Stock" value={form.stock_quantity}
                    onChange={e => setForm({...form, stock_quantity: e.target.value})}
                    className="p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono rounded-lg" />
                  <input placeholder="Designer" value={form.designer}
                    onChange={e => setForm({...form, designer: e.target.value})}
                    className="p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select value={form.mainCategory}
                    onChange={e => setForm({...form, mainCategory: e.target.value, subCategory: ''})}
                    className="p-3 bg-[#111] border border-gray-800 text-white focus:border-white focus:outline-none transition font-mono rounded-lg">
                    {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {(form.mainCategory === 'Men' || form.mainCategory === 'Women') && (
                    <select value={form.subCategory}
                      onChange={e => setForm({...form, subCategory: e.target.value})}
                      className="p-3 bg-[#111] border border-gray-800 text-white focus:border-white focus:outline-none transition font-mono rounded-lg">
                      <option value="">Subcategory</option>
                      {subCategoriesByGender[form.mainCategory]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Images</label>
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Add image URL" value={imageLinkInput}
                      onChange={e => setImageLinkInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageLink())}
                      className="flex-1 p-2 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono text-sm rounded-lg" />
                    <button type="button" onClick={addImageLink}
                      className="px-4 py-2 bg-white/10 text-white hover:bg-white hover:text-black border border-white/20 transition text-sm rounded-lg">
                      <FiLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative group border border-gray-800 rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-20 object-cover" />
                        <button onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Tags</label>
                  <input placeholder="Type tag and press Enter" value={tagInput}
                    onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                    className="w-full p-3 bg-[#111] border border-gray-800 text-white placeholder-gray-500 focus:border-white focus:outline-none transition font-mono rounded-lg" />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-[#111] border border-gray-800 px-2 py-1 text-xs font-mono text-gray-300 rounded-lg">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-400"><FiX size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditOpen(false)}
                  className="flex-1 py-3 border border-gray-800 text-gray-400 font-mono uppercase tracking-wider hover:border-white hover:text-white transition rounded-lg">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading}
                  className="flex-1 py-3 bg-white text-black font-black uppercase tracking-wider border-2 border-white hover:bg-transparent hover:text-white transition disabled:opacity-50 rounded-lg">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0f0f0f] border border-gray-800 p-6 w-full max-w-sm text-center rounded-xl"
              onClick={e => e.stopPropagation()}
            >
              <FiTrash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-black text-white mb-2">Delete Product?</h3>
              <p className="text-gray-500 font-mono text-sm mb-6">"{product.name}" will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-3 border border-gray-800 text-gray-400 font-mono uppercase tracking-wider hover:border-white hover:text-white transition rounded-lg">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-wider border border-red-600 hover:bg-transparent hover:text-red-400 transition rounded-lg">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;