import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'ko', label: 'KO' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const index = languages.findIndex(l => l.code === i18n.language);
    if (index !== -1) setActiveIndex(index);
  }, [i18n.language]);

  const changeLanguage = (lng, index) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    localStorage.setItem('language', lng);
    setActiveIndex(index);
  };

  return (
    <div className="relative flex items-center gap-0 border border-gray-800/50 bg-[#0a0a0a] p-0.5 rounded-sm">
      {/* Sliding background indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 bg-[#ff6b35] z-0 rounded-sm"
        animate={{
          left: `calc(${activeIndex * 100}% / 4 + 2px)`,
          width: `calc(100% / 4 - 4px)`,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Hover glow */}
      <AnimatePresence>
        {hoveredIndex !== null && hoveredIndex !== activeIndex && (
          <motion.div
            className="absolute top-0.5 bottom-0.5 bg-white/10 z-0 rounded-sm"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              left: `calc(${hoveredIndex * 100}% / 4 + 2px)`,
              width: `calc(100% / 4 - 4px)`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {languages.map((lang, index) => (
        <motion.button
          key={lang.code}
          onClick={() => changeLanguage(lang.code, index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          whileTap={{ scale: 0.9 }}
          className={`relative z-10 flex-1 px-3 py-1.5 text-xs font-mono transition-colors duration-200 ${
            i18n.language === lang.code
              ? 'text-black'
              : hoveredIndex === index
                ? 'text-white'
                : 'text-gray-500'
          }`}
        >
          {lang.label}
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;