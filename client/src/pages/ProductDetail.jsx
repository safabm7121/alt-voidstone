import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatDT } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isAdmin = user?.email === 'voidstonestudio@gmail.com';

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => navigate('/products'));
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleAdd = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    addToCart({ ...product, quantity: qty });
  };

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/800'];
  const splitCategory = (cat) => {
    if (!cat) return { main: '', sub: '' };
    const parts = cat.split(' ');
    return parts.length >= 2 ? { main: parts[0], sub: parts.slice(1).join(' ') } : { main: cat, sub: '' };
  };
  const { main, sub } = splitCategory(product.category);

  const nextImage = () => setCurrentImage(prev => prev === images.length - 1 ? 0 : prev + 1);
  const prevImage = () => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-purple-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-purple-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Image Gallery - fits image, no background */}
        <div className="lg:w-3/5">
          <div className="relative rounded-2xl overflow-hidden cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
            <motion.img
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[currentImage]}
              alt={product.name}
              className="w-full h-auto"
            />

            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow">
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImage + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === currentImage ? 'border-purple-600' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:w-2/5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">{main}</span>
              {sub && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">{sub}</span>}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">by {product.designer || 'Voidstone Studio'}</p>
            <p className="text-3xl font-bold text-purple-600 mb-6">{formatDT(product.price)}</p>

            <div className="mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">#{tag}</span>
                ))}
              </div>
            )}

            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600">{product.stock_quantity} in stock</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700"><FiMinus className="w-4 h-4" /></button>
                <span className="px-6 py-3 font-medium text-lg min-w-[60px] text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700"><FiPlus className="w-4 h-4" /></button>
              </div>
            </div>

            <button onClick={handleAdd} disabled={product.stock_quantity === 0}
              className="w-full bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 disabled:bg-gray-300 transition font-medium text-lg flex items-center justify-center gap-2">
              <FiShoppingCart className="w-5 h-5" />
              {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-sm text-gray-500 mt-3">
                <Link to="/login" className="text-purple-600 hover:underline">Login</Link> to add items to cart
              </p>
            )}

            {isAdmin && (
              <Link to={`/admin/create-product?id=${product._id}`} className="block text-center text-sm text-purple-600 hover:underline mt-4">Edit this product</Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}>
            <button onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-50">
              <FiX className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full z-50">
              <FiChevronLeft className="w-8 h-8" />
            </button>
            <motion.img key={currentImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              src={images[currentImage]} alt={product.name}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full z-50">
              <FiChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 text-white text-sm">{currentImage + 1} / {images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;