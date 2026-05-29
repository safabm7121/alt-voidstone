import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const MasonryGrid = ({ products }) => (
  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
    {products.map((product, i) => (
      <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
        <ProductCard product={product} />
      </motion.div>
    ))}
  </div>
);

export default MasonryGrid;