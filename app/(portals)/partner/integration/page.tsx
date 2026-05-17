'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, Key, Copy, Eye, EyeOff, RefreshCw, Webhook,
  CheckCircle, XCircle, AlertCircle, Printer, Database,
  Settings, Code, BookOpen, Clock, ArrowUpRight, Shield,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useGlobal } from '@/app/providers';

interface IntegrationStatus {
  name: string;
  icon: typeof Plug;
  status: 'connected' | 'not-connected' | 'online' | 'offline' | 'synced' | 'not-synced';
  description: string;
}

interface WebhookEvent {
  id: string;
  label: string;
  enabled: boolean;
}

interface ApiLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
}

interface GuideStep {
  title: string;
  description: string;
  code?: string;
}

const integrations: IntegrationStatus[] = [
  { name: 'POS System', icon: Plug, status: 'connected', description: 'Square POS v2.1' },
  { name: 'ERP System', icon: Database, status: 'not-connected', description: 'Not configured' },
  { name: 'Receipt Printer', icon: Printer, status: 'online', description: 'Epson TM-T20III' },
  { name: 'Inventory System', icon: Database, status: 'synced', description: 'Last sync: 2 min ago' },
];

const webhookEvents: WebhookEvent[] = [
  { id: 'order.created', label: 'order.created', enabled: true },
  { id: 'order.updated', label: 'order.updated', enabled: true },
  { id: 'inventory.low', label: 'inventory.low', enabled: false },
  { id: 'product.expired', label: 'product.expired', enabled: true },
];

const apiLogs: ApiLogEntry[] = [
  { id: 'l1', timestamp: '2026-05-16 19:45:12', endpoint: '/api/v1/deals', method: 'GET', status: 200, responseTime: 45 },
  { id: 'l2', timestamp: '2026-05-16 19:44:58', endpoint: '/api/v1/orders', method: 'POST', status: 201, responseTime: 120 },
  { id: 'l3', timestamp: '2026-05-16 19:43:30', endpoint: '/api/v1/inventory', method: 'PUT', status: 200, responseTime: 89 },
  { id: 'l4', timestamp: '2026-05-16 19:42:15', endpoint: '/api/v1/products', method: 'GET', status: 200, responseTime: 32 },
  { id: 'l5', timestamp: '2026-05-16 19:40:02', endpoint: '/api/v1/orders/abc', method: 'PATCH', status: 400, responseTime: 15 },
  { id: 'l6', timestamp: '2026-05-16 19:38:44', endpoint: '/api/v1/webhooks/test', method: 'POST', status: 200, responseTime: 200 },
  { id: 'l7', timestamp: '2026-05-16 19:35:21', endpoint: '/api/v1/analytics', method: 'GET', status: 500, responseTime: 5000 },
  { id: 'l8', timestamp: '2026-05-16 19:30:10', endpoint: '/api/v1/deals/create', method: 'POST', status: 201, responseTime: 156 },
  { id: 'l9', timestamp: '2026-05-16 19:28:55', endpoint: '/api/v1/auth/refresh', method: 'POST', status: 200, responseTime: 28 },
  { id: 'l10', timestamp: '2026-05-16 19:25:00', endpoint: '/api/v1/products/expiring', method: 'GET', status: 200, responseTime: 67 },
];

const posGuide: GuideStep[] = [
  { title: 'Install F.R.E.S.H POS Plugin', description: 'Download and install the plugin from your POS marketplace.', code: 'npm install @fresh-pos/plugin' },
  { title: 'Configure API Credentials', description: 'Add your API key to the POS plugin settings.', code: 'FRESH_API_KEY=your_key_here\nFRESH_ENV=production' },
  { title: 'Map Product Categories', description: 'Map your POS categories to F.R.E.S.H deal categories.', code: '{\n  "bakery": "Bakery",\n  "ready_meals": "Fast Food",\n  "produce": "Vegetables"\n}' },
  { title: 'Enable Auto-Sync', description: 'Turn on automatic deal creation for expiring items.', code: 'auto_sync: true\nthreshold_minutes: 120' },
];

const erpGuide: GuideStep[] = [
  { title: 'Set Up ERP Connector', description: 'Configure the ERP connector with your system endpoint.', code: 'FRESH_ERP_URL=https://your-erp.com/api\nFRESH_ERP_TOKEN=your_token' },
  { title: 'Configure Inventory Sync', description: 'Set sync intervals and field mappings.', code: 'sync_interval: 300\nfields:\n  - sku\n  - quantity\n  - expiry_date' },
  { title: 'Test Connection', description: 'Verify the connection with a test sync.', code: 'curl -X POST https://api.fresh.vn/v1/erp/test \\\n  -H "Authorization: Bearer $FRESH_ERP_TOKEN"' },
];

const printerGuide: GuideStep[] = [
  { title: 'Connect Printer', description: 'Ensure your receipt printer is connected via USB or network.', code: 'ls /dev/usb/lp0  # Check USB connection' },
  { title: 'Install Printer Driver', description: 'Install the ESC/POS driver for your printer model.', code: 'npm install escpos escpos-usb' },
  { title: 'Configure Print Templates', description: 'Set up receipt templates for rescued orders.', code: '{\n  "header": "F.R.E.S.H - Food Rescue",\n  "show_savings": true,\n  "show_impact": true\n}' },
];

export default function IntegrationPage() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://your-server.com/webhooks/fresh');
  const [events, setEvents] = useState<WebhookEvent[]>(webhookEvents);
  const [openGuides, setOpenGuides] = useState<string | null>('pos');
  const [copied, setCopied] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const apiKey = 'sk_fresh_live_a8f3k29d0x7m4p1q6w5e';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const statusConfig = (status: IntegrationStatus['status']) => {
    const positive = ['connected', 'online', 'synced'];
    return {
      isPositive: positive.includes(status),
      label: status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      dotColor: positive.includes(status) ? 'bg-emerald-500' : 'bg-gray-400',
    };
  };

  const statusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (status >= 400 && status < 500) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-700 to-emerald-500 dark:from-emerald-900 dark:to-emerald-700 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Plug className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-xl tracking-wide">API & POS Integration</span>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Integration Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((item, i) => {
              const Icon = item.icon;
              const config = statusConfig(item.status);
              return (
                <motion.div key={item.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                    <span className={`text-xs font-semibold ${config.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400'}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{item.description}</p>
                  {!config.isPositive && (
                    <button className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
                      Configure →
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" /> API Key
          </h2>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
            <Shield className="w-4 h-4 text-gray-400 shrink-0" />
            <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white truncate">
              {showApiKey ? apiKey : apiKey.slice(0, 12) + '••••••••••••••••'}
            </code>
            <button onClick={() => setShowApiKey(!showApiKey)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors relative">
              <Copy className="w-4 h-4" />
              <AnimatePresence>
                {copied && (
                  <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap"
                  >
                    Copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <button className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-600" /> Webhook Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">Webhook URL</label>
              <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2 block">Events</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {events.map(event => (
                  <button key={event.id} onClick={() => toggleEvent(event.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      event.enabled
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-mono text-xs">{event.label}</span>
                    <div className={`w-8 h-5 rounded-full relative transition-colors ${event.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-500'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${event.enabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-sm">
              <Zap className="w-3.5 h-3.5" /> Test Webhook
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Integration Guides
          </h2>
          <div className="space-y-3">
            {[
              { key: 'pos', title: 'POS Integration', icon: Plug, steps: posGuide },
              { key: 'erp', title: 'ERP Integration', icon: Database, steps: erpGuide },
              { key: 'printer', title: 'Printer Setup', icon: Printer, steps: printerGuide },
            ].map(guide => {
              const Icon = guide.icon;
              const isOpen = openGuides === guide.key;
              return (
                <motion.div key={guide.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
                >
                  <button onClick={() => setOpenGuides(isOpen ? null : guide.key)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{guide.title}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 dark:border-slate-700"
                      >
                        <div className="p-5 space-y-5">
                          {guide.steps.map((step, i) => (
                            <div key={i}>
                              <div className="flex items-start gap-3 mb-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{step.title}</h4>
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{step.description}</p>
                                </div>
                              </div>
                              {step.code && (
                                <pre className="ml-9 bg-gray-900 dark:bg-slate-950 text-emerald-400 text-xs font-mono p-3 rounded-xl overflow-x-auto">
                                  <code>{step.code}</code>
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Recent API Activity
            </h2>
            <span className="text-xs text-gray-500 dark:text-slate-400">Last 10 requests</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left py-3 px-5 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Time</th>
                  <th className="text-left py-3 px-5 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Method</th>
                  <th className="text-left py-3 px-5 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Endpoint</th>
                  <th className="text-center py-3 px-5 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Status</th>
                  <th className="text-right py-3 px-5 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Response</th>
                </tr>
              </thead>
              <tbody>
                {apiLogs.map((log, i) => (
                  <tr key={log.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-5 text-xs text-gray-500 dark:text-slate-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        log.method === 'GET' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        log.method === 'POST' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                        log.method === 'PUT' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                        'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-xs font-mono text-gray-700 dark:text-slate-300">{log.endpoint}</td>
                    <td className="py-3 px-5 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right text-xs font-mono text-gray-500 dark:text-slate-400">
                      {log.responseTime >= 1000 ? `${(log.responseTime / 1000).toFixed(1)}s` : `${log.responseTime}ms`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
