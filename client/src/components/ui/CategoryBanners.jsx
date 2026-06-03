// src/components/ui/CategoryBanners.jsx
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiX, FiSave, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

gsap.registerPlugin(ScrollTrigger);

const CategoryBanners = ({ products = [] }) => {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const titleRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.email === 'voidstonestudio@gmail.com' || user?.role === 'admin';
  const scrollTriggerRef = useRef(null);
  const animationRef = useRef(null);

  const getSaved = (cat) => localStorage.getItem(`cat_banner_${cat}`);
  const getProductImg = (cat) => {
    const p = products.find(x => x.category?.startsWith(cat));
    return p?.images?.[0] || '';
  };

  const [banners, setBanners] = useState({
    Men: getSaved('Men') || getProductImg('Men'),
    Women: getSaved('Women') || getProductImg('Women'),
    Art: getSaved('Art') || getProductImg('Art'),
  });
  const [editing, setEditing] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [selProd, setSelProd] = useState('');

  const cats = [
    { n: 'Men', l: '/products?category=Men', desc: 'Sculptural & Raw' },
    { n: 'Women', l: '/products?category=Women', desc: 'Fluid & Defiant' },
    { n: 'Art', l: '/products?category=Art', desc: 'Wearable Canvas' }
  ];

  const catProducts = (cat) => cat === 'Art'
    ? products.filter(p => p.category === 'Art')
    : products.filter(p => p.category?.startsWith(cat));

  const open = (cat) => { setEditing(cat); setEditUrl(banners[cat]); setSelProd(''); };
  const save = () => {
    const u = selProd || editUrl;
    setBanners(p => ({ ...p, [editing]: u }));
    localStorage.setItem(`cat_banner_${editing}`, u);
    setEditing(null);
    toast.success(`${editing} updated`);
  };
  const pick = (id) => {
    const p = products.find(x => x._id === id);
    if (p?.images?.[0]) {
      setSelProd(p.images[0]);
      setEditUrl(p.images[0]);
    }
  };

  const handleCategoryClick = (url) => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    navigate(url);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Kill existing ScrollTrigger if any
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }
    if (animationRef.current) {
      animationRef.current.kill();
    }

    // Reset position
    gsap.set(wrapper, { x: 0 });

    const totalScroll = wrapper.scrollWidth - window.innerWidth;
    
    if (totalScroll > 0) {
      // Create the animation
      animationRef.current = gsap.to(wrapper, {
        x: -totalScroll,
        ease: 'none',
        duration: totalScroll / 100, // Smooth duration based on scroll distance
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${wrapper.scrollWidth}`,
          scrub: 0.8, // Smooth scrubbing both directions
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          anticipatePin: 0,
          onRefresh: (self) => {
            // Recalculate on refresh
            const newTotal = wrapper.scrollWidth - window.innerWidth;
            if (newTotal !== totalScroll) {
              self.animation.vars.x = -newTotal;
              self.animation.invalidate();
            }
          }
        }
      });
      
      scrollTriggerRef.current = animationRef.current.scrollTrigger;
    }

    // Title animation - independent scroll trigger
    const titleTrigger = ScrollTrigger.create({
      trigger: titleRef.current,
      start: 'top 80%',
      end: 'top 30%',
      scrub: 0.5,
      onUpdate: (self) => {
        gsap.set(titleRef.current, { 
          y: 100 * (1 - self.progress), 
          opacity: self.progress 
        });
      }
    });

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }
      titleTrigger.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 border-t border-gray-800 bg-[#0a0a0a] overflow-hidden">
      <div ref={titleRef} className="absolute top-6 left-6 z-20" style={{ opacity: 0, y: 100 }}>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Shop by Category
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-8 h-[1px] bg-[#ff6b35]" />
          <span className="text-[10px] font-mono text-gray-500 tracking-wider">HORIZONTAL SCROLL</span>
        </div>
      </div>

      <div ref={wrapperRef} className="flex flex-nowrap h-screen pt-24">
        {cats.map((cat) => (
          <div
            key={cat.n}
            onClick={() => handleCategoryClick(cat.l)}
            className="flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] h-[75vh] group relative mx-4 first:ml-6 last:mr-6 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 overflow-hidden">
              {banners[cat.n] ? (
                <img
                  src={banners[cat.n]}
                  alt={cat.n}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-black" />
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

            <div className="absolute inset-0 flex flex-col justify-end p-8 pb-12">
              <div>
                <span
                  className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white block leading-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {cat.n}
                </span>
                <p className="text-sm font-mono text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-6 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white uppercase tracking-wider">Shop Now</span>
                  <FiArrowRight className="w-4 h-4 text-white group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#ff6b35] transition-all duration-500 pointer-events-none" />

            {isAdmin && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); open(cat.n); }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/60 border border-gray-700 hover:border-[#ff6b35] transition-all hover:scale-110"
              >
                <FiEdit className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {cats.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              const wrapper = wrapperRef.current;
              if (wrapper && wrapper.children[idx]) {
                const scrollAmount = wrapper.children[idx].offsetLeft;
                gsap.to(wrapper, { 
                  x: -scrollAmount, 
                  duration: 0.8, 
                  ease: "power2.inOut",
                  overwrite: true
                });
              }
            }}
            className="w-2 h-2 rounded-full bg-gray-600 hover:bg-[#ff6b35] transition-all duration-300"
          />
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setEditing(null)}>
          <div className="bg-[#0f0f0f] border border-gray-800 p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Edit {editing}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 uppercase mb-2">From products</label>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {catProducts(editing).map(p => (
                  <button key={p._id} onClick={() => pick(p._id)} className={`border-2 overflow-hidden ${selProd === p.images?.[0] ? 'border-[#ff6b35]' : 'border-gray-800'}`}>
                    <img src={p.images?.[0] || ''} alt="" className="w-full h-14 object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Or URL</label>
              <input value={editUrl} onChange={e => { setEditUrl(e.target.value); setSelProd(''); }} className="w-full p-3 bg-[#111] border border-gray-800 text-white text-sm font-mono" />
            </div>
            {editUrl && <img src={editUrl} className="w-full h-32 object-cover border border-gray-800 mb-4" />}
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 border border-gray-800 text-gray-400 font-mono text-xs uppercase">Cancel</button>
              <button onClick={save} className="flex-1 py-3 bg-[#ff6b35] text-black font-black text-xs uppercase flex items-center justify-center gap-2"><FiSave /> Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryBanners;