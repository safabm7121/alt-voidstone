import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { formatDT } from '../utils/format';
import MasonryGrid from '../components/products/MasonryGrid';
import { FiSearch, FiSliders, FiX, FiGrid, FiLayers } from 'react-icons/fi';

const Products = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [mainCategory, setMainCategory] = useState('All');
  const [subCategory, setSubCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const mainCategories = ['All', 'Men', 'Women', 'Art'];

  const subCategoriesByGender = {
    Men: ['Accessories', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Coats', 'Bags', 'Shoes', 'Hats'],
    Women: ['Accessories', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Coats', 'Dresses', 'Skirts', 'Bags', 'Shoes', 'Hats']
  };

  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data.products);
      setFiltered(res.data.products);
    });
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [products, search, mainCategory, subCategory, priceRange, sortBy]);

  const filterAndSort = () => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (mainCategory !== 'All') {
      if (mainCategory === 'Art') {
        result = result.filter(p => p.category === 'Art');
      } else if (subCategory) {
        result = result.filter(p => p.category === `${mainCategory} ${subCategory}`);
      } else {
        result = result.filter(p => p.category.startsWith(mainCategory + ' '));
      }
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFiltered(result);
  };

  const clearFilters = () => {
    setSearch('');
    setMainCategory('All');
    setSubCategory('');
    setPriceRange([0, 2500]);
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold mb-8 text-center"
      >
        {t('products.title')}
      </motion.h1>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-grow max-w-md relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('products.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <FiSliders />
              Filters
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {viewMode === 'grid' ? <FiGrid /> : <FiLayers />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Main Category */}
                  <select
                    value={mainCategory}
                    onChange={e => { setMainCategory(e.target.value); setSubCategory(''); }}
                    className="p-3 border rounded-xl bg-white dark:bg-gray-700"
                  >
                    {mainCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? t('common.all') : t(`products.categories.${cat.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>

                  {/* Sub Category */}
                  {(mainCategory === 'Men' || mainCategory === 'Women') && (
                    <select
                      value={subCategory}
                      onChange={e => setSubCategory(e.target.value)}
                      className="p-3 border rounded-xl bg-white dark:bg-gray-700"
                    >
                      <option value="">{t('products.subcategory')}</option>
                      {subCategoriesByGender[mainCategory].map(sub => (
                        <option key={sub} value={sub}>
                          {t(`products.categories.${sub === 'T-Shirts' ? 'tShirts' : sub.toLowerCase()}`)}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="p-3 border rounded-xl bg-white dark:bg-gray-700"
                  >
                    <option value="newest">{t('products.newest')}</option>
                    <option value="price-low">{t('products.priceLow')}</option>
                    <option value="price-high">{t('products.priceHigh')}</option>
                    <option value="name-asc">{t('products.nameAsc')}</option>
                    <option value="name-desc">{t('products.nameDesc')}</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm mb-2">
                    {t('products.priceRange')}: {formatDT(priceRange[0])} - {formatDT(priceRange[1])}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2500"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-purple-600"
                  />
                </div>

                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 transition"
                >
                  <FiX /> {t('products.clearFilters')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        {filtered.length} {t('products.productsFound')}
      </p>

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <MasonryGrid products={filtered} />
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">{t('products.noProducts')}</p>
          <button onClick={clearFilters} className="mt-4 text-purple-500 hover:underline">
            {t('products.clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;