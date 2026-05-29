import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiImage, FiPackage } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || user?.email !== 'voidstonestudio@gmail.com') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 mb-8">Manage your store</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/admin/create-product" className="group">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FiPackage className="w-7 h-7 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Create Product</h2>
                <p className="text-gray-500 text-sm">Add new items to your collection</p>
              </div>
            </Link>

            <Link to="/admin/hero" className="group">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FiImage className="w-7 h-7 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Edit Hero</h2>
                <p className="text-gray-500 text-sm">Change homepage media & text</p>
              </div>
            </Link>

            <Link to="/products" className="group">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <FiEdit className="w-7 h-7 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Manage Products</h2>
                <p className="text-gray-500 text-sm">View and edit existing products</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;