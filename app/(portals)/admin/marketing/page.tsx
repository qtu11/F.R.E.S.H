'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Image as ImageIcon, Plus, Send, Users, TrendingUp, BarChart3, Calendar, Clock, Percent, MousePointerClick, Gift, Bell, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { campaignService, Campaign } from '@/lib/data/campaigns';

const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatNum = (n: number) => n.toLocaleString();

export default function AdminMarketing() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('Flash Sale');
  const [campaignBudget, setCampaignBudget] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifSegment, setNotifSegment] = useState('All Users');
  const [notifLog, setNotifLog] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    Promise.all([
      campaignService.getAll(),
      campaignService.getBanners(),
    ]).then(([campaignData, bannerData]) => {
      if (Array.isArray(campaignData)) setCampaigns(campaignData);
      if (Array.isArray(bannerData)) setBanners(bannerData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) return;
    setShowForm(false);
    setCampaignName('');
    setCampaignType('Flash Sale');
    setCampaignBudget('');
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim()) return;
    const newNotif = {
      id: `N${Date.now()}`,
      title: notifTitle,
      segments: notifSegment,
      sentAt: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16),
    };
    setNotifLog(prev => [newNotif, ...prev]);
    setNotifTitle('');
  };

  const totalReferrals = campaigns.reduce((s, c) => s + (c.actualConversions || 0), 0) || 0;
  const referralConversion = campaigns.length && totalReferrals ? Math.round((totalReferrals / campaigns.reduce((s, c) => s + (c.actualImpressions || 1), 0)) * 100 * 10) / 10 : null;
  const rewardsDistributed = campaigns.reduce((s, c) => s + (c.spent || 0), 0) || 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Retrieving marketing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Megaphone className="w-6 h-6" /> Marketing Center
          </h1>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> {activeCampaigns} Active Campaigns
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-5 text-purple-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Referrals</span>
            </div>
            <div className="text-2xl font-black text-purple-600">{formatNum(totalReferrals)}</div>
            <div className="text-[10px] text-purple-500 font-bold mt-1">All time</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-5 text-blue-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Conversion Rate</span>
            </div>
            <div className="text-2xl font-black text-blue-600">{referralConversion !== null ? `${referralConversion}%` : '—'}</div>
            <div className="text-[10px] text-blue-500 font-bold mt-1">Referral to order</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-5 text-emerald-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rewards Distributed</span>
            </div>
            <div className="text-2xl font-black text-emerald-600">{formatVND(rewardsDistributed)}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">Total value</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <MousePointerClick className="w-4 h-5 text-orange-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Active Campaigns</span>
            </div>
            <div className="text-2xl font-black text-orange-600">{activeCampaigns}</div>
            <div className="text-[10px] text-orange-500 font-bold mt-1">Running now</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
              <ImageIcon className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Banner Management
            </h3>
            <button className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Banner
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map(banner => (
              <div key={banner.id} className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                  {banner.image ? (
                    <span className="text-xs text-gray-400">Image</span>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400 dark:text-slate-600" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{banner.title}</h4>
                    <span className={`text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${banner.active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                    <Calendar className="w-3 h-3" /> Priority: {banner.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Active Campaigns
            </h3>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Create Campaign
            </button>
          </div>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-5 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">New Campaign</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Campaign Name" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <select value={campaignType} onChange={e => setCampaignType(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500">
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Referral">Referral</option>
                </select>
                <input type="text" value={campaignBudget} onChange={e => setCampaignBudget(e.target.value)} placeholder="Budget (VND)" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <select className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500">
                  <option value="">All Users</option>
                  <option value="">Active Customers</option>
                  <option value="">New Users</option>
                </select>
              </div>
              <button onClick={handleCreateCampaign} className="px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition-all">Create Campaign</button>
            </motion.div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Spent</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Impressions</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Conversions</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {campaigns.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-sm text-gray-900 dark:text-white">{c.title}</td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full border text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">{c.type}</span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-800 dark:text-slate-200">{formatVND(c.budget)}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-800 dark:text-slate-200">{formatVND(c.spent)}</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600 dark:text-slate-400">{formatNum(c.actualImpressions || 0)}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-800 dark:text-slate-200">{formatNum(c.actualConversions || 0)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${c.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <Bell className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Push Notification Dashboard
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title..." className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500" />
            <select value={notifSegment} onChange={e => setNotifSegment(e.target.value)} className="px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="All Users">All Users</option>
              <option value="Active Customers">Active Customers</option>
              <option value="Inactive Users">Inactive Users</option>
              <option value="District 1">District 1</option>
              <option value="Premium Partners">Premium Partners</option>
            </select>
            <button onClick={handleSendNotification} disabled={!notifTitle.trim()} className="px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
          <div className="space-y-2">
            {notifLog.map(n => (
              <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">{n.title}</div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{n.segments} &middot; {n.sentAt}</div>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <div className="font-bold text-gray-400 dark:text-slate-400">Pending</div>
                  <div className="text-gray-400">—</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
