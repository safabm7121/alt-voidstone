import { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDT } from '../../utils/format';

const StickyShowcase = ({ products = [] }) => {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(Math.floor(latest * Math.min(products.length, 4)), Math.min(products.length, 4) - 1);
    setActiveIndex(index);
  });

  const displayProducts = products.slice(0, 4);
  if (displayProducts.length === 0) return null;

  const product = displayProducts[activeIndex];
  if (!product) return null;

  return (
    <section ref={sectionRef} className="relative z-10 border-t border-gray-800 bg-[#0a0a0a]" style={{ height: `${displayProducts.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex">
        {/* Left - Sticky image */}
        <div className="w-[55%] h-full relative overflow-hidden">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img 
              src={product.images?.[0] || ''} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Right - Product info */}
        <div className="w-[45%] h-full flex flex-col justify-center px-12 lg:px-16 border-l border-gray-800">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em]">
              {product.category}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white mt-4 mb-3 leading-[0.9]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {product.name}
            </h2>
            <p className="text-sm text-gray-500 font-mono mb-6">
              By {product.designer || 'Voidstone Studio'}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 font-light">
              {product.description}
            </p>
            <p className="text-3xl font-black text-white mb-8">{formatDT(product.price)}</p>
            <Link 
              to={`/products/${product._id}`}
              className="inline-block border border-white/30 text-white px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500"
            >
              View Piece →
            </Link>
          </motion.div>

          {/* Progress */}
          <div className="absolute bottom-8 right-12 flex items-center gap-4">
            <div className="flex gap-2">
              {displayProducts.map((_, i) => (
                <div key={i} className={`w-6 h-0.5 transition-all duration-300 ${i === activeIndex ? 'bg-white' : 'bg-gray-700'}`} />
              ))}
            </div>
            <span className="text-xs font-mono text-gray-500">0{activeIndex + 1} / 0{displayProducts.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyShowcase;