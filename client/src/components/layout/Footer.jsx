import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-lg font-black tracking-tighter text-white hover:text-[#ff6b35] transition">VOIDSTONE</Link>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{t('footer.rights')}</p>
          <p className="text-xs text-gray-600 font-mono">{t('footer.description')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;