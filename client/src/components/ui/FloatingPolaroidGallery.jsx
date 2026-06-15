import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === 'voidstonestudio@gmail.com' || user?.role === 'admin';

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data.settings?.highlightedProducts) {
        setHighlightedIds(res.data.settings.highlightedProducts);
      }
    }).catch(() => {});
  }, []);

  const highlightedProducts = products.filter(p => highlightedIds.includes(p._id));
  const otherProducts = products.filter(p => !highlightedIds.includes(p._id));
  const displayProducts = highlightedIds.length >= 3 
    ? highlightedProducts
    : [...highlightedProducts, ...otherProducts].slice(0, 5);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const handleProductClick = (productId) => {
    floatingTweensRef.current.forEach(t => {
      if (t && typeof t.kill === 'function') t.kill();
    });
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger && typeof trigger.kill === 'function') trigger.kill();
    });
    navigate(`/products/${productId}`);
    window.scrollTo(0, 0);
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 768;

  const getCardSize = (index, total) => {
    if (isMobile) {
      return total === 3 ? 140 : 125;
    }
    if (isTablet) {
      return 160;
    }
    return 180;
  };

  const getPositions = (total, containerWidth, containerHeight, cardWidth, cardHeight) => {
    const centerX = containerWidth / 2 - cardWidth / 2;
    const centerY = containerHeight / 2 - cardHeight / 2;
    
    if (isMobile && total === 3) {
      // Mobile 3 - EVEN WIDER
      return [
        { left: centerX - 100, top: centerY - 60 },  // top left
        { left: centerX + 70, top: centerY - 60 },   // top right
        { left: centerX - 15, top: centerY + 70 },   // bottom center
      ];
    }

    if (isMobile && total === 4) {
      // Mobile 4 - EVEN WIDER
      return [
        { left: centerX - 140, top: centerY - 70 },  // top left
        { left: centerX - 50, top: centerY + 40 },   // bottom middle-left
        { left: centerX + 60, top: centerY - 70 },   // top right
        { left: centerX + 150, top: centerY + 40 },  // bottom right
      ];
    }

    if (isMobile && total === 5) {
      // Mobile 5 - EVEN WIDER
      return [
        { left: centerX - 150, top: centerY - 80 },  // top left
        { left: centerX - 70, top: centerY + 20 },   // middle left
        { left: centerX + 50, top: centerY - 80 },   // top right
        { left: centerX + 130, top: centerY + 20 },  // middle right
        { left: centerX - 60, top: centerY + 100 },  // bottom center
      ];
    }

    if (total === 3) {
      // Desktop 3 - EVEN WIDER, NO OVERLAP
      return [
        { left: centerX - 250, top: centerY - 100 },  // top left
        { left: centerX + 170, top: centerY - 100 },  // top right
        { left: centerX - 40, top: centerY + 110 },   // bottom center
      ];
    }

    if (total === 4) {
      // Desktop 4 - EVEN WIDER, NO OVERLAP
      return [
        { left: centerX - 280, top: centerY - 110 },  // #1 top
        { left: centerX - 90, top: centerY + 70 },    // #2 bottom
        { left: centerX + 100, top: centerY - 110 },  // #3 top
        { left: centerX + 290, top: centerY + 70 },   // #4 bottom
      ];
    }

    // Desktop 5 - EVEN WIDER, NO OVERLAP
    return [
      { left: centerX - 290, top: centerY - 120, rotation: -5 },   // top left
      { left: centerX - 130, top: centerY - 50, rotation: 3 },     // middle left
      { left: centerX + 40, top: centerY - 120, rotation: -2 },    // top right
      { left: centerX + 200, top: centerY - 50, rotation: 4 },     // middle right
      { left: centerX - 90, top: centerY + 90, rotation: -3 },     // bottom center
    ];
  };

  useEffect(() => {
    if (!containerRef.current || displayProducts.length === 0) return;

    floatingTweensRef.current.forEach(t => t && t.kill());
    floatingTweensRef.current = [];

    const cards = cardsRef.current.filter(Boolean);
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const total = displayProducts.length;

    cards.forEach((card, i) => {
      const cardWidth = getCardSize(i, total);
      const cardHeight = cardWidth * 1.6;
      const positions = getPositions(total, containerWidth, containerHeight, cardWidth, cardHeight);
      
      let startX = positions[i].left;
      let startY = positions[i].top;
      let rotation = positions[i].rotation !== undefined ? positions[i].rotation : (Math.random() - 0.5) * 10;

      // Clamp to container bounds
      startX = clamp(startX, 15, containerWidth - cardWidth - 15);
      startY = clamp(startY, 15, containerHeight - cardHeight - 15);

      const maxMoveX = Math.min(startX - 20, containerWidth - startX - cardWidth - 20);
      const maxMoveY = Math.min(startY - 20, containerHeight - startY - cardHeight - 20);
      const safeMoveX = Math.max(8, maxMoveX);
      const safeMoveY = Math.max(8, maxMoveY);

      gsap.set(card, { 
        x: 0, 
        y: 0, 
        rotation: rotation, 
        opacity: 0, 
        left: startX, 
        top: startY 
      });
      
      gsap.to(card, { opacity: 1, duration: 0.8, delay: i * 0.15, ease: 'power3.out' });

      const floatX = clamp((Math.random() - 0.5) * 30, -safeMoveX, safeMoveX);
      const floatY = clamp((Math.random() - 0.5) * 30, -safeMoveY, safeMoveY);
      
      const tween = gsap.to(card, {
        x: floatX,
        y: floatY,
        rotation: `+=${(Math.random() - 0.5) * 8}`,
        duration: 4 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
      });
      floatingTweensRef.current.push(tween);
    });

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      cards.forEach((card, i) => {
        const cardWidth = getCardSize(i, displayProducts.length);
        const cardHeight = cardWidth * 1.6;
        
        const cardRect = card.getBoundingClientRect();
        const cardX = cardRect.left - rect.left;
        const cardY = cardRect.top - rect.top;
        
        const maxRight = rect.width - cardX - cardWidth - 10;
        const maxLeft = cardX - 10;
        const maxDown = rect.height - cardY - cardHeight - 10;
        const maxUp = cardY - 10;
        
        const depth = 0.012;
        let moveX = (mouseX - centerX) * depth;
        let moveY = (mouseY - centerY) * depth;
        
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
      floatingTweensRef.current.forEach(t => t && t.kill());
    };
  }, [displayProducts, windowWidth]);

 const handleMouseEnter = (product, index) => {
  if (!product.images || product.images.length <= 1) return;
  
  const extraImages = product.images.slice(1, 4);
  const card = cardsRef.current[index];
  if (!card) return;

  const containerRect = containerRef.current.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2 - containerRect.left;
  const cardCenterY = cardRect.top + cardRect.height / 2 - containerRect.top;

  if (extraImagesRef.current[product._id]) {
    extraImagesRef.current[product._id].forEach(el => el.remove());
    extraImagesRef.current[product._id] = [];
  }

  extraImagesRef.current[product._id] = [];

  // CHANGE THESE BACK TO ORIGINAL VALUES:
  const radius = 120;
  const imgSize = 100;

  extraImages.forEach((img, i) => {
    const angle = (i / extraImages.length) * Math.PI * 2;
    const x = cardCenterX + Math.cos(angle) * radius - imgSize/2;
    const y = cardCenterY + Math.sin(angle) * radius - (imgSize * 1.3)/2;

    const el = document.createElement('div');
    el.className = 'absolute w-[100px] h-[130px] bg-white p-2 pb-8 shadow-lg z-20 pointer-events-none';
    el.style.left = `${Math.max(5, Math.min(x, containerRect.width - imgSize - 5))}px`;
    el.style.top = `${Math.max(5, Math.min(y, containerRect.height - (imgSize * 1.3) - 5))}px`;
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

  const saveHighlights = async () => {
    const newHighlights = [...new Set([...highlightedIds, ...selectedForHighlight])];
    
    if (newHighlights.length < 3) {
      toast.error('Select at least 3 products to highlight');
      return;
    }
    
    try {
      const res = await api.put('/settings', { highlightedProducts: newHighlights });
      setHighlightedIds(newHighlights);
      setSelectedForHighlight([]);
      setShowAdminPanel(false);
      toast.success(`${newHighlights.length} products highlighted!`);
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.error || err.message));
    }
  };

  const removeHighlight = async (productId) => {
    const newHighlights = highlightedIds.filter(id => id !== productId);
    setHighlightedIds(newHighlights);
    try {
      await api.put('/settings', { highlightedProducts: newHighlights });
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const currentSelectionCount = [...new Set([...highlightedIds, ...selectedForHighlight])].length;

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
          <p className="text-xs text-gray-500 mb-3">
            Choose 3-5 products to feature. Highlighted products appear first in the gallery.
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
            {products.map(product => (
              <label key={product._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedForHighlight.includes(product._id) || highlightedIds.includes(product._id)}
                  onChange={() => {
                    const isCurrentlySelected = selectedForHighlight.includes(product._id) || highlightedIds.includes(product._id);
                    
                    if (isCurrentlySelected) {
                      if (selectedForHighlight.includes(product._id)) {
                        toggleHighlight(product._id);
                      } else if (highlightedIds.includes(product._id)) {
                        removeHighlight(product._id);
                      }
                    } else {
                      if (currentSelectionCount >= 5) {
                        toast.error('Maximum 5 products can be highlighted');
                        return;
                      }
                      toggleHighlight(product._id);
                    }
                  }}
                  className="rounded"
                />
                <img src={product.images?.[0]} alt="" className="w-8 h-8 object-cover rounded" />
                <span className="text-xs truncate flex-1">{product.name}</span>
                {highlightedIds.includes(product._id) && (
                  <span className="text-[10px] text-purple-600 font-bold">✓</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">{currentSelectionCount} selected</span>
            {currentSelectionCount < 3 && (
              <span className="text-[10px] text-red-500">Min 3 required</span>
            )}
          </div>
          <button 
            onClick={saveHighlights} 
            disabled={currentSelectionCount < 3}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50">
            Save Highlights {currentSelectionCount < 3 ? '(min 3)' : `(${currentSelectionCount})`}
          </button>
        </div>
      )}

      <div ref={containerRef} className="relative w-full h-[500px] sm:h-[600px] flex items-center justify-center overflow-hidden">
        {displayProducts.map((product, i) => (
          <div
            key={product._id}
            ref={el => cardsRef.current[i] = el}
            onClick={() => handleProductClick(product._id)}
            className="absolute group cursor-pointer"
            style={{ 
              width: getCardSize(i, displayProducts.length) + 'px', 
              zIndex: i === 2 ? 10 : highlightedIds.includes(product._id) ? 5 : 1 
            }}
            onMouseEnter={() => handleMouseEnter(product, i)}
            onMouseLeave={() => handleMouseLeave(product)}
          >
            <div className="bg-white p-2 sm:p-3 pb-6 sm:pb-10 shadow-xl rotate-[-2deg] group-hover:rotate-0 group-hover:scale-110 group-hover:z-20 transition-all duration-500 relative">
              {highlightedIds.includes(product._id) && (
                <div className="absolute -top-1 -right-1 z-10 bg-purple-600 text-white rounded-full p-0.5 shadow"><FiStar className="w-3 h-3" /></div>
              )}
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                <img 
                  src={product.images?.[0] || 'https://via.placeholder.com/400x500'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 text-center">
                <p className="text-[10px] sm:text-xs font-medium text-gray-700 truncate px-2">{product.name}</p>
                <p className="text-[8px] sm:text-[10px] text-gray-400">{product.price?.toFixed(3)} DT</p>
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 sm:w-10 h-2 sm:h-3 bg-yellow-100/80 rotate-[-3deg] rounded-sm" />
            </div>
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
       
        </div>
      </div>
    </div>
  );
};

export default FloatingPolaroidGallery;