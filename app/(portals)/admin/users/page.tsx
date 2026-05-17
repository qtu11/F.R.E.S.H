'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Shield, Ban, CheckCircle, Clock, Eye, ChevronDown, ChevronUp, AlertTriangle, X, ShoppingBag, DollarSign, Flag, Calendar } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const MOCK_USERS = [
  { id: '1', name: 'Nguyen Van An', email: 'an.nguyen@email.com', role: 'Customer', status: 'Active', joinDate: '2024-01-15', lastActive: '2026-05-16 14:32', totalOrders: 47, totalSpent: 12800000, reportsCount: 0, accountAge: '2y 4m' },
  { id: '2', name: 'Tran Thi Binh', email: 'binh.tran@email.com', role: 'Partner', status: 'Active', joinDate: '2024-03-22', lastActive: '2026-05-16 10:15', totalOrders: 0, totalSpent: 0, reportsCount: 1, accountAge: '2y 2m' },
  { id: '3', name: 'Le Hoang Cuong', email: 'cuong.le@email.com', role: 'Admin', status: 'Active', joinDate: '2023-11-01', lastActive: '2026-05-16 16:00', totalOrders: 0, totalSpent: 0, reportsCount: 0, accountAge: '2y 6m' },
  { id: '4', name: 'Pham Minh Duc', email: 'duc.pham@email.com', role: 'Customer', status: 'Suspended', joinDate: '2024-06-10', lastActive: '2026-04-28 09:45', totalOrders: 12, totalSpent: 3450000, reportsCount: 3, accountAge: '1y 11m' },
  { id: '5', name: 'Hoang Thi Em', email: 'em.hoang@email.com', role: 'Customer', status: 'Active', joinDate: '2025-02-14', lastActive: '2026-05-15 22:18', totalOrders: 28, totalSpent: 7600000, reportsCount: 0, accountAge: '1y 3m' },
  { id: '6', name: 'Vo Van Phuc', email: 'phuc.vo@email.com', role: 'Partner', status: 'Banned', joinDate: '2024-08-05', lastActive: '2026-03-10 08:00', totalOrders: 0, totalSpent: 0, reportsCount: 5, accountAge: '1y 9m' },
  { id: '7', name: 'Dang Thu Ha', email: 'ha.dang@email.com', role: 'Admin', status: 'Active', joinDate: '2023-06-20', lastActive: '2026-05-16 15:30', totalOrders: 0, totalSpent: 0, reportsCount: 0, accountAge: '2y 11m' },
  { id: '8', name: 'Bui Quang Huy', email: 'huy.bui@email.com', role: 'Customer', status: 'Active', joinDate: '2024-11-30', lastActive: '2026-05-14 17:05', totalOrders: 8, totalSpent: 2100000, reportsCount: 1, accountAge: '1y 5m' },
  { id: '9', name: 'Ly My Linh', email: 'linh.ly@email.com', role: 'Partner', status: 'Suspended', joinDate: '2024-04-18', lastActive: '2026-05-01 11:20', totalOrders: 0, totalSpent: 0, reportsCount: 2, accountAge: '2y 1m' },
  { id: '10', name: 'Ngo Thanh Nam', email: 'nam.ngo@email.com', role: 'Customer', status: 'Banned', joinDate: '2024-09-12', lastActive: '2026-02-20 06:45', totalOrders: 5, totalSpent: 980000, reportsCount: 8, accountAge: '1y 8m' },
  { id: '11', name: 'Do Thuy Oanh', email: 'oanh.do@email.com', role: 'Customer', status: 'Active', joinDate: '2025-05-01', lastActive: '2026-05-16 13:00', totalOrders: 3, totalSpent: 450000, reportsCount: 0, accountAge: '1y 0m' },
  { id: '12', name: 'Mai Tien Phat', email: 'phat.mai@email.com', role: 'Partner', status: 'Active', joinDate: '2024-02-28', lastActive: '2026-05-15 19:40', totalOrders: 0, totalSpent: 0, reportsCount: 0, accountAge: '2y 3m' },
];

const ROLE_FILTERS = ['All', 'Customers', 'Partners', 'Admins'];
const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  Suspended: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50',
  Banned: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
};

function GradientAvatar({ name }: { name: string }) {
  const colors = [
    'from-[#057A42] to-emerald-600',
    'from-blue-500 to-blue-700',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-400 to-cyan-600',
    'from-rose-500 to-pink-700',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
      {initials}
    </div>
  );
}

export default function AdminUsers() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [banModal, setBanModal] = useState<{ id: string; name: string; action: 'ban' | 'unban' } | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  useEffect(() => { setMounted(true); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    let matchRole = true;
    if (roleFilter === 'Customers') matchRole = u.role === 'Customer';
    else if (roleFilter === 'Partners') matchRole = u.role === 'Partner';
    else if (roleFilter === 'Admins') matchRole = u.role === 'Admin';
    return matchSearch && matchRole;
  });

  const handleBanToggle = () => {
    if (!banModal) return;
    setUsers(prev => prev.map(u => u.id === banModal.id ? { ...u, status: banModal.action === 'ban' ? 'Banned' : 'Active' as const } : u));
    setBanModal(null);
  };

  const handleSuspend = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Suspended' ? 'Active' as const : 'Suspended' as const } : u));
  };

  const handleVerify = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' as const } : u));
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Users className="w-6 h-6" /> User Management
          </h1>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
            <Users className="w-3 h-3" /> {users.length} Total Users
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_users_placeholder')} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ROLE_FILTERS.map(f => (
              <button key={f} onClick={() => setRoleFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${roleFilter === f ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(user => (
                  <>
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer" onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <GradientAvatar name={user.name} />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border ${user.role === 'Admin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50' : user.role === 'Partner' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border ${STATUS_STYLES[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-slate-300">{user.joinDate}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {user.lastActive}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {user.status !== 'Banned' && (
                            <button onClick={() => handleSuspend(user.id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${user.status === 'Suspended' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600'}`} title={user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}>
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          {user.status !== 'Active' && user.status !== 'Banned' && (
                            <button onClick={() => handleVerify(user.id)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:scale-110 transition-all" title="Verify">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setBanModal({ id: user.id, name: user.name, action: user.status === 'Banned' ? 'unban' : 'ban' })} className={`p-2 rounded-xl transition-all hover:scale-110 ${user.status === 'Banned' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`} title={user.status === 'Banned' ? 'Unban' : 'Ban'}>
                            {user.status === 'Banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" title="View History">
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="ml-1">
                            {expandedId === user.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {expandedId === user.id && (
                      <tr key={`${user.id}-detail`}>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/30 border-b border-gray-100 dark:border-slate-700">
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1"><ShoppingBag className="w-3 h-3" /> Total Orders</div>
                              <div className="text-lg font-black text-gray-900 dark:text-white">{user.totalOrders}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1"><DollarSign className="w-3 h-3" /> Total Spent</div>
                              <div className="text-lg font-black text-gray-900 dark:text-white">{user.totalSpent.toLocaleString()}đ</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1"><Flag className="w-3 h-3" /> Reports</div>
                              <div className="text-lg font-black text-gray-900 dark:text-white">{user.reportsCount}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1"><Calendar className="w-3 h-3" /> Account Age</div>
                              <div className="text-lg font-black text-gray-900 dark:text-white">{user.accountAge}</div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-bold">No users match your search</p>
            </div>
          )}
        </motion.div>
      </div>

      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setBanModal(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-700 text-center" onClick={e => e.stopPropagation()}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${banModal.action === 'ban' ? 'bg-red-50 dark:bg-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30'}`}>
              <AlertTriangle className={`w-8 h-8 ${banModal.action === 'ban' ? 'text-red-500' : 'text-emerald-500'}`} />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">{banModal.action === 'ban' ? 'Ban' : 'Unban'} User</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Are you sure you want to {banModal.action} <strong className="text-gray-900 dark:text-white">{banModal.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={handleBanToggle} className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${banModal.action === 'ban' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                Yes, {banModal.action}
              </button>
              <button onClick={() => setBanModal(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
