import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import './Masonry.css';

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState(get);
  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);
  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();

  const grid = useMemo(() => {
    if (!width || !items.length) return [];

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height || Math.floor(Math.random() * 200) + 200;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!grid.length) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item._id}"]`;
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const initialY = animateFrom === 'top' ? -200 : animateFrom === 'bottom' ? window.innerHeight + 200 : item.y + 100;
        gsap.fromTo(selector, 
          { opacity: 0, x: item.x, y: initialY, width: item.w, height: item.h, filter: blurToFocus ? 'blur(10px)' : 'none' },
          { opacity: 1, ...animationProps, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', delay: index * stagger }
        );
      } else {
        gsap.to(selector, { ...animationProps, duration, ease, overwrite: 'auto' });
      }
    });

    hasMounted.current = true;
  }, [grid, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (e) => {
    if (scaleOnHover) {
      gsap.to(e.currentTarget, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = (e) => {
    if (scaleOnHover) {
      gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  };

  return (
    <div ref={containerRef} className="masonry-container" style={{ position: 'relative', minHeight: grid.length > 0 ? Math.max(...grid.map(i => i.y + i.h)) + 100 : 400 }}>
      {grid.map(item => (
        <Link
          to={`/products/${item._id}`}
          key={item._id}
          data-key={item._id}
          className="masonry-item"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'absolute', padding: '6px', top: 0, left: 0, willChange: 'transform, width, height, opacity' }}
        >
          <div
            className="masonry-item-img"
            style={{
              backgroundImage: `url(${item.images?.[0] || 'https://via.placeholder.com/400'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100%',
              height: '100%',
              borderRadius: '10px',
              boxShadow: '0 10px 50px -10px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="masonry-overlay">
              <h3 className="masonry-title">{item.name}</h3>
              <p className="masonry-price">{item.price?.toFixed(3)} DT</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Masonry;