import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import StaggeredMenu from '../ui/StaggeredMenu';
import LanguageSwitcher from '../common/LanguageSwitcher';

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const closeMenu = () => setMenuOpen(false);

  const handleNav = (link) => {
    closeMenu();
    if (link === '/logout') { logout(); navigate('/'); return; }
    navigate(link);
  };

  const menuItems = [
    { label: t('nav.home'), link: '/', onClick: () => handleNav('/') },
    { label: t('nav.products'), link: '/products', onClick: () => handleNav('/products') },
    { label: t('nav.contact'), link: '/contact', onClick: () => handleNav('/contact') },
    { label: t('nav.cart'), link: '/cart', onClick: () => handleNav('/cart') },
    ...(isAdmin ? [{ label: 'Admin', link: '/admin', onClick: () => handleNav('/admin') }] : []),
    ...(isAuthenticated 
      ? [{ label: t('nav.logout'), link: '/logout', onClick: () => handleNav('/logout') }] 
      : [
          { label: t('nav.login'), link: '/login', onClick: () => handleNav('/login') },
          { label: t('nav.register'), link: '/register', onClick: () => handleNav('/register') },
        ]),
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex-shrink-0">
              <motion.h1 
                className="text-xl font-black text-white tracking-tighter hover:text-[#ff6b35] transition-colors" 
                whileHover={{ scale: 1.05 }}
              >
                VOIDSTONE
              </motion.h1>
            </Link>
            
            <div className="flex items-center space-x-6">
              <LanguageSwitcher />
              
              <Link to="/cart" className="relative text-gray-400 hover:text-[#ff6b35] transition-colors">
                <CartIcon />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute -top-2 -right-2 bg-[#ff6b35] text-black rounded-full h-4 w-4 flex items-center justify-center text-xs font-mono"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
              
              <button 
                onClick={() => setMenuOpen(true)} 
                className="text-gray-400 hover:text-[#ff6b35] transition-colors p-1"
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <StaggeredMenu
        isOpen={menuOpen}
        onClose={closeMenu}
        items={menuItems}
        accentColor="#ff6b35"
      />
    </>
  );
};

export default Navbar;