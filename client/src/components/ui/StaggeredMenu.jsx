import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

const StaggeredMenu = ({ isOpen, onClose, items, accentColor = '#5227FF' }) => {
  const panelRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const panel = panelRef.current;
    const layer1 = layer1Ref.current;
    const layer2 = layer2Ref.current;
    const itemEls = itemsRef.current.filter(Boolean);
    
    if (!panel || !layer1 || !layer2) return;

    if (isOpen) {
      gsap.set([layer1, layer2, panel], { xPercent: 100 });
      gsap.set(itemEls, { y: 80, opacity: 0, rotate: 5 });

      const tl = gsap.timeline();
      tl.to(layer1, { xPercent: 0, duration: 0.45, ease: 'power4.out' }, 0);
      tl.to(layer2, { xPercent: 0, duration: 0.45, ease: 'power4.out' }, 0.06);
      tl.to(panel, { xPercent: 0, duration: 0.55, ease: 'power4.out' }, 0.1);
      tl.to(itemEls, { y: 0, opacity: 1, rotate: 0, duration: 0.7, ease: 'power4.out', stagger: 0.08 }, 0.25);
    } else {
      gsap.to(itemEls, { y: 30, opacity: 0, duration: 0.15, ease: 'power3.in' }, 0);
      gsap.to([panel, layer1, layer2], { xPercent: 100, duration: 0.35, ease: 'power3.in' }, 0.05);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sm-overlay">
      <div ref={layer1Ref} className="sm-layer" style={{ background: '#1a1a1a', zIndex: 1 }} />
      <div ref={layer2Ref} className="sm-layer" style={{ background: '#2a2a2a', zIndex: 2 }} />
      
      <div ref={panelRef} className="sm-panel">
        <button onClick={onClose} className="sm-close">×</button>
        
        <div className="sm-items">
          {items.map((item, i) => (
            <div key={i} className="sm-item-wrap">
              <a
                ref={el => itemsRef.current[i] = el}
                className="sm-item"
                href={item.link || '#'}
                onClick={(e) => { e.preventDefault(); if (item.onClick) item.onClick(); }}
                style={{ '--accent': accentColor }}
              >
                {item.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaggeredMenu;