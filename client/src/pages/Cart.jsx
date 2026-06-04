import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatDT } from '../utils/format';
import Navbar from '../components/layout/Navbar';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      {cart.length === 0 ? (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto mb-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">{t('cart.empty')}</h2>
            <Link 
              to="/products" 
              className="inline-block text-[#ff6b35] font-mono text-sm uppercase tracking-wider border border-[#ff6b35] px-6 py-3 hover:bg-[#ff6b35] hover:text-black transition-all duration-300"
            >
              {t('cart.continueShopping')}
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="py-12 relative">
          <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
          />
          
          <div className="max-w-4xl mx-auto px-4 relative z-20">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-8">{t('cart.title')}</h1>
            <div className="space-y-4">
              {cart.map(item => (
                <motion.div key={item._id} layout className="flex items-center justify-between border border-gray-800 bg-[#0f0f0f] p-4">
                  <div className="flex items-center space-x-4">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} className="w-16 h-16 object-cover border border-gray-800" />
                    <div>
                      <h3 className="font-bold text-white uppercase text-sm">{item.name}</h3>
                      <p className="text-[#ff6b35] font-mono">{formatDT(item.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1 border border-gray-800 text-white hover:border-[#ff6b35] transition font-mono">-</button>
                    <span className="text-white font-mono min-w-[30px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1 border border-gray-800 text-white hover:border-[#ff6b35] transition font-mono">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-300 transition font-mono text-xs uppercase tracking-wider">{t('cart.remove')}</button>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex justify-between items-center border-t border-gray-800 pt-6">
              <button onClick={clearCart} className="text-red-400 hover:text-red-300 transition font-mono text-xs uppercase tracking-wider">{t('cart.clearCart')}</button>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{t('cart.total')}: <span className="text-[#ff6b35]">{formatDT(cartTotal)}</span></p>
                <Link to="/checkout" className="inline-block mt-4 bg-[#ff6b35] text-black px-8 py-4 font-black uppercase tracking-wider border-2 border-[#ff6b35] hover:bg-transparent hover:text-[#ff6b35] transition-all duration-300">
                  {t('cart.checkout')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;