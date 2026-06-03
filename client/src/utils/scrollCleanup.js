// src/utils/scrollCleanup.js
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const killAllScrollTriggers = () => {
  // Kill all ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => {
    trigger.kill();
  });
};

export const refreshScrollTriggers = () => {
  ScrollTrigger.refresh();
};