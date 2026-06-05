import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const MasonryGrid = ({ products, onDelete, onUpdate }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {products.map((product, i) => (
      <motion.div 
        key={product._id} 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: i * 0.05 }}
        className="h-full"
      >
        <ProductCard 
          product={product} 
          onDelete={onDelete} 
          onUpdate={onUpdate} 
        />
      </motion.div>
    ))}
  </div>
);

export default MasonryGrid;