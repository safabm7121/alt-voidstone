'use client';
import { useEffect, useRef, useCallback } from 'react';

const FlowingRibbons = ({
  backgroundColor = '#0a0a0a',
  lineColor = '#ff6b35',
  animationSpeed = 0.2,
  removeWaveLine = true,
}) => {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animationFrameId = useRef(null);
  const mouseRef = useRef({ x: -500, y: -500, isDown: false, targetX: -500, targetY: -500 });
  const waveDisturbances = useRef([]);
  const dprRef = useRef(1);

  const getMouseInfluence = (x, y) => {
    const dx = x - mouseRef.current.x;
    const dy = y - mouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 300;
    return Math.max(0, 1 - distance / maxDistance);
  };

  const getWaveDisturbance = (x, y, currentTime) => {
    let totalDisturbance = 0;
    waveDisturbances.current.forEach((disturbance) => {
      const age = currentTime - disturbance.time;
      const maxAge = 3000;
      if (age < maxAge) {
        const dx = x - disturbance.x;
        const dy = y - disturbance.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const waveRadius = (age / maxAge) * 400;
        const waveWidth = 80;
        if (Math.abs(distance - waveRadius) < waveWidth) {
          const waveStrength = (1 - age / maxAge) * disturbance.intensity;
          const proximityToWave = 1 - Math.abs(distance - waveRadius) / waveWidth;
          totalDisturbance += waveStrength * proximityToWave * Math.sin((distance - waveRadius) * 0.1);
        }
      }
    });
    return totalDisturbance;
  };

  const deform = (x, y, t, progress) => {
    const mouseInfluence = getMouseInfluence(x, y);
    const disturbance = getWaveDisturbance(x, y, Date.now());
    const wave1 = Math.sin(progress * Math.PI * 4 + t * 0.01) * 30;
    const wave2 = Math.sin(progress * Math.PI * 7 - t * 0.008) * 15;
    const harmonic = Math.sin(x * 0.02 + y * 0.015 + t * 0.005) * 10;
    const mouseWave = mouseInfluence * Math.sin(t * 0.02 + progress * Math.PI * 2) * 40; // More movement
    const disturbanceWave = disturbance * Math.sin(t * 0.015 + progress * Math.PI * 3) * 25;
    return {
      offsetX: wave1 + harmonic + mouseWave + disturbanceWave,
      offsetY: wave2 + mouseWave * 0.6 + disturbanceWave * 0.7,
    };
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const displayWidth = rect?.width || window.innerWidth;
    const displayHeight = rect?.height || window.innerHeight;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Listen on window directly so it works through all elements
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.targetX = e.clientX - rect.left;
    mouseRef.current.targetY = e.clientY - rect.top;
  }, []);

  const handleMouseDown = useCallback((e) => {
    mouseRef.current.isDown = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    waveDisturbances.current.push({ x, y, time: Date.now(), intensity: 2 });
    const now = Date.now();
    waveDisturbances.current = waveDisturbances.current.filter((disturbance) => now - disturbance.time < 3000);
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentTime = Date.now();
    timeRef.current += animationSpeed;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Smooth follow - faster
    if (mouseRef.current.targetX !== -500) {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.15;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.15;
    }

    const gridDensity = 80;
    const ribbonWidth = width * 0.85;
    const ribbonOffset = (width - ribbonWidth) / 2;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // LOW OPACITY
    ctx.strokeStyle = lineColor;
    ctx.globalAlpha = 0.12; // VERY LOW OPACITY
    ctx.lineWidth = 0.5;

    for (let i = 0; i < gridDensity; i++) {
      const x = ribbonOffset + (i / gridDensity) * ribbonWidth;
      ctx.beginPath();
      for (let j = 0; j <= gridDensity; j++) {
        const progress = (j / gridDensity) * 1.2 - 0.1;
        const y = progress * height;
        const { offsetX, offsetY } = deform(x, y, timeRef.current, progress);
        const finalX = x + offsetX;
        const finalY = y + offsetY;
        if (j === 0) ctx.moveTo(finalX, finalY);
        else ctx.lineTo(finalX, finalY);
      }
      ctx.stroke();
    }

    for (let j = 0; j < gridDensity; j++) {
      const progress = (j / gridDensity) * 1.2 - 0.1;
      const y = progress * height;
      ctx.beginPath();
      for (let i = 0; i <= gridDensity; i++) {
        const x = ribbonOffset + (i / gridDensity) * ribbonWidth;
        const { offsetX, offsetY } = deform(x, y, timeRef.current, progress);
        const finalX = x + offsetX;
        const finalY = y + offsetY;
        if (i === 0) ctx.moveTo(finalX, finalY);
        else ctx.lineTo(finalX, finalY);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    if (!removeWaveLine) {
      waveDisturbances.current.forEach((disturbance) => {
        const age = currentTime - disturbance.time;
        const maxAge = 3000;
        if (age < maxAge) {
          const progress = age / maxAge;
          const radius = progress * 400;
          const alpha = (1 - progress) * 0.1 * disturbance.intensity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.arc(disturbance.x, disturbance.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }, [removeWaveLine, backgroundColor, lineColor, animationSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    
    // Listen on WINDOW so mouse tracks through all elements
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      timeRef.current = 0;
      waveDisturbances.current = [];
    };
  }, [animate, resizeCanvas, handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ backgroundColor }}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default FlowingRibbons;