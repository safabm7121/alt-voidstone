import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDT } from '../utils/format';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('cart.empty')}</h2>
        <Link to="/products" className="text-indigo-600 hover:underline">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>
      <div className="space-y-6">
        {cart.map(item => (
          <div key={item._id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex items-center space-x-4">
              <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p>{formatDT(item.price)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 border rounded">-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 border rounded">+</button>
            </div>
            <button onClick={() => removeFromCart(item._id)} className="text-red-600 hover:text-red-800">{t('cart.remove')}</button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button onClick={clearCart} className="text-red-600 hover:underline">{t('cart.clearCart')}</button>
        <div className="text-right">
          <p className="text-xl font-bold">{t('cart.total')}: {formatDT(cartTotal)}</p>
          <Link to="/checkout" className="inline-block mt-4 bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800">{t('cart.checkout')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;