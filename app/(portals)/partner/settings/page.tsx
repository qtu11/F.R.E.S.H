'use client';

import { useState, useEffect } from 'react';
import {
  Building2, Users, MapPin, Plus, Mail, UserPlus, X, Check,
  Loader2, Store, Phone, CreditCard, FileText, Trash2, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { showToast } from '@/lib/data/notifications';

interface OrgData {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  documents: any[];
  branches: any[];
}

interface Member {
  id: string;
  userId: string;
  role: string;
  status: string;
  user?: { name: string; email: string };
}

export default function PartnerSettings() {
  const { user } = useAuth();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'branches' | 'team'>('profile');

  // Branch form
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [addingBranch, setAddingBranch] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/organizations/mine');
      const orgData = await res.json();
      setOrg(orgData);
      if (orgData?.id) {
        const detailRes = await fetch(`/api/organizations/${orgData.id}`);
        const detail = await detailRes.json();
        if (detail.error) throw new Error(detail.error);
        setMembers(detail?.members || []);
        setOrg(prev => prev ? { ...prev, documents: detail?.documents || [] } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async () => {
    if (!branchName || !org?.id) return;
    setAddingBranch(true);
    try {
      const res = await fetch('/api/organizations/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id, name: branchName, address: branchAddress, phone: branchPhone }),
      });
      if (!res.ok) throw new Error('Failed to add branch');
      const data = await res.json();
      setOrg(prev => prev ? { ...prev, branches: [...(prev.branches || []), data] } : prev);
      setBranchName(''); setBranchAddress(''); setBranchPhone('');
      showToast('success', 'Đã thêm chi nhánh', `Chi nhánh ${data.name} đã được tạo`);
    } catch (err: any) {
      showToast('error', 'Lỗi', err.message);
    }
    setAddingBranch(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !org?.id) return;
    setInviting(true);
    try {
      const res = await fetch('/api/organizations/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id, email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invitation failed');
      }
      const data = await res.json();
      setMembers(prev => [...prev, data]);
      setInviteEmail('');
      showToast('success', 'Đã mời', `${inviteEmail} đã được thêm vào tổ chức`);
    } catch (err: any) {
      showToast('error', 'Lỗi', err.message);
    }
    setInviting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cài đặt tổ chức</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Quản lý thông tin doanh nghiệp, chi nhánh và nhân sự</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-800 pb-4">
        {(['profile', 'branches', 'team'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            tab === t ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/40 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-white/10 dark:border-slate-800'
          }`}>
            {t === 'profile' ? 'Hồ sơ' : t === 'branches' ? 'Chi nhánh' : 'Nhân sự'}
          </button>
        ))}
      </div>

      {tab === 'profile' && org && (
        <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80">
          <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" /> Thông tin doanh nghiệp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-white/10 dark:border-slate-800/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tên doanh nghiệp</span>
              <span className="font-bold text-gray-900 dark:text-white">{org.name}</span>
            </div>
            <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-white/10 dark:border-slate-800/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mã số thuế</span>
              <span className="font-bold text-gray-900 dark:text-white">{org.taxCode || 'N/A'}</span>
            </div>
            <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-white/10 dark:border-slate-800/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Địa chỉ</span>
              <span className="font-bold text-gray-900 dark:text-white">{org.address || 'N/A'}</span>
            </div>
            <div className="p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-white/10 dark:border-slate-800/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Trạng thái</span>
              <span className={`font-bold ${org.status === 'approved' ? 'text-emerald-500' : org.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                {org.status === 'approved' ? 'Đã duyệt' : org.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Giấy tờ đã tải lên ({org.documents?.length || 0})
            </h4>
            {org.documents && org.documents.length > 0 ? (
              <div className="space-y-2">
                {org.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{doc.fileName}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Đã tải</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Chưa có giấy tờ nào được tải lên</p>
            )}
          </div>
        </div>
      )}

      {tab === 'branches' && org && (
        <div className="space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-500" /> Danh sách chi nhánh
            </h3>
            {org.branches && org.branches.length > 0 ? (
              <div className="space-y-3">
                {org.branches.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between bg-white/40 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/10 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{b.name}</p>
                        <p className="text-[10px] text-gray-400">{b.address || 'Chưa có địa chỉ'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Hoạt động</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Chưa có chi nhánh nào. Thêm chi nhánh mới bên dưới.</p>
            )}
          </div>

          {/* Add Branch Form */}
          <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" /> Thêm chi nhánh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Tên chi nhánh" className="w-full bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="text" value={branchAddress} onChange={e => setBranchAddress(e.target.value)} placeholder="Địa chỉ" className="w-full bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <div className="flex gap-2">
                <input type="text" value={branchPhone} onChange={e => setBranchPhone(e.target.value)} placeholder="Số điện thoại" className="flex-1 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={handleAddBranch} disabled={!branchName || addingBranch} className="px-5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {addingBranch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'team' && org && (
        <div className="space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Thành viên ({members.length})
            </h3>
            {members.length > 0 ? (
              <div className="space-y-3">
                {members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between bg-white/40 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/10 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-600">
                        {m.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{m.user?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 capitalize">{m.role}</span>
                      {m.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Chưa có thành viên nào ngoài bạn</p>
            )}
          </div>

          {/* Invite Form */}
          <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-500" /> Mời nhân sự
            </h3>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email nhân sự" className="w-full bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="staff">Nhân viên</option>
                <option value="manager">Quản lý</option>
                <option value="accountant">Kế toán</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleInvite} disabled={!inviteEmail || inviting} className="px-6 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Mời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
