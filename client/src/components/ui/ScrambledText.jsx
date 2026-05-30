import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!el.textContent.trim()) return;

    const split = SplitText.create(el, {
      type: 'chars',
      charsClass: 'scramble-char'
    });

    split.chars.forEach(c => {
      const rect = c.getBoundingClientRect();
      gsap.set(c, {
        display: 'inline-block',
        width: rect.width,
        minWidth: rect.width,
        maxWidth: rect.width,
        textAlign: 'center',
        overflow: 'hidden',
        attr: { 'data-content': c.textContent }
      });
    });

    const handleMove = (e) => {
      split.chars.forEach(c => {
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const t = 1 - dist / radius;
          gsap.to(c, {
            overwrite: true,
            duration: duration * t,
            scrambleText: {
              text: c.dataset.content || c.textContent || '',
              chars: scrambleChars,
              speed: speed * 0.2
            },
            ease: 'power2.out'
          });
        }
      });
    };

    el.addEventListener('pointermove', handleMove);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      split.revert();
    };
  }, []);

  return (
    <span ref={rootRef} className={className} style={style}>
      {children}
    </span>
  );
};

export default ScrambledText;