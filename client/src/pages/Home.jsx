import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Carousel3D from '../components/ui/Carousel3D';
import ElasticSlider from '../components/ui/ElasticSlider';
import FloatingPolaroidGallery from '../components/ui/FloatingPolaroidGallery';
import ScrambledText from '../components/ui/ScrambledText';
import FlowingRibbons from '../components/ui/FlowingRibbons';
import EthosSection from '../components/ui/EthosSection';
import CategoryBanners from '../components/ui/CategoryBanners';
import ZoomReveal from '../components/ui/ZoomReveal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VolumeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

const VolumeUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

function separateWordsAndLetters(text) {
  if (!text) return '';
  let words = text.split(/\s+/);
  let result = "";
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    result += "<span class='word'>";
    for (let j = 0; j < word.length; j++) {
      result += "<span class='letter'>" + word[j] + "</span>";
    }
    result += "</span> ";
  }
  return result;
}

const isMobile = () => window.matchMedia('(pointer: coarse)').matches;

const Home = () => {
  const { user } = useAuth();
  const [hero, setHero] = useState(null);
  const [products, setProducts] = useState([]);
  const [volume, setVolume] = useState(() => parseInt(sessionStorage.getItem('heroVolume')) || 0);
  const [muted, setMuted] = useState(() => sessionStorage.getItem('heroMuted') !== 'false');
  const [hasInteracted, setHasInteracted] = useState(() => sessionStorage.getItem('heroInteracted') === 'true');
  const [introDone, setIntroDone] = useState(false);
  const [scrambleReady, setScrambleReady] = useState(false);
  const videoRef = useRef(null);
  const introRef = useRef(null);
  const introRedRef = useRef(null);
  const voidstoneAnimRef = useRef(null);
  const voidstoneScrambleRef = useRef(null);
  const cursorRef = useRef(null);
  const heroSectionRef = useRef(null);
  const introTimelineRef = useRef(null);
  const textTimelineRef = useRef(null);
  const isAdmin = user?.email === 'voidstonestudio@gmail.com' || user?.role === 'admin';

  useEffect(() => {
    fetchHero();
    api.get('/products').then(res => setProducts(res.data.products)).catch(() => {});
  }, []);

  useEffect(() => {
    sessionStorage.setItem('heroVolume', volume.toString());
    sessionStorage.setItem('heroMuted', muted.toString());
  }, [volume, muted]);

  const fetchHero = async () => {
    try {
      const res = await api.get('/hero/active');
      setHero(res.data.hero);
    } catch (err) { console.error('Error fetching hero:', err); }
  };

  // Intro animation with proper cleanup
  useEffect(() => {
    if (!introRef.current || !introRedRef.current) return;
    const introTL = gsap.timeline({ onComplete: () => setIntroDone(true) });
    introTimelineRef.current = introTL;
    const fonts = ["Anton", "Jost", "Alkatra", "Nova Oval", "Oswald", "PT Serif", "Lexend", "Poppins", "Titillium Web"];
    fonts.forEach(font => introTL.to(introRef.current, 0.1, { fontFamily: font }));
    introTL.to(introRef.current, 1, { scaleY: 0, ease: "expo.inOut" });
    introTL.to(introRedRef.current, 1, { scaleY: 2, ease: "expo.inOut" }, "-=1.25");
    
    return () => {
      if (introTimelineRef.current) introTimelineRef.current.kill();
    };
  }, []);

  // Text reveal animation with null safety
  useEffect(() => {
    if (!introDone) return;
    if (!voidstoneAnimRef.current) return;

    const text = 'VOIDSTONE';
    voidstoneAnimRef.current.innerHTML = '';
    const solidH1 = document.createElement('h1');
    solidH1.className = 'inline-block text-[12vw] md:text-[15vw] font-black uppercase tracking-[-0.5vw] leading-[0.8] overflow-hidden';
    solidH1.style.fontFamily = "'Bebas Neue', sans-serif";
    solidH1.innerHTML = separateWordsAndLetters(text);
    voidstoneAnimRef.current.appendChild(solidH1);

    const strokeDiv = document.createElement('div');
    strokeDiv.className = 'absolute top-0 left-0 text-[12vw] md:text-[15vw] font-black uppercase tracking-[-0.5vw] leading-[0.8] text-transparent overflow-hidden pointer-events-none';
    strokeDiv.style.fontFamily = "'Bebas Neue', sans-serif";
    strokeDiv.style.WebkitTextStroke = '1px rgba(255,255,255,0.5)';
    strokeDiv.innerHTML = separateWordsAndLetters(text);
    voidstoneAnimRef.current.appendChild(strokeDiv);

    const letters = solidH1.querySelectorAll('.letter');
    const strokeLetters = strokeDiv.querySelectorAll('.letter');
    if (!letters.length || !strokeLetters.length) return;
    
    gsap.set([letters, strokeLetters], { y: "120%", scale: -0.5 });

    const mobile = isMobile();
    const tl = gsap.timeline({ 
      delay: 0.3,
      onComplete: () => {
        if (!mobile && voidstoneAnimRef.current && voidstoneScrambleRef.current) {
          voidstoneAnimRef.current.style.display = 'none';
          voidstoneScrambleRef.current.style.display = 'inline-block';
          voidstoneScrambleRef.current.style.visibility = 'visible';
          setScrambleReady(true);
        }
      }
    });
    textTimelineRef.current = tl;
    tl.to(letters, { duration: 1.5, y: "10%", scale: 1, ease: "expo.inOut", stagger: 0.025 });
    tl.to(strokeLetters, { duration: 1.5, y: "10%", scale: 1, ease: "expo.inOut", stagger: 0.025 }, "-=1.5");
    
    return () => {
      if (textTimelineRef.current) textTimelineRef.current.kill();
    };
  }, [introDone]);

  useEffect(() => {
    if (!introDone || isMobile()) return;
    const heroEl = heroSectionRef.current;
    const cursor = cursorRef.current;
    if (!heroEl || !cursor) return;
    const move = (e) => gsap.to(cursor, { duration: 0.5, x: e.clientX, y: e.clientY, ease: "power2.out" });
    const enter = () => gsap.to(cursor, { duration: 0.5, scale: 1, ease: "expo.inOut" });
    const leave = () => gsap.to(cursor, { duration: 0.5, scale: 0, ease: "expo.inOut" });
    heroEl.addEventListener("mousemove", move);
    heroEl.addEventListener("mouseenter", enter);
    heroEl.addEventListener("mouseleave", leave);
    return () => { heroEl.removeEventListener("mousemove", move); heroEl.removeEventListener("mouseenter", enter); heroEl.removeEventListener("mouseleave", leave); };
  }, [introDone]);

  useEffect(() => {
    if (hero?.mediaCategory === 'video' && videoRef.current) {
      const video = videoRef.current;
      if (!hasInteracted) { video.muted = true; video.volume = 0; }
      else { video.muted = muted; video.volume = volume / 100; }
      video.play().catch(() => { document.addEventListener('click', () => video.play(), { once: true }); });
    }
  }, [hero]);

  const handleVolumeChange = (val) => {
    setVolume(val); setHasInteracted(true);
    sessionStorage.setItem('heroInteracted', 'true');
    if (videoRef.current) { videoRef.current.volume = val / 100; videoRef.current.muted = val === 0; setMuted(val === 0); }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !muted; videoRef.current.muted = newMuted; setMuted(newMuted);
      setHasInteracted(true); sessionStorage.setItem('heroInteracted', 'true');
      if (newMuted) { setVolume(0); } else { setVolume(50); videoRef.current.volume = 0.5; }
    }
  };
// Cleanup ScrollTriggers when leaving Home page
useEffect(() => {
  return () => {
    // Kill all ScrollTriggers when navigating away from Home
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger && typeof trigger.kill === 'function') {
        trigger.kill();
      }
    });
  };
}, []);
  return (
    <>
      {/* No blur ribbons – just a subtle background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FlowingRibbons backgroundColor="#0a0a0a" lineColor="#ff6b35" animationSpeed={0.2} />
      </div>

      {/* Subtle noise texture – opacity only, no blur */}
      <div className="fixed inset-0 z-[1001] pointer-events-none opacity-[0.035]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />

      {!introDone && (
        <div ref={introRef} className="fixed inset-0 z-[1000] bg-[#0a0a0a] flex items-center justify-center text-2xl md:text-4xl font-bold text-white origin-top">
          LOADING
          <div ref={introRedRef} className="absolute bottom-0 left-0 w-full h-[30%] bg-[#ff6b35] text-[20vw] font-black leading-none overflow-hidden text-transparent text-center flex items-center justify-center origin-bottom scale-y-0"
            style={{ WebkitTextStroke: '1px #1a1a1a' }}>
            <div className="scale-x-50 scale-y-150 tracking-[-1vw]">VOIDSTONE</div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section ref={heroSectionRef} className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        {hero?.mediaData ? (
          hero.mediaCategory === 'video' ? (
            <video ref={videoRef} autoPlay muted={muted} loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover"
              src={hero.isUrl ? hero.mediaData : `data:${hero.mediaType};base64,${hero.mediaData}`} />
          ) : (
            <img className="absolute inset-0 w-full h-full object-cover"
              src={hero.isUrl ? hero.mediaData : `data:${hero.mediaType};base64,${hero.mediaData}`} alt="Hero" />
          )
        ) : null}
        <div className="absolute inset-0 bg-black/50" />
        
        {introDone && (
          <div className="relative z-20 text-center text-white px-4 w-full">
            <div className="inline-flex items-baseline justify-center">
              <span className="relative inline-block">
                <span ref={voidstoneAnimRef} className="relative inline-block" />
                <span ref={voidstoneScrambleRef} className="text-[12vw] md:text-[15vw] font-black uppercase tracking-[-0.5vw] leading-[0.8]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", display: 'none', transform: 'translateY(10%)', letterSpacing: '-0.5vw' }}>
                  {scrambleReady && <ScrambledText radius={300} duration={1.5} speed={0.3} scrambleChars=".:">VOIDSTONE</ScrambledText>}
                </span>
              </span>
              <span className="text-[5vw] md:text-[7vw] uppercase tracking-[0.1vw] leading-[0.8] ml-3 md:ml-4"
                style={{ fontFamily: "'Anton', sans-serif", color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.7)' }}>
                {scrambleReady ? <ScrambledText radius={200} duration={1.5} speed={0.3} scrambleChars=".:">STUDIO</ScrambledText> : 'STUDIO'}
              </span>
            </div>
            {hero?.subtitle && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
                className={`text-lg md:text-2xl max-w-2xl mx-auto font-light text-gray-300 ${scrambleReady ? '-mt-4 mb-8' : 'mb-8'}`}>
                {scrambleReady ? <ScrambledText radius={120} duration={2} speed={0.3} scrambleChars=".:">{hero.subtitle}</ScrambledText> : hero.subtitle}
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 0.8 }}>
              <Link to="/products" className="inline-block bg-[#ff6b35] text-black px-10 py-4 font-black text-lg uppercase tracking-[0.2em] border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300">
                {scrambleReady ? <ScrambledText radius={80} duration={2} speed={0.3} scrambleChars=".:">{hero?.buttonText || 'Explore Collection'}</ScrambledText> : (hero?.buttonText || 'Explore Collection')}
              </Link>
            </motion.div>
          </div>
        )}

        {!isMobile() && (
          <div ref={cursorRef} className="fixed z-[1000] top-0 left-0 w-[6vw] h-auto aspect-[10/4] pointer-events-none -translate-x-1/2 -translate-y-1/2 scale-0"
            style={{ fontFamily: 'Anton, sans-serif', color: '#0a0a0a', fontSize: '1.5vw' }}>
            <span className="relative z-10">DRAG</span>
            <div className="absolute inset-0 bg-[#ff6b35] rounded-full -rotate-[15deg] -z-10" />
          </div>
        )}

        {hero?.mediaCategory === 'video' && (
          <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3 bg-black/60 border border-gray-800 p-4">
            <button onClick={toggleMute} className="text-white hover:text-[#ff6b35] transition">{muted ? <VolumeOffIcon /> : <VolumeUpIcon />}</button>
            <ElasticSlider leftIcon={<VolumeOffIcon />} rightIcon={<VolumeUpIcon />} startingValue={0} defaultValue={muted ? 0 : volume} maxValue={100} onChange={handleVolumeChange} />
          </div>
        )}
        {isAdmin && (
          <Link to="/admin/hero" className="absolute top-4 right-4 z-30 bg-black/60 text-white px-4 py-2 border border-gray-800 hover:border-[#ff6b35] transition font-mono text-sm uppercase tracking-wider">Edit Hero</Link>
        )}
      </section>

      <EthosSection />

      <CategoryBanners products={products} />

      {products.length > 0 && (
        <section className="relative py-32 z-10 border-t border-gray-800">
        
            <div className="max-w-7xl mx-auto px-4 py-12">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Latest Pieces</h2>
                <p className="text-gray-400 font-mono text-sm">Discover our newest handcrafted additions</p>
              </motion.div>
              <FloatingPolaroidGallery products={products} />
              <div className="text-center mt-10">
                <Link to="/products" className="inline-block px-8 py-4 border border-[#ff6b35] text-[#ff6b35] font-mono uppercase tracking-wider hover:bg-[#ff6b35] hover:text-black transition-all duration-300">View All Products</Link>
              </div>
            </div>
         
        </section>
      )}

      <section className="relative py-32 z-10 border-t border-gray-800">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">Featured Pieces</h2>
          <p className="text-gray-400 font-mono text-sm">Rotating showcase of our collection</p>
        </motion.div>
        {products.length > 0 ? (
          <Carousel3D products={products} imageWidth={200} imageHeight={280} rotateSpeed={25} translateZ={350} borderRadius={12} />
        ) : (
          <p className="text-center text-gray-500 font-mono py-12">No products yet</p>
        )}
        <div className="text-center mt-16">
          <Link to="/products" className="inline-block px-8 py-4 border border-white text-white font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300">Shop All</Link>
        </div>
      </section>
    </>
  );
};

export default Home;