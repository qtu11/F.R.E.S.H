'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, Loader2, Server, Key, Shield, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { fadeUp, buttonTap, useSafeReducedMotion } from '@/lib/animation';

type Step = 'credentials' | 'testing' | 'migrating' | 'ready';

export default function SetupPage() {
  const { t } = useGlobal();
  const reduced = useSafeReducedMotion();
  const [step, setStep] = useState<Step>('credentials');
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
    serviceRoleKey: '',
    dbPassword: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    setStep('testing');
    setMessage('Testing Supabase connection...');
    try {
      const res = await fetch('/api/setup/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Connection successful! Saving configuration...');
        await fetch('/api/setup/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setStep('migrating');
        setMessage('Running database migrations and seed...');
        const seedRes = await fetch('/api/setup/seed', { method: 'POST' });
        const seedData = await seedRes.json();
        if (seedData.success) {
          setStep('ready');
          setMessage('Database is fully configured and seeded!');
        } else {
          setMessage(`Migration error: ${seedData.error}`);
          setStep('credentials');
        }
      } else {
        setMessage(`Connection failed: ${data.error || 'Check your credentials'}`);
        setStep('credentials');
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      setStep('credentials');
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('database_setup')}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('connect_supabase')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['credentials', 'testing', 'migrating', 'ready'] as Step[]).map((s, i) => (
            <div key={s} className={`flex items-center gap-1 ${i > 0 ? 'ml-1' : ''}`}>
              {i > 0 && <div className="w-6 h-0.5 bg-gray-200 dark:bg-slate-700" />}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-emerald-500 text-white shadow-sm' :
                ['testing', 'migrating', 'ready'].includes(step) && !['credentials', 'testing', 'migrating'].includes(s) ? 'bg-gray-200 dark:bg-slate-700 text-gray-500' :
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              }`}>{i + 1}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700"
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" /> Supabase Project URL
            </label>
            <input type="url" value={form.supabaseUrl} onChange={e => updateField('supabaseUrl', e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" /> Supabase Anon Key (public)
            </label>
            <input type="text" value={form.supabaseAnonKey} onChange={e => updateField('supabaseAnonKey', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Service Role Key (secret)
            </label>
            <input type="password" value={form.serviceRoleKey} onChange={e => updateField('serviceRoleKey', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" /> Database Password
            </label>
            <input type="password" value={form.dbPassword} onChange={e => updateField('dbPassword', e.target.value)}
              placeholder="Database password from Supabase project settings"
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-5 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 ${
              step === 'ready' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
              step === 'testing' || step === 'migrating' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
              'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {step === 'ready' ? <CheckCircle className="w-5 h-5 shrink-0" /> :
             step === 'testing' || step === 'migrating' ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> :
             <XCircle className="w-5 h-5 shrink-0" />}
            {message}
          </motion.div>
        )}

        <div className="flex gap-3 mt-6">
          <motion.button onClick={handleTest} whileHover={{ scale: 1.01 }} whileTap={buttonTap}
            disabled={!form.supabaseUrl || !form.supabaseAnonKey || step === 'testing' || step === 'migrating'}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
          >
            {(step === 'testing' || step === 'migrating') ? <Loader2 className="w-5 h-5 animate-spin" /> :
             step === 'ready' ? <RefreshCw className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            {step === 'ready' ? t('reconnect') : step === 'testing' ? t('testing') : step === 'migrating' ? t('migrating') : t('connect_and_setup')}
          </motion.button>
          {step === 'ready' && (
            <motion.a href="/admin" whileHover={{ scale: 1.01 }} whileTap={buttonTap}
              className="px-8 bg-white dark:bg-slate-700 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold py-3.5 rounded-xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-600 transition-all"
            >
              {t('go_to_dashboard')} →
            </motion.a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
