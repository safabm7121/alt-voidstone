import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParallaxSection = ({ children, className = '', speed = 0.5, direction = 'vertical' }) => {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (direction === 'vertical') {
        gsap.to(innerRef.current, {
          y: () => window.innerHeight * speed * (speed > 0 ? -1 : 1),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      } else {
        gsap.to(innerRef.current, {
          x: () => window.innerWidth * 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <section ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div ref={innerRef}>{children}</div>
    </section>
  );
};

export default ParallaxSection;