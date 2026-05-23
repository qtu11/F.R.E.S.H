'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Plus, Settings, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { adminService } from '@/lib/data/admin';

const MODULES = ['Dashboard', 'Partners', 'Fraud', 'ESG', 'Users', 'Commission', 'Forecasting', 'Heatmap', 'Marketing', 'Customer Care', 'System'];

export default function AdminRoles() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRolesLoading(true);
    adminService.getRoles().then(data => {
      if (Array.isArray(data) && data.length > 0) setRoles(data);
      setRolesLoading(false);
    }).catch(err => {
      console.error(err);
      setRolesLoading(false);
    });
  }, []);

  const togglePermission = (roleName: string, module: string) => {
    setRoles(prev => prev.map(r => {
      if (r.name !== roleName) return r;
      return { ...r, permissions: { ...r.permissions, [module]: !r.permissions[module] } };
    }));
  };

  const roleAccentColors: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', darkBg: 'dark:bg-slate-900/50', darkText: 'dark:text-slate-400' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-400' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-400' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-400' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-400' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', darkBg: 'dark:bg-cyan-900/30', darkText: 'dark:text-cyan-400' },
  };

  if (!mounted) return null;

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Loading security roles and policy configurations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Shield className="w-6 h-6" /> Role Management
          </h1>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
            <Users className="w-3 h-3" /> {roles.reduce((s, r) => s + r.count, 0)} Total Users
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowMatrix(!showMatrix)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showMatrix ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
              {showMatrix ? 'Hide Permissions Matrix' : 'Show Permissions Matrix'}
            </button>
          </div>
          <button className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition-all flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add New Role
          </button>
        </div>

        {showMatrix && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700 overflow-x-auto">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4">Permissions Matrix</h3>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="px-3 py-2 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role / Module</th>
                  {MODULES.map(m => (
                    <th key={m} className="px-3 py-2 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {roles.map(role => {
                  const ac = roleAccentColors[role.accent];
                  return (
                    <tr key={role.name} className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className={`px-3 py-2.5 font-bold text-xs ${ac.text}`}>{role.name}</td>
                      {MODULES.map(m => (
                        <td key={m} className="px-3 py-2.5 text-center">
                          <button onClick={() => togglePermission(role.name, m)} className="transition-all hover:scale-110">
                            {role.permissions[m] ? (
                              <ToggleRight className={`w-4 h-4 ${ac.text} mx-auto`} />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-300 dark:text-slate-600 mx-auto" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {roles.length === 0 && !rolesLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
            <Shield className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No roles found</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Add a new role to get started.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, i) => {
            const ac = roleAccentColors[role.accent];
            const allowedModules = MODULES.filter(m => role.permissions[m]);
            const isExpanded = expandedRole === role.name;
            return (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md`}
              >
                <div className={`bg-gradient-to-r ${role.color} px-6 py-5`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-base">{role.name}</h3>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-white text-[10px] font-bold backdrop-blur-sm">
                      {role.count} users
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {allowedModules.slice(0, isExpanded ? allowedModules.length : 5).map(m => (
                      <span key={m} className={`text-[9px] font-bold px-2 py-1 rounded-md ${ac.bg} ${ac.text} ${ac.border} border ${ac.darkBg} ${ac.darkText}`}>
                        {m}
                      </span>
                    ))}
                    {!isExpanded && allowedModules.length > 5 && (
                      <button onClick={() => setExpandedRole(role.name)} className="text-[9px] font-bold px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-500 border border-gray-200 dark:border-slate-600">
                        +{allowedModules.length - 5}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : role.name)}
                    className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 dark:text-slate-500 py-2 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {isExpanded ? <><ChevronUp className="w-3 h-3" /> Show Less</> : <><ChevronDown className="w-3 h-3" /> Show All Permissions</>}
                  </button>
                  <div className="mt-3 flex gap-2">
                    <button className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${ac.bg} ${ac.text} border ${ac.border} ${ac.darkBg} ${ac.darkText} hover:brightness-95`}>
                      <Settings className="w-3 h-3 inline mr-1" /> Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
