'use client';

import { useState, useEffect } from 'react';
import { MapPin, Ticket, Clock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { productService, Product } from '@/lib/data/products';
import { orderService } from '@/lib/data/orders';
import { showToast } from '@/lib/data/notifications';
import {
  staggerContainer, staggerItem, fadeUp, scaleIn, slideUp,
  cardHover, cardTap, buttonTap, useSafeReducedMotion,
} from '@/lib/animation';

export default function CustomerApp() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<Product[]>([]);
  const [foodRescued] = useState(12.5);
  const [greenCredit] = useState(1250);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const reduced = useSafeReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    productService.getLive().then(products => {
      setDeals(products);
      setLoading(false);
    });
  }, []);

  const handleRedeemVouchers = () => {
    router.push('/customer/vouchers');
  };

  const handleRescueNow = async (product: Product) => {
    if (!user) {
      showToast('error', 'Please login first');
      return;
    }
    try {
      await orderService.create({
        userId: user.id,
        items: [{ productId: product.id, productName: product.name, productImage: product.image, quantity: 1, unitPrice: product.aiPrice }],
        storeName: product.storeName,
        storeId: product.storeId,
        subtotal: product.aiPrice,
        deliveryFee: 5000,
        serviceFee: 2000,
        discount: 0,
        total: product.aiPrice + 7000,
        deliveryMethod: 'delivery',
        paymentMethod: 'wallet',
        address: user.address || '123 Nguyen Hue, D1, HCMC',
      });
      await productService.update(product.id, { stock: product.stock - 1 });
      showToast('success', 'Order Placed!', `${product.name} rescued successfully.`);
      setDeals(prev => prev.map(d => d.id === product.id ? { ...d, stock: d.stock - 1 } : d));
    } catch {
      showToast('error', 'Failed to place order');
    }
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
        className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 pt-12 pb-24 px-4 shadow-lg md:rounded-b-[40px] transition-colors duration-300"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <motion.div initial={reduced ? {} : { scale: 0, rotate: -180 }} animate={reduced ? {} : { scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.1 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-1 transition-colors shadow-md">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400">{user?.avatar || 'U'}</div>
              </div>
              <motion.div initial={reduced ? {} : { scale: 0 }} animate={reduced ? {} : { scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 10, delay: 0.3 }}
                className="absolute -bottom-1 -right-1 bg-yellow-400 w-5 h-5 rounded-full border-2 border-[#057A42] dark:border-emerald-900 flex items-center justify-center"
              >
                <span className="text-[10px]">⭐</span>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="text-white/80 dark:text-emerald-200/80 text-xs font-semibold tracking-wider">{t('green_profile')}</div>
              <div className="text-white font-bold text-lg leading-tight uppercase tracking-wide">{user?.name || t('waste_warrior_profile')}</div>
              <motion.div initial={reduced ? {} : { width: 0 }} animate={reduced ? {} : { width: 'auto' }} transition={{ delay: 0.4, duration: 0.3 }}
                className="bg-yellow-500 dark:bg-yellow-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 overflow-hidden whitespace-nowrap"
              >
                {t('gold_member')}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <motion.div variants={slideUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
          className="px-4 -mt-16 relative z-10"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-green-100/50 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
            <div className="flex justify-between w-full md:w-1/2">
              <motion.div initial={reduced ? {} : { y: 20, opacity: 0 }} animate={reduced ? {} : { y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('food_rescued')}</div>
                <div className="text-black dark:text-white font-black text-xl md:text-3xl">{foodRescued} kg</div>
              </motion.div>
              <motion.div initial={reduced ? {} : { y: 20, opacity: 0 }} animate={reduced ? {} : { y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-right md:text-left"
              >
                <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('green_credit')}</div>
                <div className="text-black dark:text-white font-black text-xl md:text-3xl">{greenCredit.toLocaleString()}</div>
              </motion.div>
            </div>
            <motion.button onClick={handleRedeemVouchers} whileHover={reduced ? {} : { scale: 1.02 }} whileTap={buttonTap}
              className="w-full md:w-auto px-8 bg-[#c8e6c9] dark:bg-emerald-900/50 text-[#057A42] dark:text-emerald-400 font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#a5d6a7] dark:hover:bg-emerald-800/50 transition-colors text-sm border border-transparent dark:border-emerald-800 shadow-sm"
            >
              <Ticket className="w-4 h-4" />{t('redeem_vouchers')}
            </motion.button>
          </div>
        </motion.div>

        <div className="px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
            <motion.h2 variants={fadeUp} className="text-black dark:text-white font-extrabold text-sm mb-3">{t('flash_deals_map')}</motion.h2>
            <motion.div variants={scaleIn}
              className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-700 relative h-[250px] md:h-[400px] overflow-hidden transition-colors"
            >
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.42416741972!2d106.698399315334!3d10.7788489923192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768ddb!2sDistrict%201%2C%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2svn!4v1684305710631!5m2!1sen!2svn" className="absolute inset-0 w-full h-full opacity-80 dark:opacity-60 dark:invert-[.9] dark:hue-rotate-180" style={{ filter: 'contrast(1.1) saturate(1.2)' }} allowFullScreen={false} loading="lazy" />
              <motion.div initial={reduced ? {} : { scale: 0 }} whileInView={reduced ? {} : { scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="absolute top-1/4 left-1/4 flex flex-col items-center"
              >
                <div className="bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-md text-[10px] font-bold text-gray-800 dark:text-gray-200 mb-1">WINMART+</div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-lg relative">
                  <div className="w-2 h-2 bg-white dark:bg-slate-200 rounded-full"></div>
                  <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500"></div>
                </div>
              </motion.div>
              <motion.div initial={reduced ? {} : { scale: 0 }} whileInView={reduced ? {} : { scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                className="absolute top-1/3 right-1/4 flex flex-col items-center"
              >
                <div className="bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-md text-[10px] font-bold text-gray-800 dark:text-gray-200 mb-1">CIRCLE K</div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-lg relative">
                  <div className="w-2 h-2 bg-white dark:bg-slate-200 rounded-full"></div>
                  <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500"></div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
            <motion.h2 variants={fadeUp} className="text-black dark:text-white font-extrabold text-sm mb-3 md:mt-0 mt-6">{t('deals_near_you')}</motion.h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100 dark:border-slate-700"
                  >
                    <motion.div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gray-200 dark:bg-slate-700"
                      animate={reduced ? {} : { backgroundPosition: ['200% 0', '-200% 0'] }}
                      transition={reduced ? {} : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      style={reduced ? {} : { background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
                    />
                    <div className="flex-1 space-y-3 py-2">
                      <motion.div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"
                        animate={reduced ? {} : { backgroundPosition: ['200% 0', '-200% 0'] }}
                        transition={reduced ? {} : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        style={reduced ? {} : { background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
                      />
                      <motion.div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/2"
                        animate={reduced ? {} : { backgroundPosition: ['200% 0', '-200% 0'] }}
                        transition={reduced ? {} : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        style={reduced ? {} : { background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : deals.length === 0 ? (
              <motion.div variants={scaleIn} className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-slate-400 font-bold">No deals available right now</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal, i) => (
                  <motion.div key={deal.id} variants={staggerItem}
                    whileHover={reduced ? {} : { scale: 1.01, x: 4 }} whileTap={reduced ? {} : { scale: 0.99 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md cursor-pointer group"
                  >
                    <Link href={`/customer/deals/${deal.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-700 text-5xl">
                      {deal.image}
                    </Link>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <Link href={`/customer/deals/${deal.id}`}>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{deal.name}</h3>
                        </Link>
                        <motion.span initial={reduced ? {} : { x: 10, opacity: 0 }} animate={reduced ? {} : { x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                          className="bg-[#ff8c00] text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded"
                        >
                          {deal.discount}% {t('off')}
                        </motion.span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-semibold border border-gray-200 dark:border-slate-600 w-fit px-2 py-0.5 rounded-md mt-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="text-[#d97706] dark:text-[#f59e0b]">{deal.storeName}</span>
                      </div>
                      <div className="text-right mt-2 flex items-center justify-between">
                        <motion.button onClick={() => handleRescueNow(deal)} disabled={deal.stock <= 0} whileHover={reduced ? {} : { scale: 1.05 }} whileTap={buttonTap}
                          className="text-[10px] bg-gradient-to-r from-[#057A42] to-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-[#046034] hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          {deal.stock <= 0 ? 'Sold Out' : 'Rescue Now'}
                        </motion.button>
                        <div>
                          <span className="text-gray-400 dark:text-slate-500 line-through text-xs mr-2">{deal.originalPrice.toLocaleString()}đ</span>
                          <span className="text-black dark:text-white font-black text-lg">{deal.aiPrice.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
