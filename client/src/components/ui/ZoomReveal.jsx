import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ZoomReveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current || !innerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { scale: 1.2,  },
        {
          scale: 1,
      
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div ref={innerRef} className="w-full origin-center">
        {children}
      </div>
    </div>
  );
};

export default ZoomReveal;