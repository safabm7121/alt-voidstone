import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowRight } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const NewsletterSection = () => {
  const sectionRef = useRef(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.newsletter-reveal', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=100",
          end: "center center",
          toggleActions: "play none none reverse",
          scrub: 0.5
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Add your newsletter API call here
    }
  };

  return (
    <section ref={sectionRef} className="relative py-32 z-10 border-t border-gray-800">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <span className="newsletter-reveal inline-block px-3 py-1 border border-gray-800 text-gray-500 font-mono text-xs tracking-[0.2em] uppercase mb-8">
          The Void
        </span>
        <h2 className="newsletter-reveal text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">
          Join the Movement
        </h2>
        <p className="newsletter-reveal text-gray-400 font-mono text-sm mb-10">
          Early access to drops. Behind the scenes. No spam, just art.
        </p>

        {submitted ? (
          <div className="newsletter-reveal text-[#ff6b35] font-mono text-lg">
            You're in. Welcome to the Void.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-reveal flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="flex-1 bg-transparent border-b-2 border-gray-800 py-3 text-white placeholder-gray-500 focus:border-[#ff6b35] focus:outline-none transition font-mono text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#ff6b35] text-black font-black uppercase tracking-wider text-sm hover:bg-white transition-all duration-300 flex items-center gap-2"
            >
              Subscribe <FiArrowRight />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;