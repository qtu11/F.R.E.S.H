'use client';

import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2, ShoppingBag, Store, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';
import { useGlobal } from '@/app/providers';

export default function TermsOfService() {
  const { t } = useGlobal();
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden px-4 py-16 transition-colors duration-300">
      <DynamicBackground />

      <Link 
        href="/" 
        className="fixed top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 hover:-translate-x-1 duration-200 z-50 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('terms_back_btn')}
      </Link>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-6 shadow-2xl transition-colors"
          >
            <Scale className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            {t('terms_title')}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase"
          >
            {t('terms_subtitle')}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-10 text-gray-700 dark:text-slate-300"
        >
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Leaf className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
              {t('terms_s1_title')}
            </h2>
            <p className="leading-relaxed text-sm md:text-base font-medium" dangerouslySetInnerHTML={{ __html: t('terms_s1_desc') }} />
          </section>

          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              {t('terms_s2_title')}
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>{t('terms_s2_intro')}</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s2_item1') }} />
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s2_item2') }} />
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s2_item3') }} />
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s2_item4') }} />
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Store className="w-6 h-6 text-blue-500" />
              {t('terms_s3_title')}
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>{t('terms_s3_intro')}</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s3_item1') }} />
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s3_item2') }} />
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s3_item3') }} />
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span dangerouslySetInnerHTML={{ __html: t('terms_s3_item4') }} />
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              {t('terms_s4_title')}
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t('terms_s4_desc')}
            </p>
          </section>

          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              {t('terms_s5_title')}
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t('terms_s5_desc')}
            </p>
          </section>
        </motion.div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
          <span>&copy; 2026 F.R.E.S.H Platform. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{t('terms_footer_privacy')}</Link>
            <Link href="/customer/login" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{t('terms_footer_login')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
