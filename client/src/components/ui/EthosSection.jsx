// src/components/ui/EthosSection.jsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EthosSection = () => {
  const sectionRef = useRef(null);
  
  // DESKTOP refs
  const desktopLogoRef = useRef(null);
  const desktopFirstTextRef = useRef(null);
  const desktopPhilosophyTitleRef = useRef(null);
  const desktopManifestoTitleRef = useRef(null);
  const desktopPhilosophyTextRef = useRef(null);
  const desktopManifestoTextRef = useRef(null);
  
  // MOBILE refs
  const mobileLogoRef = useRef(null);
  const mobileFirstTextRef = useRef(null);
  const mobilePhilosophyTitleRef = useRef(null);
  const mobileManifestoTitleRef = useRef(null);
  const mobilePhilosophyTextRef = useRef(null);
  const mobileManifestoTextRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- DESKTOP ANIMATIONS ---
      
      // Logo (slide from left, slower)
      gsap.fromTo(desktopLogoRef.current,
        { x: -500, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 4, 
          ease: 'power2.out',
          scrollTrigger: { 
            trigger: sectionRef.current, 
            start: 'top 80%', 
            end: 'top 30%',
            scrub: 2.5
          } 
        }
      );

      // First text - animate from top, then reverse when scrolling past
      gsap.fromTo(desktopFirstTextRef.current,
        { y: -100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 20%',    // animates in then out as you scroll through section
            scrub: 2
          }
        }
      );

      // Philosophy Title - slide from RIGHT (x: +80)
      gsap.fromTo(desktopPhilosophyTitleRef.current,
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',    // will reverse when scrolling past bottom
            scrub: 2
          }
        }
      );

      // Manifesto Title - slide from RIGHT
      gsap.fromTo(desktopManifestoTitleRef.current,
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 2
          }
        }
      );

      // Philosophy Text - slide from RIGHT
      gsap.fromTo(desktopPhilosophyTextRef.current,
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 2
          }
        }
      );

      // Manifesto Text - slide from RIGHT
      gsap.fromTo(desktopManifestoTextRef.current,
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 2
          }
        }
      );

      // --- MOBILE ANIMATIONS (same behaviour, adjusted values) ---
      
      gsap.fromTo(mobileLogoRef.current,
        { x: -300, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 2, 
          ease: 'power2.out',
          scrollTrigger: { 
            trigger: sectionRef.current, 
            start: 'top 70%', 
            end: 'top 30%',
            scrub: 1.5
          } 
        }
      );

      gsap.fromTo(mobileFirstTextRef.current,
        { y: -80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5
          }
        }
      );

      gsap.fromTo(mobilePhilosophyTitleRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 1.5
          }
        }
      );

      gsap.fromTo(mobileManifestoTitleRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 1.5
          }
        }
      );

      gsap.fromTo(mobilePhilosophyTextRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 1.5
          }
        }
      );

      gsap.fromTo(mobileManifestoTextRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 20%',
            scrub: 1.5
          }
        }
      );
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 z-10 overflow-hidden border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:block">
          <div ref={desktopFirstTextRef} className="mb-16">
            <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-gray-300">
              Born in 2024, Voidstone Studio exists to break the mold. We are a haven for those who embrace <span className="text-white font-bold">'more is more.'</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
            <div ref={desktopLogoRef}>
              <img 
                src="https://i.postimg.cc/DzFXRFQY/IMG-4800.gif" 
                alt="Voidstone" 
                className="w-full max-w-[450px] h-auto" 
              />
            </div>

            <div>
              <div className="mb-12 md:mb-16">
                <h3 ref={desktopPhilosophyTitleRef} className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em] mb-4 md:mb-6">Philosophy</h3>
                <p ref={desktopPhilosophyTextRef} className="text-gray-400 leading-relaxed text-sm md:text-base font-light">We reject the transient nature of fast fashion in favor of slow, deliberate creation. Our pieces are handcrafted for those who view fashion as wearable art—bold, layered, and unapologetically unique.</p>
              </div>
              <div>
                <h3 ref={desktopManifestoTitleRef} className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em] mb-4 md:mb-6">Manifesto</h3>
                <p ref={desktopManifestoTextRef} className="text-gray-400 leading-relaxed text-sm md:text-base font-light">To champion individuality in a world of conformity. Through sustainable practices and maximalist design, we create pieces that allow you to stand out and wear your story with pride.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="block md:hidden pb-20">
          <div ref={mobileFirstTextRef} className="mb-8">
            <p className="text-2xl font-light leading-relaxed text-gray-300">
              Born in 2024, Voidstone Studio exists to break the mold. We are a haven for those who embrace <span className="text-white font-bold">'more is more.'</span>
            </p>
          </div>

          <div ref={mobileLogoRef} className="flex justify-center my-10">
            <img 
              src="https://i.postimg.cc/DzFXRFQY/IMG-4800.gif" 
              alt="Voidstone" 
              className="w-[70vw] max-w-[350px] h-auto" 
            />
          </div>

          <div className="mb-12">
            <h3 ref={mobilePhilosophyTitleRef} className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em] mb-4">Philosophy</h3>
            <p ref={mobilePhilosophyTextRef} className="text-gray-400 leading-relaxed text-sm font-light">We reject the transient nature of fast fashion in favor of slow, deliberate creation. Our pieces are handcrafted for those who view fashion as wearable art—bold, layered, and unapologetically unique.</p>
          </div>

          <div>
            <h3 ref={mobileManifestoTitleRef} className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em] mb-4">Manifesto</h3>
            <p ref={mobileManifestoTextRef} className="text-gray-400 leading-relaxed text-sm font-light">To champion individuality in a world of conformity. Through sustainable practices and maximalist design, we create pieces that allow you to stand out and wear your story with pride.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EthosSection;