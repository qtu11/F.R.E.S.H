'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, Package, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { productService, Product, ProductCategory } from '@/lib/data/products';
import { showToast } from '@/lib/data/notifications';
import {
  staggerContainer, staggerItem, fadeUp, scaleIn,
  cardHover, cardTap, buttonTap, useSafeReducedMotion,
} from '@/lib/animation';

export default function PartnerInventory() {
  const { t } = useGlobal();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduced = useSafeReducedMotion();

  const [form, setForm] = useState({ name: '', category: '', stock: 0, originalPrice: 0, aiPrice: 0, expiry: '' });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    productService.getByStore('s1').then(data => {
      setProducts(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(products);
    } else {
      const q = search.toLowerCase();
      setFiltered(products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ));
    }
  }, [search, products]);

  const resetForm = () => setForm({ name: '', category: '', stock: 0, originalPrice: 0, aiPrice: 0, expiry: '' });

  const handleAdd = async () => {
    if (!form.name || !form.category) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    const newProduct = await productService.create({
      name: form.name,
      category: form.category as ProductCategory,
      stock: form.stock,
      originalPrice: form.originalPrice,
      aiPrice: form.aiPrice || Math.round(form.originalPrice * 0.5),
      expiry: form.expiry,
      status: 'live',
      image: '📦',
      storeId: 's1',
      storeName: 'WinMart+ D1',
      discount: Math.round((1 - (form.aiPrice || form.originalPrice * 0.5) / form.originalPrice) * 100),
    });
    setProducts(prev => [...prev, newProduct]);
    setShowAddModal(false);
    resetForm();
    showToast('success', 'Product Added', `${newProduct.name} added to inventory`);
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    const updated = await productService.update(editingProduct.id, {
      name: form.name,
      category: form.category as ProductCategory,
      stock: form.stock,
      originalPrice: form.originalPrice,
      aiPrice: form.aiPrice,
      expiry: form.expiry,
      discount: Math.round((1 - form.aiPrice / form.originalPrice) * 100),
    });
    if (updated) {
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('success', 'Product Updated');
    }
    setEditingProduct(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await productService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('success', 'Product Deleted');
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      originalPrice: product.originalPrice,
      aiPrice: product.aiPrice,
      expiry: product.expiry,
    });
  };

  const modalOpen = showAddModal || editingProduct;

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
        className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide">{t('inventory')}</h1>
          <motion.button onClick={() => { resetForm(); setShowAddModal(true); }} whileHover={reduced ? {} : { scale: 1.02 }} whileTap={buttonTap}
            className="bg-white dark:bg-slate-800 text-[#057A42] dark:text-emerald-400 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" /> {t('add_product')}
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
          <motion.button whileTap={buttonTap}
            className="bg-white dark:bg-slate-800 px-6 py-3 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm flex items-center gap-2 font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
          >
            <Filter className="w-5 h-5" /> {t('filter')}
          </motion.button>
        </motion.div>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden p-8 space-y-4"
          >
            {[1,2,3].map(i => (
              <motion.div key={i} className="h-12 rounded-xl bg-gray-200 dark:bg-slate-700"
                animate={reduced ? {} : { backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={reduced ? {} : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={reduced ? {} : { background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={scaleIn} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('product')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('stock')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('price_original')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('price_ai')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('expiry_date')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filtered.map((item, i) => (
                    <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      whileHover={reduced ? {} : { backgroundColor: 'rgba(5, 122, 66, 0.02)' }}
                      className="transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <motion.div whileHover={reduced ? {} : { scale: 1.1, rotate: 5 }} className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-xl shadow-inner">
                            <Package className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
                          </motion.div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.stock > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                          {item.stock} {t('units')}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-600 dark:text-slate-400">{item.originalPrice.toLocaleString()} đ</td>
                      <td className="px-6 py-5 font-black text-[#057A42] dark:text-emerald-400">{item.aiPrice.toLocaleString()} đ</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-bold">
                          <Calendar className="w-3 h-3" /> {item.expiry}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button onClick={() => openEdit(item)} whileTap={buttonTap}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button onClick={() => handleDelete(item.id)} whileTap={buttonTap}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors" title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-400 dark:text-slate-500 font-bold"
              >
                {search ? 'No products match your search' : 'No products in inventory'}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-gray-900 dark:text-white text-lg">{editingProduct ? t('edit_product_title') : t('add_product')}</h3>
                <motion.button onClick={() => { setShowAddModal(false); setEditingProduct(null); resetForm(); }} whileTap={buttonTap}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                <motion.div variants={staggerItem}>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{t('product')}</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]"
                    placeholder={t('enter_product_name')}
                  />
                </motion.div>
                <motion.div variants={staggerItem}>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{t('categories')}</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]"
                  >
                    <option value="">{t('filter')}</option>
                    <option value="Bakery">{t('bakery')}</option>
                    <option value="Dairy">{t('dairy')}</option>
                    <option value="Produce">{t('vegetables')}</option>
                    <option value="Meals">{t('meals_count')}</option>
                    <option value="Beverages">{t('beverages')}</option>
                  </select>
                </motion.div>
                <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{t('stock')}</label>
                    <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{t('price_original')}</label>
                    <input type="number" min="0" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]"
                    />
                  </div>
                </motion.div>
                <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{t('price_ai')}</label>
                    <input type="number" min="0" value={form.aiPrice} onChange={e => setForm(p => ({ ...p, aiPrice: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase mb-1">{t('expiry_date')}</label>
                    <input type="text" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]"
                      placeholder="2026-05-15 18:00"
                    />
                  </div>
                </motion.div>
                <motion.button variants={staggerItem} onClick={editingProduct ? handleEdit : handleAdd}
                  whileHover={reduced ? {} : { scale: 1.01 }} whileTap={buttonTap}
                  className="w-full bg-gradient-to-r from-[#057A42] to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-[#046034] hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Check className="w-5 h-5" /> {editingProduct ? t('save_changes') : t('add_product')}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
