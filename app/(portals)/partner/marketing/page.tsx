'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Zap, Gift, Bell, Percent, Calendar, Users, Trash2, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { campaignService, Campaign as ApiCampaign } from '@/lib/data/campaigns';
import { showToast } from '@/lib/data/notifications';

interface Voucher {
  code: string;
  discount: number;
  minOrder: number;
  expires: string;
  uses: number;
  maxUses: number;
  active: boolean;
}

interface FlashSale {
  id: string;
  name: string;
  discount: string;
  start: string;
  end: string;
  status: 'upcoming' | 'active' | 'ended';
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
}



function mapToVoucher(c: ApiCampaign): Voucher {
  return {
    code: c.title?.toUpperCase().replace(/\s+/g, '_').slice(0, 10) || `CAMP${c.id}`,
    discount: c.discountRate || 10,
    minOrder: c.budget ? Math.round(c.budget * 0.1) : 50000,
    expires: c.endDate || '2026-06-30',
    uses: c.actualConversions || 0,
    maxUses: c.targetConversions || 100,
    active: c.status === 'active',
  };
}

function mapToFlashSale(c: ApiCampaign): FlashSale {
  return {
    id: c.id,
    name: c.title,
    discount: c.description || `${c.discountRate || 0}% off`,
    start: c.startDate || '',
    end: c.endDate || '',
    status: c.status === 'active' ? 'active' : c.status === 'upcoming' ? 'upcoming' : 'ended',
  };
}

function mapToCampaign(c: ApiCampaign): Campaign {
  return {
    id: c.id,
    name: c.title,
    type: c.type,
    status: c.status === 'active' ? 'active' : 'inactive',
  };
}

export default function PartnerMarketingPage() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoucherForm, setShowVoucherForm] = useState(false);

  const [voucherForm, setVoucherForm] = useState({ discount: 10, minOrder: 50000, expires: '', maxUses: 100 });

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'nearby' | 'premium'>('all');

  const storeId = user?.storeId || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    campaignService.getByStore(storeId).then(data => {
      const all = data || [];
      const typed = all as any[];
      setVouchers(typed.filter((c: any) => c.type === 'voucher' || c.discountRate != null).slice(0, 6).map(mapToVoucher));
      setFlashSales(typed.filter((c: any) => c.type === 'flash_sale' || (c.startDate && c.endDate)).slice(0, 4).map(mapToFlashSale));
      setCampaigns(typed.filter((c: any) => c.type === 'loyalty' || c.type === 'referral').slice(0, 4).map(mapToCampaign));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [storeId]);

  const handleCreateVoucher = () => {
    const code = `PROMO${Date.now().toString(36).toUpperCase()}`;
    const newV: Voucher = {
      code,
      discount: voucherForm.discount,
      minOrder: voucherForm.minOrder,
      expires: voucherForm.expires || '2026-06-30',
      uses: 0,
      maxUses: voucherForm.maxUses,
      active: true,
    };
    setVouchers(prev => [newV, ...prev]);
    setShowVoucherForm(false);
  };

  const toggleVoucher = (code: string) => {
    setVouchers(prev => prev.map(v => v.code === code ? { ...v, active: !v.active } : v));
  };

  const toggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  };

  const handleSendNotification = () => {
    if (!notifTitle || !notifMessage) return;
    // TODO: replace with real API call to send push notification
    showToast('success', 'Notification Sent', `To: ${notifTarget} - ${notifTitle}`);
    setNotifTitle('');
    setNotifMessage('');
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-gray-900 dark:text-white text-sm font-medium">Loading marketing campaigns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-6 md:p-8 mb-6 shadow-lg"
      >
        <h1 className="text-white text-2xl md:text-3xl font-bold">{t('marketing_crm')}</h1>
        <p className="text-emerald-100 text-sm mt-1">{t('marketing_subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">{t('vouchers')}</h3>
            </div>
            <button
              onClick={() => setShowVoucherForm(!showVoucherForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('create_voucher')}
            </button>
          </div>

          {showVoucherForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">{t('discount')} (%)</label>
                  <input type="number" value={voucherForm.discount} onChange={e => setVoucherForm(p => ({ ...p, discount: +e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">{t('min_order')} (VNĐ)</label>
                  <input type="number" value={voucherForm.minOrder} onChange={e => setVoucherForm(p => ({ ...p, minOrder: +e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">{t('expiry_date')}</label>
                  <input type="date" value={voucherForm.expires} onChange={e => setVoucherForm(p => ({ ...p, expires: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">{t('usage_limit')}</label>
                  <input type="number" value={voucherForm.maxUses} onChange={e => setVoucherForm(p => ({ ...p, maxUses: +e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <button onClick={handleCreateVoucher} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
                {t('create')}
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium uppercase tracking-wider text-xs">{t('code')}</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium uppercase tracking-wider text-xs">{t('discount')}</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium uppercase tracking-wider text-xs">{t('uses')}</th>
                  <th className="text-center py-2 px-2 text-gray-500 font-medium uppercase tracking-wider text-xs">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v.code} className="border-b border-gray-50">
                    <td className="py-2.5 px-2 font-mono text-xs font-bold text-gray-900">{v.code}</td>
                    <td className="py-2.5 px-2 text-right text-gray-700">{v.discount}%</td>
                    <td className="py-2.5 px-2 text-right text-gray-700">{v.uses}/{v.maxUses}</td>
                    <td className="py-2.5 px-2 text-center">
                      <button onClick={() => toggleVoucher(v.code)} className={`text-xs px-2.5 py-1 rounded-full font-medium ${v.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{v.active ? 'Active' : 'Inactive'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">{t('flash_sales')}</h3>
          </div>
          <div className="space-y-3">
            {flashSales.map(sale => (
              <div key={sale.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{sale.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sale.status === 'active' ? 'bg-green-100 text-green-700' : sale.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{sale.status}</span>
                </div>
                <p className="text-xs text-gray-500">{sale.discount}</p>
                <p className="text-xs text-gray-400 mt-1">{sale.start} - {sale.end}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">{t('loyalty_campaigns')}</h3>
          </div>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                  <span className="ml-2 text-xs text-gray-400 uppercase">{c.type}</span>
                </div>
                <button onClick={() => toggleCampaign(c.id)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">{t('push_notifications')}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">{t('title')}</label>
              <input type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder={t('notification_title_placeholder')} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">{t('message')}</label>
              <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} placeholder={t('notification_message_placeholder')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">{t('send_to')}</label>
              <div className="flex gap-2 mt-1">
                {(['all', 'nearby', 'premium'] as const).map(target => (
                  <button key={target} onClick={() => setNotifTarget(target)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${notifTarget === target ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Users className="w-3.5 h-3.5" />
                    {target.charAt(0).toUpperCase() + target.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSendNotification} disabled={!notifTitle || !notifMessage} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              {t('send_notification')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
