import { useEffect, useRef } from 'react';
import FlowingRibbons from './FlowingRibbons';

const GlobalBackground = () => {
  const containerRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    console.log('GlobalBackground mounted ONCE - staying permanent');
    
    return () => {
      console.log('GlobalBackground unmounting - this should only happen on full page reload');
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        pointerEvents: 'none',
        backgroundColor: '#0a0a0a'
      }}
    >
      <FlowingRibbons 
        backgroundColor="#0a0a0a" 
        lineColor="#ff6b35" 
        animationSpeed={0.2} 
        removeWaveLine={true}
      />
    </div>
  );
};

export default GlobalBackground;