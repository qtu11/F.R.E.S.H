'use client';

import { useState, useEffect } from 'react';
import { Users, Check, X, Store, MapPin, Phone, ExternalLink, Search, Clock, AlertCircle, FileText, Building2, CreditCard, Download, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import type { Organization, PartnerDocument } from '@/lib/data/partners';
import { showToast } from '@/lib/data/notifications';

export default function AdminPartners() {
  const { t } = useGlobal();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      setOrganizations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrgDetails = async (orgId: string) => {
    if (orgDetails[orgId]) return;
    setLoadingDetails(orgId);
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      const data = await res.json();
      setOrgDetails(prev => ({ ...prev, [orgId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(null);
    }
  };

  const toggleExpand = (orgId: string) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    } else {
      setExpandedOrg(orgId);
      loadOrgDetails(orgId);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/organizations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Approval failed');
      const updated = await res.json();
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      setConfirmAction(null);
      showToast('success', 'Partner Approved', 'Organization has been approved. Default store created.');
      loadOrganizations();
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to approve partner');
      setConfirmAction(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/organizations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionReason: rejectReason }),
      });
      if (!res.ok) throw new Error('Rejection failed');
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
      setConfirmAction(null);
      setRejectReason('');
      showToast('info', 'Partner Rejected', 'The partner request has been rejected');
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to reject partner');
      setConfirmAction(null);
    }
  };

  const filtered = search
    ? organizations.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()) || o.taxCode?.includes(search))
    : organizations;

  const pendingOrgs = organizations.filter(o => o.status === 'pending');
  const displayOrgs = tab === 'pending' ? pendingOrgs : filtered;

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-slate-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Building2 className="w-6 h-6" /> {t('partners_approvals') || 'KYB - Thẩm định đối tác'}
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setTab('pending')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'pending' ? 'bg-white text-emerald-700 shadow-lg' : 'bg-white/20 text-white border border-white/20 backdrop-blur-md'}`}>
              Chờ duyệt ({pendingOrgs.length})
            </button>
            <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'all' ? 'bg-white text-emerald-700 shadow-lg' : 'bg-white/20 text-white border border-white/20 backdrop-blur-md'}`}>
              Tất cả ({organizations.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_partners_placeholder') || 'Tìm kiếm theo tên, mã số thuế...'} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#057A42] text-sm font-bold text-gray-900 dark:text-white" />
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse p-8 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrgs.map(org => {
              const details = orgDetails[org.id];
              const docs = details?.documents || [];
              const members = details?.members || [];
              const isExpanded = expandedOrg === org.id;

              return (
                <div key={org.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all">
                  <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors" onClick={() => toggleExpand(org.id)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${
                        org.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600' :
                        org.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' :
                        'bg-red-50 dark:bg-red-900/30 text-red-600'
                      }`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white">{org.name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase flex items-center gap-3 mt-0.5">
                          <span>MST: {org.taxCode || 'N/A'}</span>
                          {org.owner?.name && <span>• {org.owner.name}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                        org.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50' :
                        org.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
                        'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                      }`}>
                        {org.status === 'pending' ? 'Chờ duyệt' : org.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                      </span>

                      {org.status === 'pending' && (
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setConfirmAction({ id: org.id, action: 'approve' })} className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-all hover:scale-110" title="Duyệt">
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => setConfirmAction({ id: org.id, action: 'reject' })} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all hover:scale-110" title="Từ chối">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={e => { e.stopPropagation(); toggleExpand(org.id); }}>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-4 bg-gray-50/50 dark:bg-slate-900/30">
                      {loadingDetails === org.id ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Organization Details */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5" /> Thông tin doanh nghiệp
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between"><span className="text-gray-400">Tên:</span><span className="font-bold text-gray-700 dark:text-slate-300">{org.name}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">MST:</span><span className="font-bold">{org.taxCode || 'N/A'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">Địa chỉ:</span><span className="font-bold text-right max-w-[200px]">{org.address || 'N/A'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">Email:</span><span className="font-bold">{org.email || 'N/A'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">Điện thoại:</span><span className="font-bold">{org.phone || 'N/A'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">Ngày đăng ký:</span><span className="font-bold">{org.createdAt ? new Date(org.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                            </div>
                          </div>

                          {/* Documents */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5" /> Hồ sơ pháp lý ({docs.length})
                            </h4>
                            {docs.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">Chưa có giấy tờ</p>
                            ) : (
                              <div className="space-y-2">
                                {docs.map((doc: any) => (
                                  <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className={`w-4 h-4 shrink-0 ${doc.status === 'verified' ? 'text-emerald-500' : doc.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`} />
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate">{doc.fileName}</p>
                                        <p className="text-[10px] text-gray-400 capitalize">{doc.type.replace(/_/g, ' ')}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                        doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                                        doc.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                        'bg-amber-50 text-amber-600'
                                      }`}>
                                        {doc.status === 'verified' ? 'Đã xác thực' : doc.status === 'rejected' ? 'Từ chối' : 'Chờ xác thực'}
                                      </span>
                                      {doc.fileUrl && (
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                          <Eye className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Team Members */}
                          <div className="md:col-span-2">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" /> Nhân sự ({members.length})
                            </h4>
                            {members.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">Chưa có thành viên</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {members.map((m: any) => (
                                  <div key={m.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                      {m.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-700 dark:text-slate-300">{m.user?.name || 'Unknown'}</p>
                                      <p className="text-[9px] text-gray-400 capitalize">{m.role}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {displayOrgs.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-gray-100 dark:border-slate-700">
                <Building2 className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-slate-400 font-bold">
                  {tab === 'pending' ? 'Không có hồ sơ chờ duyệt' : 'Không tìm thấy đối tác nào'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700">
              <AlertCircle className={`w-8 h-8 ${confirmAction.action === 'approve' ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 text-center">
              {confirmAction.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 text-center">
              {confirmAction.action === 'approve' ? 'Duyệt hồ sơ doanh nghiệp này? Hệ thống sẽ tự động tạo cửa hàng mặc định.' : 'Từ chối hồ sơ doanh nghiệp này?'}
            </p>

            {confirmAction.action === 'reject' && (
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Lý do từ chối..."
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 resize-none"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <button onClick={() => confirmAction.action === 'approve' ? handleApprove(confirmAction.id) : handleReject(confirmAction.id)} className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${confirmAction.action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {confirmAction.action === 'approve' ? 'Đồng ý duyệt' : 'Từ chối'}
              </button>
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
