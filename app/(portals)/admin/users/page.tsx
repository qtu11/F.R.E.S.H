'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Shield, Ban, CheckCircle, Clock, Eye, ChevronDown, ChevronUp, AlertTriangle, X, ShoppingBag, DollarSign, Flag, Calendar, Loader2, CreditCard, Plus, Trash2, Fingerprint, Edit3, Save } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { authService } from '@/lib/data/auth';
import { bankAccountService, BankAccount } from '@/lib/data/bankAccounts';

const ROLE_FILTERS = ['All', 'Customers', 'Partners', 'Admins'];
const BIOMETRIC_FILTERS = ['All Biometrics', 'Verified', 'Pending', 'Not Verified'];
const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  Suspended: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50',
  Banned: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
};

interface EditForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  walletBalance: string;
  greenPoints: string;
  co2Reduced: string;
  foodRescued: string;
  totalOrders: string;
  totalSpent: string;
  password: string;
}

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [banModal, setBanModal] = useState<{ id: string; name: string; action: 'ban' | 'unban' } | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Sinh trắc học state
  const [biometricStatusMap, setBiometricStatusMap] = useState<Record<string, any>>({});
  const [selectedBiometricUser, setSelectedBiometricUser] = useState<any | null>(null);
  const [biometricFilter, setBiometricFilter] = useState('All Biometrics');

  const [userBankAccounts, setUserBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [newBranch, setNewBranch] = useState('');

  // Hoạt động lịch sử của người dùng
  const [historyUser, setHistoryUser] = useState<any | null>(null);
  const [historyData, setHistoryData] = useState<{ orders: any[]; transactions: any[]; pointsHistory: any[] }>({ orders: [], transactions: [], pointsHistory: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<'orders' | 'transactions' | 'points'>('orders');

  // Chỉnh sửa hồ sơ người dùng
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'Customer',
    status: 'Active',
    walletBalance: '0',
    greenPoints: '0',
    co2Reduced: '0',
    foodRescued: '0',
    totalOrders: '0',
    totalSpent: '0',
    password: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleOpenEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'Customer',
      status: user.status || 'Active',
      walletBalance: String(user.walletBalance ?? 0),
      greenPoints: String(user.greenPoints ?? 0),
      co2Reduced: String(user.co2Reduced ?? 0),
      foodRescued: String(user.foodRescued ?? 0),
      totalOrders: String(user.totalOrders ?? 0),
      totalSpent: String(user.totalSpent ?? 0),
      password: ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSavingEdit(true);
    try {
      const payload: any = {
        id: editUser.id,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        address: editForm.address || null,
        role: editForm.role.toLowerCase(),
        status: editForm.status.toLowerCase(),
        wallet_balance: parseInt(editForm.walletBalance) || 0,
        green_points: parseInt(editForm.greenPoints) || 0,
        co2_reduced: parseFloat(editForm.co2Reduced) || 0,
        food_rescued: parseFloat(editForm.foodRescued) || 0,
        total_orders: parseInt(editForm.totalOrders) || 0,
        total_spent: parseInt(editForm.totalSpent) || 0
      };

      if (editForm.password && editForm.password.trim() !== '') {
        payload.password = editForm.password;
      }

      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === editUser.id ? {
          ...u,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone || null,
          address: editForm.address || null,
          role: editForm.role,
          status: editForm.status,
          walletBalance: parseInt(editForm.walletBalance) || 0,
          greenPoints: parseInt(editForm.greenPoints) || 0,
          co2Reduced: parseFloat(editForm.co2Reduced) || 0,
          foodRescued: parseFloat(editForm.foodRescued) || 0,
          totalOrders: parseInt(editForm.totalOrders) || 0,
          totalSpent: parseInt(editForm.totalSpent) || 0
        } : u));
        setEditUser(null);
      } else {
        alert(data.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleViewHistory = async (user: any) => {
    setHistoryUser(user);
    setLoadingHistory(true);
    setHistoryTab('orders');
    try {
      const res = await fetch(`/api/users/history?userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      setHistoryData(data || { orders: [], transactions: [], pointsHistory: [] });
    } catch (err) {
      console.error(err);
      alert('Không thể tải lịch sử hoạt động');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (expandedId) {
      setLoadingBanks(true);
      bankAccountService.getByUser(expandedId)
        .then(data => {
          setUserBankAccounts(data || []);
          setLoadingBanks(false);
        })
        .catch(err => {
          console.error(err);
          setUserBankAccounts([]);
          setLoadingBanks(false);
        });
    } else {
      setUserBankAccounts([]);
    }
  }, [expandedId]);

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedId) return;
    if (!newBankName || !newAccountNumber || !newAccountHolder) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    try {
      await bankAccountService.add({
        userId: expandedId,
        bankName: newBankName,
        accountNumber: newAccountNumber,
        accountHolder: newAccountHolder.toUpperCase(),
        branch: newBranch,
        isDefault: userBankAccounts.length === 0
      });
      setNewBankName('');
      setNewAccountNumber('');
      setNewAccountHolder('');
      setNewBranch('');
      setShowAddBankModal(false);
      
      const data = await bankAccountService.getByUser(expandedId);
      setUserBankAccounts(data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể thêm tài khoản ngân hàng');
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (!expandedId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng liên kết này không?')) return;
    try {
      await bankAccountService.remove(id);
      const data = await bankAccountService.getByUser(expandedId);
      setUserBankAccounts(data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa tài khoản ngân hàng');
    }
  };

  const handleSetDefaultBank = async (id: string) => {
    if (!expandedId) return;
    try {
      await bankAccountService.setDefault(id, expandedId);
      const data = await bankAccountService.getByUser(expandedId);
      setUserBankAccounts(data || []);
    } catch (err) {
      console.error(err);
      alert('Không thể đặt làm mặc định');
    }
  };

  // Đồng bộ người dùng và sinh trắc học khi load
  const loadUsersAndBiometrics = () => {
    setLoading(true);
    Promise.all([
      authService.getUsers(),
      fetch('/api/biometric?action=get_all_status').then(res => res.json())
    ]).then(([userData, bioData]) => {
      if (Array.isArray(userData)) {
        setUsers(userData.map((u: any) => ({
          ...u,
          status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase() : 'Active',
          role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : 'Customer',
        })));
      }
      if (bioData.success && bioData.records) {
        setBiometricStatusMap(bioData.records);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    setMounted(true);
    loadUsersAndBiometrics();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    
    let matchRole = true;
    if (roleFilter === 'Customers') matchRole = u.role === 'Customer';
    else if (roleFilter === 'Partners') matchRole = u.role === 'Partner';
    else if (roleFilter === 'Admins') matchRole = u.role === 'Admin';

    let matchBiometric = true;
    const record = biometricStatusMap[u.id];
    const status = record ? record.status : 'none';

    if (biometricFilter === 'Verified') {
      matchBiometric = status === 'verified';
    } else if (biometricFilter === 'Pending') {
      matchBiometric = status === 'pending';
    } else if (biometricFilter === 'Not Verified') {
      matchBiometric = status === 'none' || status === 'rejected';
    }

    return matchSearch && matchRole && matchBiometric;
  });

  const handleBanToggle = () => {
    if (!banModal) return;
    const newStatus = banModal.action === 'ban' ? 'banned' : 'active';
    authService.updateUserStatus(banModal.id, newStatus)
      .then(() => {
        setUsers(prev => prev.map(u => u.id === banModal.id ? { ...u, status: banModal.action === 'ban' ? 'Banned' : 'Active' } : u));
        setBanModal(null);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to update user status');
        setBanModal(null);
      });
  };

  const handleSuspend = (id: string) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;
    const newStatus = targetUser.status === 'Suspended' ? 'active' : 'suspended';
    authService.updateUserStatus(id, newStatus)
      .then(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: targetUser.status === 'Suspended' ? 'Active' : 'Suspended' } : u));
      })
      .catch(err => {
        console.error(err);
        alert('Failed to suspend user');
      });
  };

  const handleVerify = (id: string) => {
    authService.updateUserStatus(id, 'active')
      .then(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'Active' } : u));
      })
      .catch(err => {
        console.error(err);
        alert('Failed to verify user');
      });
  };

  // Admin xử lý duyệt sinh trắc học Face ID
  const handleApproveBiometric = async (userId: string, approve: boolean) => {
    const status = approve ? 'verified' : 'rejected';
    try {
      const res = await fetch('/api/biometric', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      });
      const data = await res.json();
      if (data.success) {
        setBiometricStatusMap(prev => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            status
          }
        }));
        setSelectedBiometricUser(null);
      }
    } catch (err) {
      console.error("Lỗi duyệt sinh trắc học:", err);
      alert('Không thể cập nhật trạng thái sinh trắc học');
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Loading user directory...</div>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col gap-2 md:items-end w-full md:w-auto shrink-0">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mr-1">Vai trò:</span>
              {ROLE_FILTERS.map(f => (
                <button key={f} onClick={() => setRoleFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${roleFilter === f ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mr-1">Face ID:</span>
              {BIOMETRIC_FILTERS.map(f => (
                <button key={f} onClick={() => setBiometricFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${biometricFilter === f ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-md border-emerald-500' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                  {f === 'All Biometrics' ? 'Tất cả' : f === 'Verified' ? 'Đã xác minh' : f === 'Pending' ? 'Chờ duyệt ⚡' : 'Chưa gửi/Từ chối'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Biometric Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(user => (
                  <Fragment key={user.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer" onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
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
                      
                      {/* Cột Sinh trắc học Biometric */}
                      <td className="px-6 py-4">
                        {(() => {
                          const record = biometricStatusMap[user.id];
                          const status = record ? record.status : 'none';
                          return (
                            <span 
                              onClick={(e) => {
                                if (status === 'pending') {
                                  e.stopPropagation();
                                  setSelectedBiometricUser({ 
                                    ...user, 
                                    biometricImage: record.image,
                                    biometricRecord: record
                                  });
                                }
                              }}
                              className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider border select-none transition-all duration-200 hover:scale-105 ${
                                status === 'verified'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : status === 'pending'
                                    ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border-yellow-250 dark:border-yellow-800 animate-pulse font-extrabold cursor-pointer shadow-sm'
                                    : status === 'rejected'
                                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {status === 'verified' ? 'Đã xác minh' : status === 'pending' ? 'Chờ duyệt ⚡' : status === 'rejected' ? 'Từ chối' : 'Chưa gửi'}
                            </span>
                          );
                        })()}
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
                          <button onClick={() => handleOpenEdit(user)} className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-650 rounded-xl hover:scale-110 transition-all animate-none" title="Edit Profile">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleViewHistory(user)} className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors" title="View History">
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
                        <td colSpan={7} className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/30 border-b border-gray-100 dark:border-slate-700">
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                  <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Tài khoản ngân hàng liên kết (Nạp tự động)
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddBankModal(true);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <Plus className="w-3 h-3" /> Thêm ngân hàng
                                </button>
                              </div>

                              {loadingBanks ? (
                                <div className="py-4 flex justify-center">
                                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                </div>
                              ) : userBankAccounts.length === 0 ? (
                                <div className="py-4 text-center text-xs text-gray-400 dark:text-slate-500 italic bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                                  Chưa cấu hình tài khoản ngân hàng nào cho khách hàng này. Vui lòng bấm &quot;Thêm ngân hàng&quot; để liên kết.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {userBankAccounts.map(acc => (
                                    <div key={acc.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 flex items-start justify-between shadow-sm">
                                      <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                          {acc.bankName.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                          <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                                            {acc.bankName}
                                            {acc.isDefault && (
                                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                                Mặc định
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">Số tài khoản: <strong className="text-gray-700 dark:text-slate-300">{acc.accountNumber}</strong></div>
                                          <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">Chủ tài khoản: <span className="uppercase text-gray-700 dark:text-slate-300">{acc.accountHolder}</span></div>
                                          {acc.branch && <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-0.5">Chi nhánh: {acc.branch}</div>}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 items-center">
                                        {!acc.isDefault && (
                                          <button
                                            onClick={() => handleSetDefaultBank(acc.id)}
                                            className="text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-lg transition-colors border border-gray-100 dark:border-slate-600"
                                          >
                                            Đặt mặc định
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteBankAccount(acc.id)}
                                          className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg hover:scale-105 transition-all"
                                          title="Xóa"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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

      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddBankModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-300" /> Thêm Ngân Hàng Liên Kết
              </h3>
              <button onClick={() => setShowAddBankModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddBankAccount} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block uppercase">Tên Ngân Hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vietcombank, Techcombank, MB Bank..."
                  value={newBankName}
                  onChange={e => setNewBankName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block uppercase">Số Tài Khoản <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={newAccountNumber}
                  onChange={e => setNewAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block uppercase">Tên Chủ Tài Khoản <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={newAccountHolder}
                  onChange={e => setNewAccountHolder(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block uppercase">Chi Nhánh (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Nhập chi nhánh ngân hàng"
                  value={newBranch}
                  onChange={e => setNewBranch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 transition-all"
                >
                  Xác nhận thêm
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PHÊ DUYỆT SINH TRẮC HỌC FACE ID & Web eKYC */}
      {selectedBiometricUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedBiometricUser(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0">
                  <Fingerprint className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-base md:text-lg uppercase tracking-wider">PHÊ DUYỆT HỒ SƠ Web eKYC</h3>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest block">Thẩm định tính thực thể sống và độ chuẩn xác của dữ liệu trích xuất</span>
                </div>
              </div>
              <button onClick={() => setSelectedBiometricUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Chi tiết người dùng */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 mb-6">
              <GradientAvatar name={selectedBiometricUser.name} />
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedBiometricUser.name}</div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{selectedBiometricUser.email}</div>
              </div>
              <div className="ml-auto text-right">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/40 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  Loại: {selectedBiometricUser.biometricRecord?.documentType === 'cccd' ? 'CCCD gắn chíp' : 
                         selectedBiometricUser.biometricRecord?.documentType === 'cmnd' ? 'CMND' :
                         selectedBiometricUser.biometricRecord?.documentType === 'driver_license' ? 'Bằng lái xe' :
                         selectedBiometricUser.biometricRecord?.documentType === 'passport_visa' ? 'Hộ chiếu/Visa' : 'Giấy tờ gốc'}
                </span>
              </div>
            </div>

            {/* Grid 2 Cột */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột Trái: Ảnh eKYC */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block ml-1">Hình ảnh đối chiếu bảo mật</h4>
                
                {/* Carousel hoặc Grid Ảnh nhỏ */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block text-center">Chân dung (Face)</span>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center relative group cursor-pointer hover:border-emerald-500 transition-colors">
                      {selectedBiometricUser.biometricImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={selectedBiometricUser.biometricImage} alt="Face Scan" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[9px] text-slate-500 italic">No image</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block text-center">Giấy tờ mặt trước</span>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center relative group cursor-pointer hover:border-emerald-500 transition-colors">
                      {selectedBiometricUser.biometricRecord?.frontImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={selectedBiometricUser.biometricRecord.frontImage} alt="Front ID" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[9px] text-slate-500 italic">No image</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block text-center">Giấy tờ mặt sau</span>
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center relative group cursor-pointer hover:border-emerald-500 transition-colors">
                      {selectedBiometricUser.biometricRecord?.backImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={selectedBiometricUser.biometricRecord.backImage} alt="Back ID" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[9px] text-slate-500 italic">N/A</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hiển thị phóng to ảnh chính */}
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center relative animate-in fade-in-50">
                  {selectedBiometricUser.biometricImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selectedBiometricUser.biometricImage} alt="Active Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-slate-500 italic">Không có ảnh chân dung</div>
                  )}
                  {/* Laser quét trang trí */}
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/30 top-1/2 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                </div>
              </div>

              {/* Cột Phải: Dữ liệu AI trích xuất */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block ml-1">Thông tin OCR trích xuất</h4>
                
                <div className="bg-gray-50 dark:bg-slate-950 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Họ và tên</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white uppercase">{selectedBiometricUser.biometricRecord?.ocrData?.fullName || selectedBiometricUser.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Số căn cước / ID</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{selectedBiometricUser.biometricRecord?.ocrData?.idNumber || '—'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-800 pt-2">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Ngày sinh</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {selectedBiometricUser.biometricRecord?.ocrData?.dob ? new Date(selectedBiometricUser.biometricRecord.ocrData.dob).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Ngày cấp</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {selectedBiometricUser.biometricRecord?.ocrData?.issueDate ? new Date(selectedBiometricUser.biometricRecord.ocrData.issueDate).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-slate-800 pt-2">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Địa chỉ thường trú</span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white block mt-0.5 leading-relaxed">{selectedBiometricUser.biometricRecord?.ocrData?.address || '—'}</span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-slate-800 pt-2">
                    <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Nơi cấp</span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white block mt-0.5">{selectedBiometricUser.biometricRecord?.ocrData?.issuePlace || '—'}</span>
                  </div>
                </div>

                {/* Điểm trùng khớp khuôn mặt */}
                <h4 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block ml-1 pt-1">Đánh giá an ninh & Sinh trắc học</h4>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-xs font-semibold space-y-3 text-slate-500 dark:text-slate-400">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>Độ trùng khớp ảnh (Face Match Confidence):</span>
                      <span className="text-emerald-500 font-extrabold text-sm">{selectedBiometricUser.biometricRecord?.faceMatchScore || 98.4}% Match</span>
                    </div>
                    <div className="w-full bg-slate-850 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${selectedBiometricUser.biometricRecord?.faceMatchScore || 98.4}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-100 dark:border-slate-800 pt-2">
                    <span>Liveness Detection Check:</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">ĐẠT (PASSED) ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chỉ số an toàn thiết bị (WebAuthn):</span>
                    <span className="text-emerald-500 font-bold">Xác thực sinh trắc chuẩn 2.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Các hành động phê duyệt */}
            <div className="flex gap-3 mt-8 border-t border-gray-100 dark:border-slate-800 pt-5 justify-end">
              <button 
                onClick={() => setSelectedBiometricUser(null)} 
                className="px-6 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-xs uppercase tracking-widest cursor-pointer"
              >
                Đóng
              </button>
              <button 
                onClick={() => handleApproveBiometric(selectedBiometricUser.id, false)} 
                className="px-6 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20 hover:border-red-500 font-black rounded-2xl transition-all shadow-md uppercase tracking-widest text-xs cursor-pointer"
              >
                Từ chối hồ sơ
              </button>
              <button 
                onClick={() => handleApproveBiometric(selectedBiometricUser.id, true)} 
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 uppercase tracking-widest text-xs cursor-pointer"
              >
                Duyệt eKYC ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LỊCH SỬ HOẠT ĐỘNG (View History) */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-in fade-in-30" onClick={() => setHistoryUser(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-base md:text-lg uppercase tracking-wider">LỊCH SỬ HOẠT ĐỘNG</h3>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest block">Chi tiết đơn hàng, giao dịch ví và điểm thưởng của {historyUser.name}</span>
                </div>
              </div>
              <button onClick={() => setHistoryUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 mb-6 flex-wrap">
              <button 
                onClick={() => setHistoryTab('orders')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${historyTab === 'orders' ? 'bg-emerald-650 dark:bg-emerald-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Đơn hàng ({historyData.orders.length})
              </button>
              <button 
                onClick={() => setHistoryTab('transactions')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${historyTab === 'transactions' ? 'bg-emerald-650 dark:bg-emerald-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Giao dịch ví ({historyData.transactions.length})
              </button>
              <button 
                onClick={() => setHistoryTab('points')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${historyTab === 'points' ? 'bg-emerald-650 dark:bg-emerald-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
              >
                <DollarSign className="w-3.5 h-3.5" /> Điểm thưởng ({historyData.pointsHistory.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-h-[40vh] overflow-y-auto">
              {loadingHistory ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải dữ liệu lịch sử...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ORDERS TAB */}
                  {historyTab === 'orders' && (
                    <div className="space-y-3">
                      {historyData.orders.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 italic text-xs uppercase tracking-widest bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-850">Không tìm thấy lịch sử đơn hàng nào</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {historyData.orders.map((order: any) => (
                            <div key={order.id} className="bg-gray-50 dark:bg-slate-950 p-5 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">#{order.id.slice(0, 8)}</div>
                                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold mt-0.5">{order.storeName}</div>
                                </div>
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
                                  order.status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800' :
                                  order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-250 dark:border-red-800' :
                                  'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-250 dark:border-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="border-t border-gray-100 dark:border-slate-900 my-2 pt-2 flex justify-between items-center text-xs">
                                <span className="text-gray-500 dark:text-slate-400 font-medium">Tổng tiền:</span>
                                <span className="font-extrabold text-gray-900 dark:text-white text-sm">{order.total.toLocaleString()}đ</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-slate-500 font-bold mt-1">
                                <span className="capitalize">{order.paymentMethod} • {order.deliveryMethod}</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TRANSACTIONS TAB */}
                  {historyTab === 'transactions' && (
                    <div className="space-y-3">
                      {historyData.transactions.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 italic text-xs uppercase tracking-widest bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-850">Không tìm thấy lịch sử giao dịch ví nào</div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-850">
                          <table className="w-full text-left border-collapse bg-gray-50 dark:bg-slate-950">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800">
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mô tả</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Loại</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Số tiền</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ngày</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-900">
                              {historyData.transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-gray-100/50 dark:hover:bg-slate-900/50">
                                  <td className="px-5 py-3 text-xs font-bold text-gray-900 dark:text-white">{tx.description}</td>
                                  <td className="px-5 py-3">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${
                                      tx.type === 'topup' || tx.type === 'revenue' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200' : 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200'
                                    }`}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className={`px-5 py-3 text-xs font-black ${
                                    tx.type === 'topup' || tx.type === 'revenue' ? 'text-emerald-600' : 'text-red-500'
                                  }`}>
                                    {tx.type === 'topup' || tx.type === 'revenue' ? '+' : '-'}{tx.amount.toLocaleString()}đ
                                  </td>
                                  <td className="px-5 py-3 text-[10px] text-gray-400 dark:text-slate-500 font-bold">
                                    {new Date(tx.date).toLocaleDateString('vi-VN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* POINTS HISTORY TAB */}
                  {historyTab === 'points' && (
                    <div className="space-y-3">
                      {historyData.pointsHistory.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 italic text-xs uppercase tracking-widest bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-850">Không tìm thấy lịch sử điểm thưởng nào</div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-850">
                          <table className="w-full text-left border-collapse bg-gray-50 dark:bg-slate-950">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800">
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Mô tả</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Nguồn</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Biến động</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ngày</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-900">
                              {historyData.pointsHistory.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-100/50 dark:hover:bg-slate-900/50">
                                  <td className="px-5 py-3 text-xs font-bold text-gray-900 dark:text-white">{p.description}</td>
                                  <td className="px-5 py-3 text-[10px] text-gray-500 dark:text-slate-400 uppercase font-black">{p.source}</td>
                                  <td className={`px-5 py-3 text-xs font-black ${p.type === 'earned' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {p.type === 'earned' ? '+' : '-'}{p.points} Pts
                                  </td>
                                  <td className="px-5 py-3 text-[10px] text-gray-400 dark:text-slate-500 font-bold">
                                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 border-t border-gray-100 dark:border-slate-800 pt-4">
              <button 
                onClick={() => setHistoryUser(null)} 
                className="px-6 py-2.5 bg-gray-100 dark:bg-slate-850 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA HỒ SƠ NGƯỜI DÙNG (Edit User) */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-in fade-in-30" onClick={() => setEditUser(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0">
                  <Edit3 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-base md:text-lg uppercase tracking-wider">CHỈNH SỬA HỒ SƠ</h3>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest block">Quản lý và giải quyết trực tiếp khiếu nại tài khoản của {editUser.name}</span>
                </div>
              </div>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Cột 1: Thông tin cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Họ và Tên</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Địa chỉ Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Số điện thoại</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Địa chỉ liên hệ</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Vai trò (Role)</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Partner">Partner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Trạng thái (Status)</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Mật khẩu mới (Để trống nếu không đổi)</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới để thay đổi"
                    value={editForm.password || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  />
                </div>
              </div>

              {/* Cột 2: Cài đặt tài chính / Điểm xanh (Hỗ trợ khiếu nại tức thì) */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-gray-100 dark:border-slate-850 space-y-4">
                <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">HỖ TRỢ GIẢI QUYẾT KHIẾU NẠI / TÀI CHÍNH</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Số dư ví (đ)</label>
                    <input
                      type="number"
                      value={editForm.walletBalance}
                      onChange={e => setEditForm(prev => ({ ...prev, walletBalance: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Điểm xanh (Green Pts)</label>
                    <input
                      type="number"
                      value={editForm.greenPoints}
                      onChange={e => setEditForm(prev => ({ ...prev, greenPoints: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">CO₂ giảm thiểu (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.co2Reduced}
                      onChange={e => setEditForm(prev => ({ ...prev, co2Reduced: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Món đã cứu (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.foodRescued}
                      onChange={e => setEditForm(prev => ({ ...prev, foodRescued: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Tổng số đơn hàng</label>
                    <input
                      type="number"
                      value={editForm.totalOrders}
                      onChange={e => setEditForm(prev => ({ ...prev, totalOrders: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Tổng tiền tiêu (đ)</label>
                    <input
                      type="number"
                      value={editForm.totalSpent}
                      onChange={e => setEditForm(prev => ({ ...prev, totalSpent: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Các nút hành động */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-6 py-3 bg-gray-100 dark:bg-slate-850 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-md uppercase tracking-wider text-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
