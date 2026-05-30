import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiImage, FiPackage } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || user?.email !== 'voidstonestudio@gmail.com') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 relative">
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="max-w-4xl mx-auto px-4 relative z-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 font-mono text-sm mb-12">Manage your store</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/admin/create-product" className="group">
              <div className="border border-gray-800 bg-[#0f0f0f] p-8 hover:border-[#ff6b35] transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 border border-[#ff6b35]/30 flex items-center justify-center mb-4 group-hover:border-[#ff6b35] group-hover:scale-110 transition">
                  <FiPackage className="w-7 h-7 text-[#ff6b35]" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Create Product</h2>
                <p className="text-gray-500 font-mono text-xs">Add new items to your collection</p>
              </div>
            </Link>

            <Link to="/admin/hero" className="group">
              <div className="border border-gray-800 bg-[#0f0f0f] p-8 hover:border-[#ff6b35] transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 border border-[#ff6b35]/30 flex items-center justify-center mb-4 group-hover:border-[#ff6b35] group-hover:scale-110 transition">
                  <FiImage className="w-7 h-7 text-[#ff6b35]" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Edit Hero</h2>
                <p className="text-gray-500 font-mono text-xs">Change homepage media & text</p>
              </div>
            </Link>

            <Link to="/products" className="group">
              <div className="border border-gray-800 bg-[#0f0f0f] p-8 hover:border-[#ff6b35] transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 border border-[#ff6b35]/30 flex items-center justify-center mb-4 group-hover:border-[#ff6b35] group-hover:scale-110 transition">
                  <FiEdit className="w-7 h-7 text-[#ff6b35]" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Manage Products</h2>
                <p className="text-gray-500 font-mono text-xs">View and edit existing products</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;