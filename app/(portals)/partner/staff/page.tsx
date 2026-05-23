'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, Shield, Edit, Users, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { staffService, StaffMember as ApiStaffMember } from '@/lib/data/staff';
import {
  staggerContainer, staggerItem, fadeUp, scaleIn,
  buttonTap, useSafeReducedMotion,
} from '@/lib/animation';

type Role = 'cashier' | 'manager' | 'operator';
type Status = 'active' | 'inactive';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
}

const roleConfig: Record<string, { label: string; color: string }> = {
  cashier: { label: 'Cashier', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  manager: { label: 'Manager', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  operator: { label: 'Operator', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};



function mapStaffMember(s: ApiStaffMember): StaffMember {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: (['cashier', 'manager', 'operator'].includes(s.role) ? s.role : 'cashier') as Role,
    status: (s.status === 'active' ? 'active' : 'inactive') as Status,
    lastLogin: s.lastActive || s.createdAt || '-',
  };
}

const roleTabs: { key: Role | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'manager', label: 'Manager' },
  { key: 'operator', label: 'Operator' },
];

export default function PartnerStaffPage() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<{ permission: string; cashier: boolean; manager: boolean; operator: boolean }[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'cashier' as Role });
  const [loading, setLoading] = useState(true);
  const reduced = useSafeReducedMotion();

  const storeId = user?.storeId || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    staffService.getByStore(storeId).then(data => {
      const list = data || [];
      setStaff(list.map(mapStaffMember));

      const permissionSet = new Set<string>();
      const rolePerms: Record<string, Set<string>> = { cashier: new Set(), manager: new Set(), operator: new Set() };
      list.forEach((s: any) => {
        const r = (['cashier', 'manager', 'operator'].includes(s.role) ? s.role : 'cashier');
        (s.permissions || []).forEach((p: string) => {
          permissionSet.add(p);
          rolePerms[r].add(p);
        });
      });

      const permDisplay: Record<string, string> = {};
      [...permissionSet].forEach(p => {
        permDisplay[p] = p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      });

      setPermissionMatrix(
        [...permissionSet].map(p => ({
          permission: permDisplay[p],
          cashier: rolePerms.cashier.has(p),
          manager: rolePerms.manager.has(p),
          operator: rolePerms.operator.has(p),
        }))
      );
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [storeId]);

  const filtered = roleFilter === 'all' ? staff : staff.filter(s => s.role === roleFilter);

  const toggleStatus = async (id: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    await staffService.update(id, { status: newStatus });
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as Status } : s));
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) return;
    const created = await staffService.create({
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      status: 'active',
      storeId,
    });
    if (created) {
      setStaff(prev => [mapStaffMember(created), ...prev]);
    }
    setNewStaff({ name: '', email: '', role: 'cashier' });
    setShowForm(false);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-gray-900 dark:text-white text-sm font-medium">Loading staff members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="bg-gradient-to-br from-emerald-700 to-emerald-500 dark:from-emerald-900 dark:to-emerald-700 rounded-2xl p-6 md:p-8 mb-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold">{t('staff_management')}</h1>
            <p className="text-emerald-100 text-sm mt-1">{t('staff_subtitle')}</p>
          </div>
          <motion.button onClick={() => setShowForm(!showForm)} whileTap={buttonTap}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl transition-all backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" /> {t('add_staff')}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{t('name')}</label>
                <input type="text" value={newStaff.name} onChange={e => setNewStaff(p => ({ ...p, name: e.target.value }))} placeholder={t('staff_name_placeholder')}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{t('email')}</label>
                <input type="email" value={newStaff.email} onChange={e => setNewStaff(p => ({ ...p, email: e.target.value }))} placeholder={t('staff_email_placeholder')}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-slate-400 font-medium">{t('role')}</label>
                <select value={newStaff.role} onChange={e => setNewStaff(p => ({ ...p, role: e.target.value as Role }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
              <div className="flex items-end">
                <motion.button onClick={handleAddStaff} whileTap={buttonTap}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-medium rounded-xl transition-all shadow-md"
                >
                  {t('add')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-2 mb-6 overflow-x-auto">
        {roleTabs.map(tab => (
          <motion.button key={tab.key} onClick={() => setRoleFilter(tab.key)} whileTap={buttonTap}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              roleFilter === tab.key
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={scaleIn} initial="hidden" animate="visible"
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-x-auto mb-8"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <th className="text-left py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">{t('name')}</th>
              <th className="text-left py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">{t('email')}</th>
              <th className="text-left py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">{t('role')}</th>
              <th className="text-center py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">{t('status')}</th>
              <th className="text-left py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">{t('last_login')}</th>
              <th className="text-center py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.map((member) => {
                const rc = roleConfig[member.role];
                return (
                  <motion.tr key={member.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    whileHover={reduced ? {} : { backgroundColor: 'rgba(5, 122, 66, 0.02)' }}
                    className="border-b border-gray-50 dark:border-slate-700/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <motion.div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center"
                          whileHover={reduced ? {} : { scale: 1.15 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          <User className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                        </motion.div>
                        <span className="font-semibold text-gray-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-slate-400">{member.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rc.color}`}>{rc.label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <motion.button onClick={() => toggleStatus(member.id)} whileTap={buttonTap}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          member.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                        }`}
                      >
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </motion.button>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 text-xs">{member.lastLogin}</td>
                    <td className="py-3.5 px-4 text-center">
                      <motion.button whileTap={buttonTap}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400 dark:text-slate-500"
          >
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('no_staff_found')}</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
      >
        <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 mb-4"
        >
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">{t('permission_matrix')}</h3>
        </motion.div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="text-left py-2.5 px-3 text-gray-500 dark:text-slate-400 font-medium text-xs">{t('permission')}</th>
                <th className="text-center py-2.5 px-3 text-gray-500 dark:text-slate-400 font-medium text-xs">Cashier</th>
                <th className="text-center py-2.5 px-3 text-gray-500 dark:text-slate-400 font-medium text-xs">Manager</th>
                <th className="text-center py-2.5 px-3 text-gray-500 dark:text-slate-400 font-medium text-xs">Operator</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row, i) => (
                <motion.tr key={row.permission} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={i % 2 === 0 ? 'bg-gray-50 dark:bg-slate-700/30' : ''}
                >
                  <td className="py-2.5 px-3 text-gray-800 dark:text-slate-200 font-medium">{row.permission}</td>
                  <td className="py-2.5 px-3 text-center">{row.cashier ? <CheckIcon /> : <DashIcon />}</td>
                  <td className="py-2.5 px-3 text-center">{row.manager ? <CheckIcon /> : <DashIcon />}</td>
                  <td className="py-2.5 px-3 text-center">{row.operator ? <CheckIcon /> : <DashIcon />}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function CheckIcon() {
  return <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">&#10003;</span>;
}

function DashIcon() {
  return <span className="text-gray-300 dark:text-slate-600">&#8212;</span>;
}
