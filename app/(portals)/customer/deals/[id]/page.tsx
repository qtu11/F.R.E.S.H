'use client';

import { useState } from 'react';
import { ArrowLeft, Share2, Heart, Clock, Leaf, Info, ShoppingBag, ShieldCheck, Check, Minus, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/app/providers';
import { motion } from 'framer-motion';
import { use } from 'react';
import { showToast } from '@/lib/data/notifications';
import { orderService } from '@/lib/data/orders';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useGlobal();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [favorited, setFavorited] = useState(false);
  const [ordering, setOrdering] = useState(false);

  const handleRescue = async () => {
    if (!user) {
      showToast('error', 'Please login first', 'Login to rescue food items');
      return;
    }
    setOrdering(true);
    await new Promise(r => setTimeout(r, 1000));
    await orderService.create({
      userId: user.id,
      items: [{ productId: id as string, productName: 'Premium Bento Box', productImage: '🍱', quantity, unitPrice: 15000 }],
      storeName: 'WinMart+',
      storeId: 's1',
      subtotal: 15000 * quantity,
      deliveryFee: 5000,
      serviceFee: 2000,
      discount: 0,
      total: 15000 * quantity + 7000,
      deliveryMethod: 'delivery',
      paymentMethod: 'wallet',
    });
    setOrdering(false);
    showToast('success', 'Order Placed!', `${quantity}x Premium Bento Box rescued successfully. Estimated delivery: 20 mins`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300">
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-100 dark:bg-slate-900 transition-colors overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-orange-500/10 to-blue-500/20 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-12 left-4 z-20">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white shadow-lg">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </div>
        <div className="absolute top-12 right-4 z-20 flex gap-3">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white shadow-lg">
            <Share2 className="w-6 h-6" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFavorited(!favorited); showToast(favorited ? 'info' : 'success', favorited ? 'Removed from favorites' : 'Added to favorites'); }} className={`w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center shadow-lg transition-colors ${favorited ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
            <Heart className={`w-6 h-6 ${favorited ? 'fill-red-500' : ''} transition-all`} />
          </motion.button>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity }} className="text-9xl opacity-30">🍱</motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t('ends_in')} 45m
                </motion.span>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="bg-emerald-100 dark:bg-emerald-900/40 text-[#057A42] dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                  <Leaf className="w-3 h-3" /> ESG Verified
                </motion.span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Premium Bento Box</h1>
              <p className="text-gray-400 dark:text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> WinMart+ &bull; District 1, HCMC
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="text-gray-400 line-through text-sm font-bold decoration-orange-500/50 decoration-2">45,000 đ</div>
              <div className="text-4xl font-black text-gray-900 dark:text-white">{15000 * quantity} đ</div>
              <div className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full mt-2">65% {t('off')}</div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Quantity</span>
            <div className="flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center disabled:opacity-30 transition-all hover:bg-gray-100">
                <Minus className="w-4 h-4 text-gray-600 dark:text-slate-300" />
              </motion.button>
              <span className="w-10 text-center font-black text-xl text-gray-900 dark:text-white">{quantity}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.min(10, quantity + 1))} disabled={quantity >= 10} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center disabled:opacity-30 transition-all hover:bg-gray-100">
                <Plus className="w-4 h-4 text-gray-600 dark:text-slate-300" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-gray-100 dark:border-slate-800 py-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Freshness Timeline
              </h3>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 1 }} className="bg-emerald-500 h-full" />
                <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} transition={{ duration: 1, delay: 0.2 }} className="bg-orange-500 h-full" />
                <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 1, delay: 0.4 }} className="bg-red-500 h-full" />
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Best consumed within <span className="text-orange-500">2 hours</span> for peak quality.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Leaf className="w-4 h-4" /> ESG Impact
              </h3>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-[#057A42] text-white rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#057A42] dark:text-emerald-400">{0.8 * quantity}kg CO2 Saved</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Equivalent to {Math.round(2.5 * quantity)}km driving</div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" /> AI Nutrition Insight
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Calories', val: '450', unit: 'kcal', color: 'bg-orange-50 dark:bg-orange-900/30' },
                { label: 'Protein', val: '18', unit: 'g', color: 'bg-blue-50 dark:bg-blue-900/30' },
                { label: 'Carbon', val: '52', unit: 'g', color: 'bg-emerald-50 dark:bg-emerald-900/30' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className={`${stat.color} p-4 rounded-2xl text-center border border-gray-100 dark:border-slate-700`}>
                  <div className="text-gray-400 dark:text-slate-500 text-[9px] font-black uppercase mb-1">{stat.label}</div>
                  <div className="text-lg font-black text-gray-900 dark:text-white">{stat.val}<span className="text-[10px] ml-0.5 opacity-50">{stat.unit}</span></div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
              Our AI vision system has analyzed this bento. It contains high protein and moderate carbs, ideal for a post-work meal. All ingredients are fresh from WinMart local supply chain.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-8 inset-x-0 px-6 z-50">
        <div className="max-w-4xl mx-auto flex gap-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRescue} disabled={ordering} className="flex-1 bg-gradient-to-r from-[#ff8c00] to-orange-500 hover:from-[#e67e22] hover:to-orange-600 disabled:opacity-60 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm">
            {ordering ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
            {ordering ? 'Ordering...' : `Rescue Now - ${15000 * quantity}đ`}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-20 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] flex items-center justify-center shadow-xl transition-colors">
            <ShieldCheck className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
