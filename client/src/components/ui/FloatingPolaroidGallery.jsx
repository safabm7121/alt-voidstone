import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { FiStar, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FloatingPolaroidGallery = ({ products = [] }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const extraImagesRef = useRef({});
  const floatingTweensRef = useRef([]);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedForHighlight, setSelectedForHighlight] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.email === 'voidstonestudio@gmail.com' || user?.role === 'admin';

  useEffect(() => {
    const saved = localStorage.getItem('highlightedProducts');
    if (saved) {
      try { setHighlightedIds(JSON.parse(saved)); } catch {}
    }
  }, []);

  const highlightedProducts = products.filter(p => highlightedIds.includes(p._id));
  const otherProducts = products.filter(p => !highlightedIds.includes(p._id));
  const displayProducts = [...highlightedProducts, ...otherProducts].slice(0, 5);

  // Clamp a value between min and max
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  useEffect(() => {
    if (!containerRef.current || displayProducts.length === 0) return;

    // Kill old floating tweens
    floatingTweensRef.current.forEach(t => t.kill());
    floatingTweensRef.current = [];

    const cards = cardsRef.current.filter(Boolean);
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    cards.forEach((card, i) => {
      // Get card dimensions
      const cardWidth = i === 2 ? 220 : 180;
      const cardHeight = cardWidth * 1.6; // approximate including padding

      // Calculate bounds based on position
      const positions = [
        { top: '10%', left: '5%' },
        { top: '5%', right: '8%' },
        { top: '50%', left: '50%' },
        { bottom: '10%', left: '10%' },
        { bottom: '5%', right: '5%' },
      ];
      const pos = positions[i];
      
      // Calculate starting positions in pixels
      let startX, startY;
      if (pos.left === '50%') {
        startX = containerWidth / 2 - cardWidth / 2;
        startY = containerHeight / 2 - cardHeight / 2;
      } else if (pos.left) {
        startX = containerWidth * (parseInt(pos.left) / 100);
        startY = pos.top ? containerHeight * (parseInt(pos.top) / 100) : containerHeight * 0.1;
      } else if (pos.right) {
        startX = containerWidth * (1 - parseInt(pos.right) / 100) - cardWidth;
        startY = pos.top ? containerHeight * (parseInt(pos.top) / 100) : containerHeight * 0.1;
      } else {
        startX = containerWidth * 0.1;
        startY = containerHeight * 0.9 - cardHeight;
      }

      // Calculate max movement bounds (keep card fully visible with 20px padding)
      const maxMoveX = Math.min(startX - 20, containerWidth - startX - cardWidth - 20);
      const maxMoveY = Math.min(startY - 20, containerHeight - startY - cardHeight - 20);
      const safeMoveX = Math.max(0, maxMoveX);
      const safeMoveY = Math.max(0, maxMoveY);

      // Set initial position
      gsap.set(card, { x: 0, y: 0, rotation: (Math.random() - 0.5) * 12, opacity: 0 });
      gsap.to(card, { opacity: 1, duration: 0.8, delay: i * 0.15, ease: 'power3.out' });

      // Gentle floating - clamped
      const floatX = clamp((Math.random() - 0.5) * 30, -safeMoveX, safeMoveX);
      const floatY = clamp((Math.random() - 0.5) * 30, -safeMoveY, safeMoveY);
      
      const tween = gsap.to(card, {
        x: floatX,
        y: floatY,
        rotation: (Math.random() - 0.5) * 8,
        duration: 4 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
      });
      floatingTweensRef.current.push(tween);
    });

    // Mouse parallax - tightly clamped
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      cards.forEach((card, i) => {
        const cardWidth = i === 2 ? 220 : 180;
        const cardHeight = cardWidth * 1.6;
        
        // Get card's current position
        const cardRect = card.getBoundingClientRect();
        const cardX = cardRect.left - rect.left;
        const cardY = cardRect.top - rect.top;
        
        // Calculate safe movement range
        const maxRight = rect.width - cardX - cardWidth - 10;
        const maxLeft = cardX - 10;
        const maxDown = rect.height - cardY - cardHeight - 10;
        const maxUp = cardY - 10;
        
        const depth = 0.012;
        let moveX = (mouseX - centerX) * depth;
        let moveY = (mouseY - centerY) * depth;
        
        // Clamp to keep card fully visible
        moveX = clamp(moveX, -maxLeft, maxRight);
        moveY = clamp(moveY, -maxUp, maxDown);
        
        gsap.to(card, {
          x: moveX,
          y: moveY,
          duration: 1.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      floatingTweensRef.current.forEach(t => t.kill());
    };
  }, [displayProducts]);

  const handleMouseEnter = (product, index) => {
    if (!product.images || product.images.length <= 1) return;
    
    const extraImages = product.images.slice(1, 4);
    const card = cardsRef.current[index];
    if (!card) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2 - containerRect.left;
    const cardCenterY = cardRect.top + cardRect.height / 2 - containerRect.top;

    extraImagesRef.current[product._id] = [];

    extraImages.forEach((img, i) => {
      const angle = (i / extraImages.length) * Math.PI * 2;
      const radius = 120;
      const x = cardCenterX + Math.cos(angle) * radius - 50;
      const y = cardCenterY + Math.sin(angle) * radius - 60;

      const el = document.createElement('div');
      el.className = 'absolute w-[100px] h-[130px] bg-white p-2 pb-8 shadow-lg z-20 pointer-events-none';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;
      el.innerHTML = `<img src="${img}" class="w-full h-full object-cover" />`;
      
      containerRef.current.appendChild(el);
      extraImagesRef.current[product._id].push(el);

      gsap.fromTo(el, 
        { opacity: 0, scale: 0, rotation: (Math.random() - 0.5) * 40 },
        { opacity: 1, scale: 1, rotation: (Math.random() - 0.5) * 15, duration: 0.4, delay: i * 0.1, ease: 'back.out(1.7)' }
      );
    });
  };

  const handleMouseLeave = (product) => {
    if (extraImagesRef.current[product._id]) {
      extraImagesRef.current[product._id].forEach(el => {
        gsap.to(el, { opacity: 0, scale: 0, duration: 0.3, onComplete: () => el.remove() });
      });
      extraImagesRef.current[product._id] = [];
    }
  };

  const toggleHighlight = (productId) => {
    setSelectedForHighlight(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const saveHighlights = () => {
    const newHighlights = [...new Set([...highlightedIds, ...selectedForHighlight])];
    setHighlightedIds(newHighlights);
    localStorage.setItem('highlightedProducts', JSON.stringify(newHighlights));
    setSelectedForHighlight([]);
    setShowAdminPanel(false);
    toast.success('Highlights saved!');
  };

  const removeHighlight = (productId) => {
    const newHighlights = highlightedIds.filter(id => id !== productId);
    setHighlightedIds(newHighlights);
    localStorage.setItem('highlightedProducts', JSON.stringify(newHighlights));
  };

  const positions = [
    { top: '10%', left: '5%' },
    { top: '5%', right: '8%' },
    { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    { bottom: '10%', left: '10%' },
    { bottom: '5%', right: '5%' },
  ];

  return (
    <div className="relative">
      {isAdmin && (
        <div className="absolute top-0 right-0 z-30 flex gap-2">
          <button onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition flex items-center gap-1">
            <FiStar className="w-3 h-3" /> Highlight Products
          </button>
        </div>
      )}

      {showAdminPanel && isAdmin && (
        <div className="absolute top-12 right-0 z-30 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 w-80 border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Select to Highlight</h3>
            <button onClick={() => setShowAdminPanel(false)}><FiX className="w-4 h-4" /></button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Highlighted products appear first in the gallery</p>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
            {products.map(product => (
              <label key={product._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input type="checkbox"
                  checked={selectedForHighlight.includes(product._id) || highlightedIds.includes(product._id)}
                  onChange={() => toggleHighlight(product._id)}
                  disabled={highlightedIds.includes(product._id)} className="rounded" />
                <img src={product.images?.[0]} alt="" className="w-8 h-8 object-cover rounded" />
                <span className="text-xs truncate flex-1">{product.name}</span>
                {highlightedIds.includes(product._id) && (
                  <button onClick={() => removeHighlight(product._id)} className="text-red-500 hover:text-red-700"><FiX className="w-3 h-3" /></button>
                )}
              </label>
            ))}
          </div>
          <button onClick={saveHighlights} className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition">Save Highlights</button>
        </div>
      )}

      <div ref={containerRef} className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        {displayProducts.map((product, i) => (
          <Link to={`/products/${product._id}`} key={product._id}
            ref={el => cardsRef.current[i] = el}
            className="absolute group cursor-pointer"
            style={{ ...positions[i], width: i === 2 ? '220px' : '180px', zIndex: i === 2 ? 10 : highlightedIds.includes(product._id) ? 5 : 1 }}
            onMouseEnter={() => handleMouseEnter(product, i)}
            onMouseLeave={() => handleMouseLeave(product)}>
            <div className="bg-white p-3 pb-10 shadow-xl rotate-[-2deg] group-hover:rotate-0 group-hover:scale-110 group-hover:z-20 transition-all duration-500 relative">
              {highlightedIds.includes(product._id) && (
                <div className="absolute -top-1 -right-1 z-10 bg-purple-600 text-white rounded-full p-0.5 shadow"><FiStar className="w-3 h-3" /></div>
              )}
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                <img src={product.images?.[0] || 'https://via.placeholder.com/400x500'} alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <p className="text-xs font-medium text-gray-700 truncate px-2">{product.name}</p>
                <p className="text-[10px] text-gray-400">{product.price?.toFixed(3)} DT</p>
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-100/80 rotate-[-3deg] rounded-sm" />
            </div>
          </Link>
        ))}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <p className="text-8xl font-bold text-gray-100 dark:text-gray-800 select-none opacity-20">VOIDSTONE</p>
        </div>
      </div>
    </div>
  );
};

export default FloatingPolaroidGallery;