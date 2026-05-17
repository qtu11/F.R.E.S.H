'use client';

import { useState, useEffect } from 'react';
import { ScanBarcode, TrendingUp, Package, Leaf, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { productService, Product } from '@/lib/data/products';
import { showToast } from '@/lib/data/notifications';
import {
  staggerContainer, staggerItem, fadeUp, scaleIn, slideUp,
  cardHover, cardTap, buttonTap, useSafeReducedMotion,
} from '@/lib/animation';

export default function PartnerApp() {
  const { t } = useGlobal();
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const reduced = useSafeReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    productService.getByStore('s1').then(data => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const todaysRevenue = listings.filter(p => p.status === 'live').reduce((s, p) => s + p.aiPrice * p.stock, 0);
  const itemsRescued = listings.reduce((s, p) => s + (p.status === 'live' ? p.stock : 0), 0);
  const co2Reduced = Math.round(itemsRescued * 2.5);

  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Product | null>(null);

  const handleScan = () => {
    setShowScanner(true);
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        id: `scanned-${Date.now()}`,
        name: 'Scanned Product',
        image: '📦',
        storeName: 'WinMart+ D1',
        storeId: 's1',
        originalPrice: 85000,
        aiPrice: 25500,
        discount: 70,
        stock: 12,
        expiry: '2026-05-16 20:00',
        category: 'Bakery',
        status: 'live',
        createdAt: new Date().toISOString(),
      });
    }, 2500);
  };

  const handleAddScanned = () => {
    if (scanResult) {
      productService.create({
        name: scanResult.name,
        image: scanResult.image,
        storeName: scanResult.storeName,
        storeId: scanResult.storeId,
        originalPrice: scanResult.originalPrice,
        aiPrice: scanResult.aiPrice,
        discount: scanResult.discount,
        stock: scanResult.stock,
        expiry: scanResult.expiry,
        category: scanResult.category,
        status: scanResult.status,
      });
      setListings(prev => [scanResult, ...prev]);
      setShowScanner(false);
      setScanResult(null);
      showToast('success', 'Product Added', `${scanResult.name} added to inventory`);
    }
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
        className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors"
      >
        <div className="text-white font-bold text-lg text-center tracking-wide max-w-5xl mx-auto">{t('partner_dashboard')}</div>
      </motion.div>

      <div className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        <motion.div variants={staggerContainer} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={staggerItem} whileHover={reduced ? {} : cardHover}
            className="bg-gradient-to-br from-[#e1f5fe] to-white dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-6 shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col justify-center transition-colors"
          >
            <div className="mb-6">
              <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1 uppercase">{t('todays_revenue')}</div>
              <div className="text-black dark:text-white font-black text-4xl tracking-tight">+{todaysRevenue.toLocaleString()} VNĐ</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={reduced ? {} : { y: 20, opacity: 0 }} animate={reduced ? {} : { y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1 uppercase">{t('items_rescued')}</div>
                <div className="text-black dark:text-white font-black text-2xl">{itemsRescued}</div>
              </motion.div>
              <motion.div initial={reduced ? {} : { y: 20, opacity: 0 }} animate={reduced ? {} : { y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1 uppercase">{t('esg_impact_co2')}</div>
                <div className="text-black dark:text-white font-black text-2xl">{co2Reduced} kg</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <motion.button onClick={handleScan} whileHover={reduced ? {} : { scale: 1.02 }} whileTap={reduced ? {} : { scale: 0.98 }}
              className="w-full bg-gradient-to-br from-[#ff8c00] to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-3xl py-12 flex flex-col items-center justify-center gap-4 shadow-md hover:shadow-lg transition-all border border-orange-400/50 dark:border-orange-500/50"
            >
              <motion.div initial={reduced ? {} : { rotate: 0 }} whileHover={reduced ? {} : { rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                <ScanBarcode className="w-16 h-16" />
              </motion.div>
              <span className="font-black text-2xl tracking-wide uppercase">{t('scan_new_product')}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
          <h2 className="text-black dark:text-white font-bold text-sm tracking-wide mb-4 uppercase">{t('active_listings')}</h2>

          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
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
            <motion.div variants={scaleIn}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 overflow-x-auto transition-colors"
            >
              <div className="min-w-[600px]">
                <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 dark:text-slate-400 font-bold mb-4 uppercase px-4 border-b border-gray-100 dark:border-slate-700 pb-2">
                  <div>{t('product')}</div>
                  <div className="text-center">{t('stock')}</div>
                  <div className="text-center">{t('discount')}</div>
                  <div className="text-right">{t('status')}</div>
                </div>

                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {listings.map((item, i) => (
                    <motion.div key={item.id} variants={staggerItem} layout
                      whileHover={reduced ? {} : { x: 4, backgroundColor: 'rgba(5, 122, 66, 0.03)' }}
                      className="grid grid-cols-4 gap-4 items-center text-base font-bold border-b border-gray-50 dark:border-slate-700 pb-4 last:border-0 last:pb-0 px-4 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl shadow-inner border border-gray-200 dark:border-slate-600"
                          whileHover={reduced ? {} : { scale: 1.15, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}
                        >
                          {item.image}
                        </motion.div>
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                      </div>
                      <div className="text-center text-gray-800 dark:text-slate-200">{item.stock} {t('units')}</div>
                      <div className="text-center text-[#ff8c00] dark:text-orange-400 font-black">{item.discount}% {t('off')}</div>
                      <div className="text-right">
                        <motion.span initial={reduced ? {} : { scale: 0.8 }} animate={reduced ? {} : { scale: 1 }}
                          className={`inline-flex items-center gap-1 text-xs px-4 py-2 rounded-full uppercase tracking-wider font-extrabold shadow-sm ${
                            item.status === 'live'
                              ? 'bg-[#e8f5e9] dark:bg-emerald-900/30 text-[#057A42] dark:text-emerald-400 border border-[#c8e6c9] dark:border-emerald-800/50'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600'
                          }`}
                        >
                          {item.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {item.status === 'live' ? t('live') : t('out_of_stock')}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {showScanner && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowScanner(false)}
            >
              <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="font-bold text-gray-900 dark:text-white">Scan Product</h3>
                  <motion.button onClick={() => setShowScanner(false)} whileTap={buttonTap}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  </motion.button>
                </div>
                <div className="p-6">
                  {scanning ? (
                    <div className="flex flex-col items-center py-8">
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}
                        className="w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden"
                      >
                        <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#057A42]/20 to-transparent"
                          animate={reduced ? {} : { y: ['-100%', '100%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        />
                        <ScanBarcode className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                      </motion.div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Scanning barcode...</p>
                      <motion.div className="mt-3 w-48 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[#057A42] rounded-full"
                          initial={{ width: 0 }} animate={{ width: '100%' }}
                          transition={{ duration: 2.5, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    </div>
                  ) : scanResult ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50"
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                          <Check className="w-6 h-6 text-emerald-500" />
                        </motion.div>
                        <div>
                          <p className="font-bold text-emerald-700 dark:text-emerald-400">Product Detected!</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">{scanResult.name}</p>
                        </div>
                      </motion.div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Original Price', value: `${scanResult.originalPrice.toLocaleString()}đ`, cls: '' },
                          { label: 'AI Price', value: `${scanResult.aiPrice.toLocaleString()}đ`, cls: 'emerald' },
                          { label: 'Discount', value: `${scanResult.discount}%`, cls: 'orange' },
                          { label: 'Expiry', value: '6 hours', cls: '' },
                        ].map((item, i) => (
                          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className={`p-3 rounded-xl ${
                              item.cls === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                              item.cls === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                              'bg-gray-50 dark:bg-slate-700'
                            }`}
                          >
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">{item.label}</p>
                            <p className={`font-bold ${
                              item.cls === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' :
                              item.cls === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-900 dark:text-white'
                            }`}>{item.value}</p>
                          </motion.div>
                        ))}
                      </div>
                      <motion.button onClick={handleAddScanned} whileHover={{ scale: 1.02 }} whileTap={buttonTap}
                        className="w-full bg-gradient-to-r from-[#057A42] to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-[#046034] hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <Check className="w-5 h-5" /> Add to Inventory
                      </motion.button>
                    </motion.div>
                  ) : null}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
