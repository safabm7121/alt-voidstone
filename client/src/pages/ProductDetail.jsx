import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatDT } from '../utils/format';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiX, FiHeart, FiShare2, FiTruck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

function CardRotate({ children, onSendToBack, sensitivity = 200 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

function ImageStack({ images, productName, onImageChange, externalIndex }) {
  const [stack, setStack] = useState(() => 
    images.map((src, index) => ({
      id: index,
      src,
      rotation: (Math.random() * 8 - 4).toFixed(2)
    }))
  );

  useEffect(() => {
    setStack(images.map((src, index) => ({
      id: index,
      src,
      rotation: (Math.random() * 8 - 4).toFixed(2)
    })));
  }, [images]);

  useEffect(() => {
    if (externalIndex !== null && externalIndex !== undefined) {
      setStack(prev => {
        const targetId = externalIndex;
        const targetIndex = prev.findIndex(card => card.id === targetId);
        if (targetIndex === -1 || targetIndex === prev.length - 1) return prev;
        const newStack = [...prev];
        const [card] = newStack.splice(targetIndex, 1);
        newStack.push(card);
        return newStack;
      });
    }
  }, [externalIndex]);

  const sendToBack = (id) => {
    setStack(prev => {
      const newStack = [...prev];
      const index = newStack.findIndex(card => card.id === id);
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card);
      return newStack;
    });
  };

  useEffect(() => {
    if (stack.length > 0) {
      onImageChange(stack[stack.length - 1].id);
    }
  }, [stack, onImageChange]);

  return (
    <div className="relative w-full h-full" style={{ perspective: '1200px' }}>
      {stack.map((card, index) => {
        const isTop = index === stack.length - 1;
        const stackPosition = stack.length - index - 1;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={180}
          >
            <motion.div
              className="absolute inset-0 bg-[#111] border border-gray-800 overflow-hidden"
              animate={{
                rotateZ: stackPosition * 3 + parseFloat(card.rotation),
                scale: 1 - stackPosition * 0.03,
                zIndex: stack.length - stackPosition,
                y: stackPosition * 3,
                x: stackPosition * 2,
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
            >
              <img
                src={card.src}
                alt={`${productName} ${card.id + 1}`}
                className="w-full h-full object-contain p-4 pointer-events-none select-none"
                draggable={false}
              />
              {isTop && (
                <>
                  <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-[#ff6b35] opacity-80" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-[#ff6b35] opacity-80" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-[#ff6b35] opacity-80" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-[#ff6b35] opacity-80" />
                </>
              )}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [thumbnailIndex, setThumbnailIndex] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const containerRef = useRef(null);

  const isAdmin = user?.email === 'voidstonestudio@gmail.com';

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.product))
      .catch(() => navigate('/products'));
    api.get('/products')
      .then(res => setAllProducts(res.data.products || []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !product) return;
    api.get('/wishlist').then(res => {
      const wishlist = res.data.wishlist;
      if (wishlist?.products?.some(p => p._id === product._id)) {
        setInWishlist(true);
      }
    }).catch(() => {});
  }, [isAuthenticated, product]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border border-[#ff6b35] border-t-transparent"
        />
      </div>
    );
  }

  const handleAdd = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    addToCart({ ...product, quantity: qty });
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${product._id}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product._id}`);
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600'];
  const splitCategory = (cat) => {
    if (!cat) return { main: '', sub: '' };
    const parts = cat.split(' ');
    return parts.length >= 2 ? { main: parts[0], sub: parts.slice(1).join(' ') } : { main: cat, sub: '' };
  };
  const { main, sub } = splitCategory(product.category);

  const relatedProducts = allProducts
    .filter(p => p._id !== product._id && p.category === product.category)
    .slice(0, 4);

  if (relatedProducts.length < 4) {
    const others = allProducts
      .filter(p => p._id !== product._id && p.category !== product.category)
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...others);
  }

  const handleThumbnailClick = (index) => {
    setThumbnailIndex(index);
    setCurrentImage(index);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ff6b35] selection:text-black">
      <style>{`
        body, * { cursor: none !important; }
        a, button, [role="button"] { cursor: none !important; }
      `}</style>
      
      <motion.div
        className="fixed w-2 h-2 bg-[#ff6b35] rounded-full pointer-events-none z-[200]"
        style={{ top: 0, left: 0 }}
        animate={{ x: cursorPos.x - 4, y: cursorPos.y - 4 }}
        transition={{ type: "tween", duration: 0.05 }}
      />
      <motion.div
        className="fixed w-7 h-7 border border-[#ff6b35] rounded-full pointer-events-none z-[200]"
        style={{ top: 0, left: 0 }}
        animate={{
          x: cursorPos.x - 14,
          y: cursorPos.y - 14,
          scale: isHovering ? 1.4 : 1,
        }}
        transition={{ type: "tween", duration: 0.08 }}
      />

      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 relative z-20">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 text-xs text-gray-500 mb-12 font-mono tracking-[0.15em]"
        >
          <Link to="/" className="hover:text-[#ff6b35] transition">HOME</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#ff6b35] transition">PRODUCTS</Link>
          {main && <><span>/</span><Link to={`/products?category=${main}`} className="hover:text-[#ff6b35] transition uppercase">{main}</Link></>}
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[160px]">{product.name}</span>
        </motion.nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-[55%]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="relative w-full h-[60vh] lg:h-[75vh]">
              <ImageStack 
                images={images} 
                productName={product.name}
                onImageChange={setCurrentImage}
                externalIndex={thumbnailIndex}
              />
              <div className="absolute bottom-4 right-4 bg-black/80 border border-gray-800 px-3 py-1.5 text-xs font-mono text-gray-400 z-30 pointer-events-none">
                {currentImage + 1} / {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-2 mt-6 overflow-x-auto pb-2"
              >
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleThumbnailClick(i)}
                    className={`flex-shrink-0 w-16 h-20 border overflow-hidden ${
                      i === currentImage ? 'border-[#ff6b35]' : 'border-gray-800 hover:border-gray-500'
                    } transition-colors`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {i === currentImage && (
                      <motion.div layoutId="thumbBar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b35]" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:w-[45%]"
          >
            <div className="lg:sticky lg:top-24">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-2 mb-8"
              >
                <span className="px-4 py-1.5 border border-[#ff6b35] text-[#ff6b35] font-mono text-xs tracking-[0.2em] uppercase">
                  {main}
                </span>
                {sub && (
                  <span className="px-4 py-1.5 border border-gray-800 text-gray-500 font-mono text-xs tracking-[0.2em] uppercase">
                    {sub}
                  </span>
                )}
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-5xl lg:text-7xl font-black mb-4 leading-[0.9] tracking-tighter uppercase"
              >
                {product.name}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-sm text-gray-500 font-mono mb-8"
              >
                DESIGN BY <span className="text-gray-300">{product.designer || 'VOIDSTONE STUDIO'}</span>
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mb-8"
              >
                <div className="text-4xl font-black text-[#ff6b35]">
                  {formatDT(product.price)}
                </div>
                <div className="text-xs text-gray-600 font-mono mt-2">
                  TAX INCLUDED • FREE SHIPPING OVER 200 DT
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="mb-8 pb-8 border-b border-gray-800"
              >
                <h3 className="text-xs font-mono text-gray-500 tracking-[0.2em] mb-3 uppercase">Description</h3>
                <p className="text-gray-400 leading-relaxed font-light">{product.description}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mb-8"
              >
                {product.stock_quantity > 0 ? (
                  <div className="flex items-center gap-3 text-green-500 font-mono text-sm">
                    <motion.span 
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500"
                    />
                    IN STOCK — {product.stock_quantity} UNITS
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-red-500 font-mono text-sm">
                    <span className="w-2 h-2 bg-red-500" />
                    OUT OF STOCK
                  </div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="mb-8"
              >
                <p className="text-xs font-mono text-gray-500 tracking-[0.2em] mb-3 uppercase">Quantity</p>
                <div className="flex items-center border border-gray-800 w-fit">
                  <motion.button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-4 hover:bg-gray-900 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMinus className="w-4 h-4" />
                  </motion.button>
                  <span className="px-8 py-4 font-mono text-lg border-x border-gray-800 min-w-[80px] text-center">
                    {qty}
                  </span>
                  <motion.button 
                    onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                    className="p-4 hover:bg-gray-900 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlus className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                className="space-y-3 mb-8"
              >
                <motion.button 
                  onClick={handleAdd} 
                  disabled={product.stock_quantity === 0}
                  className="w-full bg-[#ff6b35] text-black py-5 font-black text-lg uppercase tracking-[0.2em] border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <FiShoppingCart className="w-5 h-5" />
                    {product.stock_quantity > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                  </span>
                </motion.button>

                <div className="flex gap-3">
                  <motion.button 
                    onClick={toggleWishlist}
                    className={`flex-1 py-4 border font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
                      inWishlist 
                        ? 'border-[#ff6b35] text-[#ff6b35] bg-[#ff6b35]/5' 
                        : 'border-gray-800 text-gray-400 hover:border-[#ff6b35] hover:text-[#ff6b35]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-[#ff6b35]' : ''}`} />
                      {inWishlist ? 'WISHLISTED' : 'WISHLIST'}
                    </span>
                  </motion.button>
                  <motion.button 
                    className="flex-1 py-4 border border-gray-800 font-mono text-sm uppercase tracking-wider hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FiShare2 className="w-4 h-4" />
                      SHARE
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4 }}
                className="flex items-center gap-4 p-5 border border-gray-800 mb-8 bg-[#0f0f0f]"
              >
                <FiTruck className="w-5 h-5 text-[#ff6b35]" />
                <div>
                  <p className="text-sm font-mono uppercase tracking-wider">Free Shipping</p>
                  <p className="text-xs text-gray-500 font-mono">ON ORDERS OVER 200 DT</p>
                </div>
              </motion.div>

              {product.tags?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.6 }}
                  className="mb-6"
                >
                  <p className="text-xs font-mono text-gray-500 tracking-[0.2em] mb-3 uppercase">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <motion.span 
                        key={tag} 
                        className="px-3 py-1 border border-gray-800 text-gray-500 text-xs font-mono hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all duration-300 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              <p className="text-xs font-mono text-gray-600">SKU: #{product._id?.slice(-8).toUpperCase()}</p>

              {!isAuthenticated && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                  className="text-center text-sm text-gray-500 mt-6 font-mono"
                >
                  <Link to="/login" className="text-[#ff6b35] hover:underline">SIGN IN</Link> TO ADD ITEMS TO YOUR CART
                </motion.p>
              )}

              {isAdmin && (
                <Link to={`/admin/create-product?id=${product._id}`} 
                  className="block text-center text-sm text-[#ff6b35] hover:underline mt-4 font-mono uppercase tracking-wider">
                  ✏️ EDIT THIS PRODUCT
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-24 pt-12 border-t border-gray-800"
          >
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-8">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct, index) => (
                <Link 
                  to={`/products/${relProduct._id}`} 
                  key={relProduct._id}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + (index * 0.1) }}
                    className="group"
                  >
                    <div className="relative overflow-hidden border border-gray-800 mb-3 bg-[#111]"
                      style={{ aspectRatio: '3/4' }}
                    >
                      <motion.img
                        src={relProduct.images?.[0] || 'https://via.placeholder.com/300'}
                        alt={relProduct.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
                      />
                      <div className="absolute inset-0 bg-[#ff6b35] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    </div>
                    <p className="text-sm font-mono truncate text-gray-300">{relProduct.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatDT(relProduct.price)}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 transition-colors z-50 border border-gray-800"
              whileHover={{ scale: 1.1, rotate: 90 }}
            >
              <FiX className="w-6 h-6" />
            </motion.button>
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImage}
                src={images[currentImage]} 
                alt={product.name}
                className="max-w-[90vw] max-h-[90vh] object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()} 
              />
            </AnimatePresence>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-gray-500">
              {currentImage + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;