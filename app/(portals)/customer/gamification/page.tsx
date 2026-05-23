'use client';

import { useState, useEffect } from 'react';
import { Award, Leaf, Star, Flame, Target, Lock, Trophy, ArrowUpCircle, Gem, Shield, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { gamificationService } from '@/lib/data/gamification';
import {
  staggerContainer, staggerItem, fadeUp, scaleIn, slideUp,
  cardHover, cardTap, buttonTap, useSafeReducedMotion,
} from '@/lib/animation';

type GreenTier = 'dong' | 'bac' | 'vang' | 'kimcuong';

interface TierInfo {
  key: GreenTier;
  name: string;
  nameEn: string;
  icon: typeof Circle;
  color: string;
  bgColor: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  benefitsEn: string[];
}

const tiers: TierInfo[] = [
  {
    key: 'dong', name: 'Đồng', nameEn: 'Bronze',
    icon: Circle, color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    minPoints: 0, maxPoints: 999,
    benefits: ['Mua đồ giải cứu', 'Tích điểm xanh', 'Xem deal cơ bản'],
    benefitsEn: ['Buy rescued items', 'Earn green points', 'View basic deals'],
  },
  {
    key: 'bac', name: 'Bạc', nameEn: 'Silver',
    icon: Shield, color: 'text-gray-500 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-gray-700/50',
    minPoints: 1000, maxPoints: 4999,
    benefits: ['Ưu tiên deal hot', 'Giảm giá 5% thêm', 'Huy hiệu Bạc'],
    benefitsEn: ['Priority hot deals', 'Extra 5% discount', 'Silver badge'],
  },
  {
    key: 'vang', name: 'Vàng', nameEn: 'Gold',
    icon: Award, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    minPoints: 5000, maxPoints: 14999,
    benefits: ['Giảm giá 10% thêm', 'Voucher độc quyền', 'Hỗ trợ ưu tiên'],
    benefitsEn: ['Extra 10% discount', 'Exclusive vouchers', 'Priority support'],
  },
  {
    key: 'kimcuong', name: 'Kim Cương', nameEn: 'Diamond',
    icon: Gem, color: 'text-cyan-500 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    minPoints: 15000, maxPoints: Infinity,
    benefits: ['Giảm giá 15% thêm', 'Truy cập sớm deal', 'Green Ambassador', 'Quà tặng ESG'],
    benefitsEn: ['Extra 15% discount', 'Early deal access', 'Green Ambassador', 'ESG gifts'],
  },
];

function getCurrentTier(points: number): TierInfo {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].minPoints) return tiers[i];
  }
  return tiers[0];
}



export default function CustomerGamification() {
  const { t, lang } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'missions' | 'badges' | 'leaderboard'>('missions');
  const reduced = useSafeReducedMotion();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const uid = user?.id || '';
    gamificationService.getAll(uid).then(result => {
      setData({
        streak: result?.streak ?? 7,
        streakUnit: result?.streakUnit || 'day',
        userPoints: result?.userPoints || 2450,
        badges: (result?.badges || []).map((b: any) => ({
          name: b.badge?.name || b.name || 'Badge',
          icon: b.badge?.icon || b.icon || '🛡️',
          desc: b.badge?.description || b.description || '',
          unlocked: !!b.earnedAt || !!b.unlocked,
        })),
        leaderboard: result?.leaderboard || [],
        missions: (result?.missions || []).map((um: any) => ({
          name: um.mission?.title || um.title || 'Mission',
          current: um.progress ?? um.current ?? 0,
          target: um.mission?.requirementValue || um.requirementValue || um.target || 1,
          unit: um.mission?.type || um.type || 'items',
          icon: um.mission?.icon || um.icon || '🎯',
          color: 'bg-emerald-500',
        })),
        pointsHistory: (result?.pointsHistory || result?.points || []).map((p: any) => ({
          action: p.description || p.source || 'Activity',
          points: p.points > 0 ? `+${p.points}` : `${p.points}`,
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently',
        })),
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  const userPoints = data?.userPoints ?? 2450;
  const currentTier = getCurrentTier(userPoints);
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const tierProgress = nextTier
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const tabConfig = [
    { key: 'missions' as const, label: t('missions'), icon: Target },
    { key: 'badges' as const, label: t('badges'), icon: Award },
    { key: 'leaderboard' as const, label: t('leaderboard'), icon: Trophy },
  ];

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
        className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 pt-12 pb-20 px-4 md:rounded-b-[40px] shadow-lg transition-colors relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-white/80 text-xs font-bold tracking-wider uppercase">{t('green_profile')}</span>
          </motion.div>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-5xl md:text-7xl font-black text-white">
                {mounted && (
                  <motion.span initial={reduced ? {} : { opacity: 0, scale: 0.5 }} animate={reduced ? {} : { opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100, damping: 12 }}>
                    {userPoints.toLocaleString()}
                  </motion.span>
                )}
              </div>
              <div className="text-white/70 font-bold text-sm tracking-wider">{t('green_points')}</div>
            </div>
            <motion.div initial={reduced ? {} : { scale: 0 }} animate={reduced ? {} : { scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.3 }}
              className="mb-2 ml-auto bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2"
            >
              <motion.div animate={reduced ? {} : { rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.5 }}>
                <Flame className="w-5 h-5 text-yellow-300" />
              </motion.div>
              <span className="text-white font-bold text-sm">{data?.streak || 7}-{data?.streakUnit || 'day'} streak!</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10 space-y-6">
        {!mounted || loading ? null : (
          <>
            <motion.div variants={slideUp} initial="hidden" animate="visible"
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Gem className="w-4 h-4 text-cyan-500" /> {t('green_credit')}
                </h3>
                <motion.div initial={reduced ? {} : { scale: 0 }} animate={reduced ? {} : { scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className={`px-3 py-1 rounded-full text-xs font-black ${currentTier.bgColor} ${currentTier.color}`}
                >
                  {lang === 'vi' ? currentTier.name : currentTier.nameEn}
                </motion.div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <motion.div initial={reduced ? {} : { rotate: -20, scale: 0 }} animate={reduced ? {} : { rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                  className={`w-16 h-16 rounded-2xl ${currentTier.bgColor} flex items-center justify-center`}
                >
                  <currentTier.icon className={`w-8 h-8 ${currentTier.color}`} />
                </motion.div>
                <div className="flex-1">
                  <div className="text-lg font-black text-gray-900 dark:text-white">
                    {lang === 'vi' ? currentTier.name : currentTier.nameEn}
                  </div>
                  {nextTier && (
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {t('progress')} {userPoints.toLocaleString()} / {nextTier.minPoints.toLocaleString()} {t('points')}
                    </div>
                  )}
                </div>
              </div>

              {nextTier && (
                <div className="mb-4">
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        currentTier.key === 'dong' ? 'from-amber-400 to-amber-600' :
                        currentTier.key === 'bac' ? 'from-gray-300 to-gray-500' :
                        currentTier.key === 'vang' ? 'from-yellow-300 to-yellow-500' :
                        'from-cyan-300 to-cyan-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{Math.round(tierProgress)}%</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">
                      → {lang === 'vi' ? nextTier.name : nextTier.nameEn}
                    </span>
                  </div>
                </div>
              )}

              <motion.div variants={staggerContainer} initial="hidden" animate="visible"
                className="grid grid-cols-2 gap-2 mb-4"
              >
                {(lang === 'vi' ? currentTier.benefits : currentTier.benefitsEn).map((b, i) => (
                  <motion.div key={i} variants={staggerItem}
                    className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium">{b}</span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">{t('view_all')} {t('green_credit')} {t('categories')}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {tiers.map((tier) => {
                    const isCurrent = tier.key === currentTier.key;
                    const isUnlocked = userPoints >= tier.minPoints;
                    const TierIcon = tier.icon;
                    return (
                      <motion.div key={tier.key} whileHover={reduced ? {} : { y: -2 }} whileTap={reduced ? {} : { scale: 0.95 }}
                        className={`text-center p-2 rounded-xl border transition-all ${
                          isCurrent ? `${tier.bgColor} ${tier.color} border-current scale-105 shadow-md` :
                          isUnlocked ? 'bg-gray-50 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600' :
                          'bg-gray-50 dark:bg-slate-700/20 border-gray-100 dark:border-slate-700 opacity-50'
                        }`}
                      >
                        <TierIcon className={`w-5 h-5 mx-auto mb-1 ${tier.color}`} />
                        <div className="text-[9px] font-bold text-gray-700 dark:text-slate-300">
                          {lang === 'vi' ? tier.name : tier.nameEn}
                        </div>
                        <div className="text-[8px] text-gray-400 dark:text-slate-500">
                          {tier.minPoints === 0 ? '0+' : `${(tier.minPoints / 1000).toFixed(0)}k+`}
                        </div>
                        {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mt-1 animate-pulse" />}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {tabConfig.map(tab => (
                <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)} whileTap={buttonTap}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#057A42] text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === 'missions' && (
                <motion.div key="missions" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" /> {t('missions')}
                  </h3>
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                    {(data?.missions || []).map((mission: any) => {
                      const progress = Math.min(mission.current / mission.target, 1);
                      return (
                        <motion.div key={mission.name} variants={staggerItem}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{mission.icon}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{mission.name}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{mission.current}/{mission.target} {mission.unit}</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full rounded-full ${mission.color} relative`}
                            >
                              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'badges' && (
                <motion.div key="badges" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" /> {t('badges')}
                  </h3>
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible"
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {(data?.badges || []).map((badge: any) => (
                      <motion.div key={badge.name} variants={staggerItem} whileHover={reduced ? {} : { y: -4, scale: 1.02 }}
                        className={`p-4 rounded-2xl text-center border transition-all ${
                          badge.unlocked
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 opacity-60'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.unlocked ? badge.icon : <Lock className="w-7 h-7 mx-auto text-gray-300 dark:text-slate-600" />}</div>
                        <div className={`text-xs font-bold mb-1 ${badge.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{badge.name}</div>
                        <div className={`text-[9px] font-medium ${badge.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>{badge.desc}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div key="leaderboard" variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> {t('leaderboard')}
                  </h3>
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                    {(data?.leaderboard || []).map((entry: any) => (
                      <motion.div key={entry.rank} variants={staggerItem} layout whileHover={reduced ? {} : { x: 4 }}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${entry.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${entry.rank <= 3 ? entry.color : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                          #{entry.rank}
                        </div>
                        <div className={`w-10 h-10 rounded-full ${entry.color} flex items-center justify-center text-sm font-bold`}>
                          {entry.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{entry.name}</div>
                          <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{entry.points.toLocaleString()} pts</div>
                        </div>
                        {entry.rank === 1 && <Award className="w-5 h-5 text-yellow-500" />}
                        {entry.rank === 2 && <Award className="w-5 h-5 text-gray-400" />}
                        {entry.rank === 3 && <Award className="w-5 h-5 text-orange-500" />}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" /> {t('points_history')}
              </h3>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                {(data?.pointsHistory || []).map((entry: any, i: number) => (
                  <motion.div key={i} variants={staggerItem}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{entry.action}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500">{entry.date}</div>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{entry.points}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> {t('daily_streak')}
              </h3>
              <div className="flex gap-1.5 justify-between">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const streakVal = data?.streak ?? 7;
                  const active = i < streakVal;
                  const isToday = i === new Date().getDay() - 1;
                  return (
                    <motion.div key={day} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <motion.div whileHover={reduced ? {} : { scale: 1.15 }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                          active ? 'bg-[#057A42] text-white shadow-md shadow-[#057A42]/30' : isToday ? 'bg-[#057A42]/40 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                        }`}
                      >
                        {active ? (i === 0 ? '🔥' : '✓') : isToday ? '🔥' : <Lock className="w-4 h-4" />}
                      </motion.div>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500">{day}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
