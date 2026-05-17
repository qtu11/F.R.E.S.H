'use client';

import { motion } from 'framer-motion';

interface TabsProps {
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-[#057A42] text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-[#057A42] dark:text-emerald-400'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-[10px] text-gray-400 dark:text-slate-500">({tab.count})</span>
            )}
            {activeTab === tab.key && (
              <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#057A42] dark:bg-emerald-400 rounded-full" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === tab.key
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#057A42]/10 text-[#057A42] dark:text-emerald-400' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-400'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
