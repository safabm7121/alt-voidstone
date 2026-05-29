import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Carousel3D from '../components/ui/Carousel3D';
import ElasticSlider from '../components/ui/ElasticSlider';
import MasonryGrid from '../components/products/MasonryGrid';
import Masonry from '../components/ui/Masonry';
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
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const isAdmin = user?.email === 'voidstonestudio@gmail.com';

  useEffect(() => {
    fetchHero();
    api.get('/products').then(res => setProducts(res.data.products)).catch(() => {});
  }, []);

  const fetchHero = async () => {
    try {
      const res = await api.get('/hero/active');
      setHero(res.data.hero);
    } catch (err) {
      console.error('Error fetching hero:', err);
    }
  };

  // Force video autoplay when hero loads
  useEffect(() => {
    if (hero?.mediaCategory === 'video' && videoRef.current && !videoLoaded) {
      const video = videoRef.current;
      video.muted = muted;
      video.volume = volume / 100;
      
      const playVideo = () => {
        video.play().then(() => {
          setVideoLoaded(true);
        }).catch(err => {
          console.log('Autoplay blocked, retrying...', err);
          // Retry after user interaction
          const playOnInteraction = () => {
            video.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
      };
      
      playVideo();
    }
  }, [hero, videoLoaded]);

  const handleVolumeChange = (val) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      videoRef.current.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
      setVolume(newMuted ? 0 : 50);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {hero?.mediaData ? (
          hero.mediaCategory === 'video' ? (
            <video
              ref={videoRef}
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              src={hero.isUrl ? hero.mediaData : `data:${hero.mediaType};base64,${hero.mediaData}`}
              onLoadedData={() => setVideoLoaded(true)}
            />
          ) : (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={hero.isUrl ? hero.mediaData : `data:${hero.mediaType};base64,${hero.mediaData}`}
              alt="Hero"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-gray-900" />
        )}
        
        <div className="absolute inset-0 bg-black/40" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative z-10 text-center text-white px-4"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter"
            initial={{ letterSpacing: '0.3em', opacity: 0 }}
            animate={{ letterSpacing: 'normal', opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            {hero?.title || 'VOIDSTONE'}
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {hero?.subtitle || ''}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link
              to="/products"
              className="inline-block bg-white text-black px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-all hover:scale-105"
            >
              {hero?.buttonText || 'Explore Collection'}
            </Link>
          </motion.div>
        </motion.div>

        {/* Volume Control */}
        {hero?.mediaCategory === 'video' && (
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl p-4">
            <button onClick={toggleMute} className="text-white hover:text-gray-300 transition">
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </button>
            <ElasticSlider
              leftIcon={<VolumeOffIcon />}
              rightIcon={<VolumeUpIcon />}
              startingValue={0}
              defaultValue={muted ? 0 : volume}
              maxValue={100}
              onChange={handleVolumeChange}
            />
          </div>
        )}

        {/* Admin Edit */}
        {isAdmin && (
          <Link to="/admin/hero" className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition">
            Edit Hero
          </Link>
        )}
      </section>

    {/* Pinterest Masonry Grid */}
{products.length > 0 && (
  <section className="py-16 bg-white dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Latest Pieces</h2>
        <p className="text-gray-500 text-lg">Discover our newest handcrafted additions</p>
      </motion.div>
      
      <Masonry
        items={products.map(p => ({
          ...p,
          height: (p.images?.[0] ? Math.floor(Math.random() * 200) + 250 : 300)
        }))}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.95}
        blurToFocus
      />
      
      <div className="text-center mt-10">
        <Link to="/products" className="inline-block px-8 py-3 border-2 border-black dark:border-white rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
          View All Products
        </Link>
      </div>
    </div>
  </section>
)}

      {/* 3D Carousel Section */}
      <section className="py-20 bg-opacity-0">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Pieces</h2>
          <p className="text-gray-400 text-lg">Rotating showcase of our collection</p>
        </motion.div>

        {products.length > 0 ? (
          <Carousel3D
            products={products}
            imageWidth={200}
            imageHeight={280}
            rotateSpeed={25}
            translateZ={350}
            borderRadius={12}
          />
        ) : (
          <p className="text-center text-gray-400 py-12">No products yet</p>
        )}

        <div className="text-center mt-12">
          <Link to="/products" className="inline-block border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all">
            Shop All
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;