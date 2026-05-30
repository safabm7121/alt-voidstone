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

const Home = () => {
  const { user } = useAuth();
  const [hero, setHero] = useState(null);
  const [products, setProducts] = useState([]);
  const [volume, setVolume] = useState(() => {
    const saved = sessionStorage.getItem('heroVolume');
    return saved ? parseInt(saved) : 0;
  });
  const [muted, setMuted] = useState(() => {
    const saved = sessionStorage.getItem('heroMuted');
    return saved ? saved === 'true' : true;
  });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(() => {
    return sessionStorage.getItem('heroInteracted') === 'true';
  });
  const videoRef = useRef(null);
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
    } catch (err) {
      console.error('Error fetching hero:', err);
    }
  };

  useEffect(() => {
    if (hero?.mediaCategory === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      if (!hasInteracted) {
        video.muted = true;
        video.volume = 0;
      } else {
        video.muted = muted;
        video.volume = volume / 100;
      }
      
      const playVideo = () => {
        video.play().then(() => setVideoLoaded(true)).catch(() => {
          document.addEventListener('click', () => video.play(), { once: true });
          document.addEventListener('touchstart', () => video.play(), { once: true });
        });
      };
      playVideo();
    }
  }, [hero]);

  const handleVolumeChange = (val) => {
    setVolume(val);
    setHasInteracted(true);
    sessionStorage.setItem('heroInteracted', 'true');
    
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      if (val === 0) {
        videoRef.current.muted = true;
        setMuted(true);
      } else {
        videoRef.current.muted = false;
        setMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
      setHasInteracted(true);
      sessionStorage.setItem('heroInteracted', 'true');
      
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(50);
        videoRef.current.volume = 0.5;
      }
    }
  };

  return (
    <>
      {/* FlowingRibbons background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FlowingRibbons backgroundColor="#0a0a0a" lineColor="#ff6b35" animationSpeed={0.2} />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        {hero?.mediaData ? (
          hero.mediaCategory === 'video' ? (
            <video ref={videoRef} autoPlay muted={muted} loop playsInline preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              src={hero.isUrl ? hero.mediaData : `data:${hero.mediaType};base64,${hero.mediaData}`}
              onLoadedData={() => setVideoLoaded(true)} />
          ) : (
            <img className="absolute inset-0 w-full h-full object-cover"
              src={hero.isUrl ? hero.mediaData : `data:${hero.mediaType};base64,${hero.mediaData}`} alt="Hero" />
          )
        ) : null}
        
        <div className="absolute inset-0 bg-black/50" />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative z-20 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase">
            {hero ? (
              <ScrambledText radius={150} duration={2} speed={0.3} scrambleChars=".:">
                {hero.title}
              </ScrambledText>
            ) : (
              'VOIDSTONE'
            )}
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light text-gray-300">
            {hero ? (
              <ScrambledText radius={120} duration={2} speed={0.3} scrambleChars=".:">
                {hero.subtitle}
              </ScrambledText>
            ) : (
              ''
            )}
          </p>
          
          <Link to="/products" className="inline-block bg-[#ff6b35] text-black px-10 py-4 font-black text-lg uppercase tracking-[0.2em] border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300">
            <ScrambledText radius={80} duration={2} speed={0.3} scrambleChars=".:">
              {hero?.buttonText || 'Explore Collection'}
            </ScrambledText>
          </Link>
        </motion.div>

        {hero?.mediaCategory === 'video' && (
          <div className="absolute bottom-8 right-8 z-30 flex items-center gap-3 bg-black/60 backdrop-blur-sm border border-gray-800 p-4">
            <button onClick={toggleMute} className="text-white hover:text-[#ff6b35] transition">
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </button>
            <ElasticSlider leftIcon={<VolumeOffIcon />} rightIcon={<VolumeUpIcon />} startingValue={0} defaultValue={muted ? 0 : volume} maxValue={100} onChange={handleVolumeChange} />
          </div>
        )}

        {isAdmin && (
          <Link to="/admin/hero" className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-md text-white px-4 py-2 border border-gray-800 hover:border-[#ff6b35] transition font-mono text-sm uppercase tracking-wider">Edit Hero</Link>
        )}
      </section>

      {/* Floating Polaroid Gallery */}
      {products.length > 0 && (
        <section className="relative py-20 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Latest Pieces</h2>
              <p className="text-gray-400 font-mono text-sm">Discover our newest handcrafted additions</p>
            </motion.div>
            <FloatingPolaroidGallery products={products} />
            <div className="text-center mt-8">
              <Link to="/products" className="inline-block px-8 py-4 border border-[#ff6b35] text-[#ff6b35] font-mono uppercase tracking-wider hover:bg-[#ff6b35] hover:text-black transition-all duration-300">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3D Carousel Section */}
      <section className="relative py-20 z-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">Featured Pieces</h2>
          <p className="text-gray-400 font-mono text-sm">Rotating showcase of our collection</p>
        </motion.div>
        {products.length > 0 ? (
          <Carousel3D products={products} imageWidth={200} imageHeight={280} rotateSpeed={25} translateZ={350} borderRadius={12} />
        ) : (
          <p className="text-center text-gray-500 font-mono py-12">No products yet</p>
        )}
        <div className="text-center mt-12">
          <Link to="/products" className="inline-block px-8 py-4 border border-white text-white font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300">Shop All</Link>
        </div>
      </section>
    </>
  );
};

export default Home;