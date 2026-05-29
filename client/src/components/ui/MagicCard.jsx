import { useEffect, useRef } from 'react';

const MagicCard = ({
  children,
  className = '',
  gradientColor = '#262626',
  gradientOpacity = 0.5,
  gradientSize = 200
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl ${className}`}
      style={{
        background: `radial-gradient(${gradientSize}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${gradientColor}${Math.round(gradientOpacity * 255).toString(16).padStart(2, '0')}, transparent 80%)`
      }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default MagicCard;