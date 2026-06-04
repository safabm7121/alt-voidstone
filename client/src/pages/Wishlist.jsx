// client/src/pages/Wishlist.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiX } from 'react-icons/fi';
import { formatDT } from '../utils/format';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api.get('/wishlist')
      .then(res => setWishlist(res.data.wishlist))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(prev => ({
        ...prev,
        products: prev.products.filter(p => p._id !== productId)
      }));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <FiHeart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h1 className="text-2xl font-black mb-2">Login to view your wishlist</h1>
          <Link to="/login" className="text-[#ff6b35] hover:underline">Sign in</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-2">My Wishlist</h1>
        <p className="text-gray-500 font-mono text-sm mb-8">{wishlist?.products?.length || 0} items</p>
        
        {wishlist?.products?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.products.map(product => (
              <div key={product._id} className="border border-gray-800 bg-[#0f0f0f] group">
                <Link to={`/products/${product._id}`} className="block overflow-hidden">
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/400'} 
                    alt={product.name} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </Link>
                <div className="p-3">
                  <Link to={`/products/${product._id}`}>
                    <p className="text-sm font-medium text-white truncate hover:text-[#ff6b35] transition-colors">{product.name}</p>
                  </Link>
                  <p className="text-xs text-gray-500 font-mono uppercase mt-0.5">{product.category}</p>
                  <p className="text-[#ff6b35] font-bold mt-1">{formatDT(product.price)}</p>
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="mt-3 w-full py-1.5 border border-gray-700 text-gray-400 text-xs hover:border-red-500 hover:text-red-400 transition flex items-center justify-center gap-1"
                  >
                    <FiX className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiHeart className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 font-mono">Your wishlist is empty</p>
            <Link to="/products" className="text-[#ff6b35] hover:underline mt-2 inline-block">Browse products</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;