'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Send, MessageSquare, Cpu, Save, Loader2, Key, Info, 
  HelpCircle, Bell, Sparkles, Plus, Trash2, Edit3, Check, Globe, 
  AlertTriangle, Slack, Eye, EyeOff, Leaf, ShieldAlert, DollarSign, 
  Award, Percent, Lock, RefreshCw
} from 'lucide-react';
import { useGlobal } from '@/app/providers';

const TABS = [
  { id: 'bank', label: 'Tài khoản ngân hàng', icon: CreditCard },
  { id: 'notifications', label: 'Tích hợp kênh báo', icon: Bell },
  { id: 'ai', label: 'Model AI Engine', icon: Cpu },
  { id: 'esg', label: 'Chỉ số ESG & Carbon', icon: Leaf },
  { id: 'billing', label: 'Phí & Hoa hồng', icon: DollarSign },
  { id: 'security', label: 'Bảo mật & Anti-Fraud', icon: Lock },
];

const AI_PROVIDERS = [
  { id: 'openai', label: 'OpenAI (GPT)', color: 'from-emerald-600 to-teal-700', desc: 'Động cơ chính từ OpenAI' },
  { id: 'claude', label: 'Anthropic Claude', color: 'from-amber-600 to-orange-700', desc: 'Xử lý logic, đàm thoại sâu' },
  { id: 'gemini', label: 'Google Gemini', color: 'from-blue-600 to-indigo-700', desc: 'Tốc độ cao, ngữ cảnh lớn' },
  { id: 'deepseek', label: 'DeepSeek', color: 'from-sky-700 to-blue-800', desc: 'Mô hình giá rẻ chất lượng cao' },
  { id: 'grok', label: 'xAI Grok', color: 'from-slate-700 to-slate-900', desc: 'Đồng bộ dữ liệu thời gian thực' },
  { id: 'kimi', label: 'Moonshot Kimi', color: 'from-cyan-600 to-teal-800', desc: 'Đọc tài liệu, phân tích dài' },
  { id: 'openrouter', label: 'OpenRouter', color: 'from-purple-600 to-pink-700', desc: 'Cổng kết nối hàng trăm LLMs' },
  { id: 'custom', label: 'Custom Endpoint', color: 'from-gray-600 to-slate-800', desc: 'Máy chủ AI nội bộ / OpenAI-compatible' },
];

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  branch: string;
  transfer_template: string;
  is_active: boolean;
}

export default function AdminSettings() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('bank');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Show/hide API Key
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // 1. Bank State
  const [banksList, setBanksList] = useState<BankAccount[]>([]);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);

  // 2. Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    integrations: {
      telegram: { enabled: false, bot_token: '', chat_id: '' },
      zalo: { enabled: false, oa_id: '', access_token: '' },
      discord: { enabled: false, webhook_url: '' },
      slack: { enabled: false, webhook_url: '' },
      webhook: { enabled: false, url: '', secret_token: '' }
    }
  });

  // 3. AI State
  const [aiSettings, setAiSettings] = useState({
    active_provider: 'gemini',
    providers: {
      openai: { api_key: '', model_name: 'gpt-4o', endpoint: 'https://api.openai.com/v1' },
      grok: { api_key: '', model_name: 'grok-2-1212', endpoint: 'https://api.x.ai/v1' },
      deepseek: { api_key: '', model_name: 'deepseek-chat', endpoint: 'https://api.deepseek.com/v1' },
      claude: { api_key: '', model_name: 'claude-3-5-sonnet-latest', endpoint: 'https://api.anthropic.com/v1' },
      gemini: { api_key: '', model_name: 'gemini-1.5-pro', endpoint: 'https://generativelanguage.googleapis.com/v1beta' },
      kimi: { api_key: '', model_name: 'moonshot-v1-8k', endpoint: 'https://api.moonshot.cn/v1' },
      openrouter: { api_key: '', model_name: 'google/gemini-2.5-flash', endpoint: 'https://openrouter.ai/api/v1' },
      custom: { api_key: '', model_name: 'custom-model-id', endpoint: 'https://your-custom-endpoint/v1' }
    },
    temperature: 0.7,
    max_tokens: 1000
  });

  // 4. ESG State [NEW]
  const [esgSettings, setEsgSettings] = useState({
    co2_conversion_rate: 3.6,
    points_conversion_rate: 1000,
    tier_thresholds: {
      dong: 100,
      bac: 500,
      vang: 2000,
      kimcuong: 5000
    },
    green_fund_rate: 1.5,
    green_fund_partner: 'GreenViet'
  });

  // 5. Billing State [NEW]
  const [billingSettings, setBillingSettings] = useState({
    partner_commission_rate: 10,
    service_fee: 2000,
    min_withdrawal_limit: 200000,
    auto_payout_enabled: false,
    auto_payout_threshold: 5000000
  });

  // 6. Security State [NEW]
  const [securitySettings, setSecuritySettings] = useState({
    enable_anti_fraud: true,
    risk_alert_threshold: 75,
    require_biometric_limit: 500000,
    session_timeout_days: 15,
    enable_ip_whitelist: false,
    ip_whitelist: ''
  });

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const { admin_bank, notifications, ai_model, esg_config, billing_config, security_config } = data.settings;
        
        if (admin_bank && admin_bank.banks) {
          setBanksList(admin_bank.banks);
        }
        
        if (notifications) {
          setNotificationSettings(prev => ({
            ...prev,
            integrations: {
              ...prev.integrations,
              ...notifications.integrations
            }
          }));
        }
        
        if (ai_model) {
          setAiSettings(prev => ({
            ...prev,
            active_provider: ai_model.active_provider || prev.active_provider,
            temperature: ai_model.temperature !== undefined ? ai_model.temperature : prev.temperature,
            max_tokens: ai_model.max_tokens !== undefined ? ai_model.max_tokens : prev.max_tokens,
            providers: {
              ...prev.providers,
              ...ai_model.providers
            }
          }));
        }

        if (esg_config) {
          setEsgSettings(esg_config);
        }

        if (billing_config) {
          setBillingSettings(billing_config);
        }

        if (security_config) {
          setSecuritySettings(security_config);
        }
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      setMessage({ type: 'error', text: 'Không thể tải cấu hình từ hệ thống' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBank) return;

    let newBanks = [...banksList];
    if (editingBank.id === 'new') {
      const createdBank = { ...editingBank, id: `bank-${Date.now()}` };
      newBanks.push(createdBank);
    } else {
      newBanks = newBanks.map(b => b.id === editingBank.id ? editingBank : b);
    }

    setBanksList(newBanks);
    setEditingBank(null);
    setShowBankForm(false);

    await handleSave('admin_bank', { banks: newBanks });
  };

  const handleToggleBankStatus = async (id: string, active: boolean) => {
    const updated = banksList.map(b => b.id === id ? { ...b, is_active: active } : b);
    setBanksList(updated);
    await handleSave('admin_bank', { banks: updated });
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) return;
    const filtered = banksList.filter(b => b.id !== id);
    setBanksList(filtered);
    await handleSave('admin_bank', { banks: filtered });
  };

  const handleSave = async (key: string, value: any) => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cập nhật cấu hình thành công!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Cập nhật thất bại' });
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setMessage({ type: 'error', text: 'Lỗi mạng, không thể kết nối server' });
    } finally {
      setSaving(false);
    }
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Cpu className="w-6 h-6 text-emerald-500" /> Hệ thống Cài đặt Admin
          </h1>
          <p className="text-xs text-slate-400 font-medium">Cấu hình ngân hàng, cổng thông báo, động cơ AI và các thuật toán nâng cao vận hành F.R.E.S.H.</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar Tab Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage(null);
                  setEditingBank(null);
                  setShowBankForm(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all relative ${
                  isActive 
                    ? 'bg-slate-800 dark:bg-slate-850 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeSettingTabIndicator" 
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Container */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors relative min-h-[50vh]">
            
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[32px] backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đang tải cấu hình...</span>
                </div>
              </div>
            ) : null}

            {/* Notification Toast */}
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 mb-6 rounded-2xl text-xs font-bold flex items-center gap-3 border ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* TAB 1: MULTIPLE BANKS CONFIGS */}
              {activeTab === 'bank' && (
                <motion.div
                  key="bank-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider mb-1">Cài đặt tài khoản ngân hàng</h3>
                      <p className="text-xs text-gray-400 dark:text-slate-500">Cấu hình danh sách các tài khoản ngân hàng nhận tiền chuyển khoản của Admin để khách hàng nạp ví.</p>
                    </div>
                    {!showBankForm && (
                      <button
                        onClick={() => {
                          setEditingBank({
                            id: 'new',
                            bank_name: '',
                            account_number: '',
                            account_holder: '',
                            branch: '',
                            transfer_template: 'FRESH NAP {userId}',
                            is_active: true
                          });
                          setShowBankForm(true);
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm ngân hàng
                      </button>
                    )}
                  </div>

                  {/* Bank Form Panel */}
                  {showBankForm && editingBank && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4"
                    >
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        {editingBank.id === 'new' ? 'Thêm tài khoản ngân hàng mới' : 'Chỉnh sửa tài khoản ngân hàng'}
                      </h4>

                      <form onSubmit={handleSaveBank} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Tên Ngân Hàng</label>
                            <input
                              type="text"
                              required
                              value={editingBank.bank_name}
                              onChange={e => setEditingBank({ ...editingBank, bank_name: e.target.value })}
                              placeholder="Ví dụ: Vietcombank, Techcombank..."
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Số Tài Khoản</label>
                            <input
                              type="text"
                              required
                              value={editingBank.account_number}
                              onChange={e => setEditingBank({ ...editingBank, account_number: e.target.value })}
                              placeholder="Nhập số tài khoản ngân hàng"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Chủ Tài Khoản</label>
                            <input
                              type="text"
                              required
                              value={editingBank.account_holder}
                              onChange={e => setEditingBank({ ...editingBank, account_holder: e.target.value.toUpperCase() })}
                              placeholder="Ví dụ: CONG TY FRESH"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Chi Nhánh</label>
                            <input
                              type="text"
                              value={editingBank.branch}
                              onChange={e => setEditingBank({ ...editingBank, branch: e.target.value })}
                              placeholder="Chi nhánh phát hành"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase flex items-center gap-1">
                            Cú pháp chuyển khoản
                            <span className="group relative cursor-pointer text-slate-400"><HelpCircle className="w-3 h-3" /><span className="absolute hidden group-hover:block bg-slate-850 text-white text-[9px] p-2 rounded-lg w-48 -top-12 z-20 font-medium tracking-normal text-center shadow-lg">Dùng tag &#123;userId&#125; để hệ thống tự động điền ID khách hàng.</span></span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingBank.transfer_template}
                            onChange={e => setEditingBank({ ...editingBank, transfer_template: e.target.value })}
                            placeholder="FRESH NAP {userId}"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBank(null);
                              setShowBankForm(false);
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-350 font-bold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Lưu ngân hàng
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* List Banks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banksList.length === 0 ? (
                      <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-slate-950 rounded-2xl border border-dashed border-gray-250 dark:border-slate-800">
                        <CreditCard className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-bold">Chưa cấu hình tài khoản ngân hàng nào</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Vui lòng thêm tài khoản để hiển thị cho người dùng.</p>
                      </div>
                    ) : (
                      banksList.map(bank => (
                        <div 
                          key={bank.id}
                          className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                            bank.is_active 
                              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-750 text-white shadow-md' 
                              : 'bg-white dark:bg-slate-950 border-gray-150 dark:border-slate-850 text-gray-800 dark:text-slate-400 shadow-sm'
                          }`}
                        >
                          {/* Active / Inactive Tag */}
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              bank.is_active 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-gray-100 dark:bg-slate-850 text-gray-400'
                            }`}>
                              {bank.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                            </span>
                            <div className="flex items-center z-10 gap-1">
                              <button
                                onClick={() => {
                                  setEditingBank(bank);
                                  setShowBankForm(true);
                                }}
                                className={`p-1.5 rounded-lg hover:bg-slate-800/10 transition-colors ${bank.is_active ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                                title="Sửa"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBank(bank.id)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Bank details */}
                          <div className="space-y-1 mb-4">
                            <div className={`text-xs font-black uppercase ${bank.is_active ? 'text-slate-300' : 'text-gray-500'}`}>
                              {bank.bank_name}
                            </div>
                            <div className="text-lg font-black tracking-wider font-mono">
                              {bank.account_number}
                            </div>
                            <div className={`text-[10px] font-bold ${bank.is_active ? 'text-slate-400' : 'text-gray-500'}`}>
                              CHỦ TK: <span className="uppercase">{bank.account_holder}</span>
                            </div>
                            {bank.branch && (
                              <div className="text-[9px] opacity-60 italic">
                                Chi nhánh: {bank.branch}
                              </div>
                            )}
                          </div>

                          {/* Template & Status Switch */}
                          <div className={`pt-3 border-t flex justify-between items-center ${
                            bank.is_active ? 'border-slate-700/60' : 'border-gray-100 dark:border-slate-850'
                          }`}>
                            <div className="min-w-0 flex-1 mr-2">
                              <span className="text-[8px] font-bold uppercase block opacity-60">Cú pháp nạp:</span>
                              <span className="text-[9px] font-mono font-bold truncate block">{bank.transfer_template}</span>
                            </div>
                            
                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={bank.is_active}
                                onChange={e => handleToggleBankStatus(bank.id, e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="w-9 h-5 bg-gray-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ADVANCED NOTIFICATIONS INTEGRATIONS */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider mb-1">Cài đặt kênh thông báo tích hợp</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Bật/tắt và cấu hình các công cụ gửi cảnh báo lỗi hệ thống, nhật ký nạp rút tự động và báo cáo ESG về các mạng xã hội.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave('notifications', notificationSettings);
                    }}
                    className="space-y-4"
                  >
                    {/* 1. Telegram Bot */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Send className="w-4 h-4 text-sky-500" /> Telegram Bot
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.integrations.telegram.enabled}
                            onChange={e => setNotificationSettings({
                              ...notificationSettings,
                              integrations: {
                                ...notificationSettings.integrations,
                                telegram: { ...notificationSettings.integrations.telegram, enabled: e.target.checked }
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {notificationSettings.integrations.telegram.enabled && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pt-2"
                          >
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Bot Token</label>
                              <input
                                type="password"
                                value={notificationSettings.integrations.telegram.bot_token}
                                onChange={e => setNotificationSettings({
                                  ...notificationSettings,
                                  integrations: {
                                    ...notificationSettings.integrations,
                                    telegram: { ...notificationSettings.integrations.telegram, bot_token: e.target.value }
                                  }
                                })}
                                placeholder="Nhập Telegram Bot Token"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Chat ID (Group/Channel)</label>
                              <input
                                type="text"
                                value={notificationSettings.integrations.telegram.chat_id}
                                onChange={e => setNotificationSettings({
                                  ...notificationSettings,
                                  integrations: {
                                    ...notificationSettings.integrations,
                                    telegram: { ...notificationSettings.integrations.telegram, chat_id: e.target.value }
                                  }
                                })}
                                placeholder="Ví dụ: -100123456789"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 2. Zalo OA */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" /> Zalo Official Account (OA)
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.integrations.zalo.enabled}
                            onChange={e => setNotificationSettings({
                              ...notificationSettings,
                              integrations: {
                                ...notificationSettings.integrations,
                                zalo: { ...notificationSettings.integrations.zalo, enabled: e.target.checked }
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {notificationSettings.integrations.zalo.enabled && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pt-2"
                          >
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Official Account ID</label>
                              <input
                                type="text"
                                value={notificationSettings.integrations.zalo.oa_id}
                                onChange={e => setNotificationSettings({
                                  ...notificationSettings,
                                  integrations: {
                                    ...notificationSettings.integrations,
                                    zalo: { ...notificationSettings.integrations.zalo, oa_id: e.target.value }
                                  }
                                })}
                                placeholder="Nhập ID Zalo OA"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Access Token</label>
                              <input
                                type="password"
                                value={notificationSettings.integrations.zalo.access_token}
                                onChange={e => setNotificationSettings({
                                  ...notificationSettings,
                                  integrations: {
                                    ...notificationSettings.integrations,
                                    zalo: { ...notificationSettings.integrations.zalo, access_token: e.target.value }
                                  }
                                })}
                                placeholder="Nhập Token truy cập Zalo OA"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 3. Discord Webhook */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-500" /> Discord Webhook
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.integrations.discord.enabled}
                            onChange={e => setNotificationSettings({
                              ...notificationSettings,
                              integrations: {
                                ...notificationSettings.integrations,
                                discord: { ...notificationSettings.integrations.discord, enabled: e.target.checked }
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {notificationSettings.integrations.discord.enabled && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pt-2"
                          >
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Discord Webhook URL</label>
                            <input
                              type="text"
                              value={notificationSettings.integrations.discord.webhook_url}
                              onChange={e => setNotificationSettings({
                                ...notificationSettings,
                                integrations: {
                                  ...notificationSettings.integrations,
                                  discord: { ...notificationSettings.integrations.discord, webhook_url: e.target.value }
                                }
                              })}
                              placeholder="https://discord.com/api/webhooks/..."
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 4. Slack Webhook */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Slack className="w-4 h-4 text-pink-600" /> Slack Integration
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.integrations.slack.enabled}
                            onChange={e => setNotificationSettings({
                              ...notificationSettings,
                              integrations: {
                                ...notificationSettings.integrations,
                                slack: { ...notificationSettings.integrations.slack, enabled: e.target.checked }
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {notificationSettings.integrations.slack.enabled && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pt-2"
                          >
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Slack Incoming Webhook URL</label>
                            <input
                              type="text"
                              value={notificationSettings.integrations.slack.webhook_url}
                              onChange={e => setNotificationSettings({
                                ...notificationSettings,
                                integrations: {
                                  ...notificationSettings.integrations,
                                  slack: { ...notificationSettings.integrations.slack, webhook_url: e.target.value }
                                }
                              })}
                              placeholder="https://hooks.slack.com/services/..."
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 5. Custom Webhook */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-500" /> Custom Webhook (HTTP POST)
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notificationSettings.integrations.webhook.enabled}
                            onChange={e => setNotificationSettings({
                              ...notificationSettings,
                              integrations: {
                                ...notificationSettings.integrations,
                                webhook: { ...notificationSettings.integrations.webhook, enabled: e.target.checked }
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {notificationSettings.integrations.webhook.enabled && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pt-2"
                          >
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Target URL Endpoint</label>
                              <input
                                type="text"
                                value={notificationSettings.integrations.webhook.url}
                                onChange={e => setNotificationSettings({
                                  ...notificationSettings,
                                  integrations: {
                                    ...notificationSettings.integrations,
                                    webhook: { ...notificationSettings.integrations.webhook, url: e.target.value }
                                  }
                                })}
                                placeholder="https://api.yourdomain.com/v1/webhook"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Secret Signature Token</label>
                              <input
                                type="password"
                                value={notificationSettings.integrations.webhook.secret_token}
                                onChange={e => setNotificationSettings({
                                  ...notificationSettings,
                                  integrations: {
                                    ...notificationSettings.integrations,
                                    webhook: { ...notificationSettings.integrations.webhook, secret_token: e.target.value }
                                  }
                                })}
                                placeholder="Nhập Secret Signature Token"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu tất cả kênh thông báo
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 3: ADVANCED AI MODEL CONFIGS */}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Động cơ Trí tuệ Nhân tạo F.R.E.S.H.
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Chọn nhà cung cấp dịch vụ LLMs chủ lực, cấu hình khóa API tương ứng và các tham số sáng tạo để vận hành hệ sinh thái chatbot AI & định giá.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave('ai_model', aiSettings);
                    }}
                    className="space-y-6"
                  >
                    {/* Grid Providers Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-3 block uppercase">Chọn AI Engine Chủ Lực</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {AI_PROVIDERS.map(provider => {
                          const isSelected = aiSettings.active_provider === provider.id;
                          return (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => setAiSettings({ ...aiSettings, active_provider: provider.id })}
                              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden select-none cursor-pointer h-28 ${
                                isSelected
                                  ? `bg-gradient-to-br ${provider.color} text-white border-transparent shadow-md scale-[1.02]`
                                  : 'bg-white dark:bg-slate-950 border-gray-150 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-800 dark:text-slate-400 shadow-sm'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-black text-xs uppercase tracking-wide">{provider.label}</span>
                                {isSelected && (
                                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <span className={`text-[9px] mt-2 block leading-normal ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                {provider.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Provider Configurations Form */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-500" />
                        Cấu hình cho {AI_PROVIDERS.find(p => p.id === aiSettings.active_provider)?.label}
                      </h4>

                      <div className="space-y-4">
                        {/* API KEY */}
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">API Access Key</label>
                          <div className="relative">
                            <input
                              type={showApiKeys[aiSettings.active_provider] ? 'text' : 'password'}
                              required={aiSettings.active_provider !== 'custom'}
                              value={(aiSettings.providers as any)[aiSettings.active_provider]?.api_key || ''}
                              onChange={e => {
                                const currentProv = (aiSettings.providers as any)[aiSettings.active_provider];
                                setAiSettings({
                                  ...aiSettings,
                                  providers: {
                                    ...aiSettings.providers,
                                    [aiSettings.active_provider]: {
                                      ...currentProv,
                                      api_key: e.target.value
                                    }
                                  }
                                });
                              }}
                              placeholder={`Nhập API Key cho ${aiSettings.active_provider}`}
                              className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => toggleApiKeyVisibility(aiSettings.active_provider)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                              {showApiKeys[aiSettings.active_provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Model ID & Custom Endpoint */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Model Name (ID)</label>
                            <input
                              type="text"
                              required
                              value={(aiSettings.providers as any)[aiSettings.active_provider]?.model_name || ''}
                              onChange={e => {
                                const currentProv = (aiSettings.providers as any)[aiSettings.active_provider];
                                setAiSettings({
                                  ...aiSettings,
                                  providers: {
                                    ...aiSettings.providers,
                                    [aiSettings.active_provider]: {
                                      ...currentProv,
                                      model_name: e.target.value
                                    }
                                  }
                                });
                              }}
                              placeholder="Ví dụ: gpt-4o, deepseek-reasoner, claude-3-5-sonnet..."
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Custom API Endpoint URL</label>
                            <input
                              type="text"
                              required
                              value={(aiSettings.providers as any)[aiSettings.active_provider]?.endpoint || ''}
                              onChange={e => {
                                const currentProv = (aiSettings.providers as any)[aiSettings.active_provider];
                                setAiSettings({
                                  ...aiSettings,
                                  providers: {
                                    ...aiSettings.providers,
                                    [aiSettings.active_provider]: {
                                      ...currentProv,
                                      endpoint: e.target.value
                                    }
                                  }
                                });
                              }}
                              placeholder="Ví dụ: https://api.openai.com/v1"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shared AI parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-2 block uppercase flex justify-between">
                          <span>Creativity Temperature (Độ sáng tạo)</span>
                          <span className="font-bold font-mono text-emerald-500">{aiSettings.temperature}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1.5"
                          step="0.1"
                          value={aiSettings.temperature}
                          onChange={e => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-3"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1.5">Mức thấp: logic và chính xác. Mức cao: ngôn từ bay bổng và sáng tạo hơn.</span>
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Max Tokens (Giới hạn trả lời)</label>
                        <input
                          type="number"
                          required
                          value={aiSettings.max_tokens}
                          onChange={e => setAiSettings({ ...aiSettings, max_tokens: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1.5">Giới hạn số ký tự/token tối đa mà mô hình có thể trả về cho mỗi lượt chat.</span>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu động cơ AI
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 4: ADVANCED ESG & CARBON INDEXES [NEW] */}
              {activeTab === 'esg' && (
                <motion.div
                  key="esg-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-emerald-500" /> Chỉ số ESG & Bù Đắp Carbon
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Cấu hình các hệ số quy đổi lượng phát thải giảm thiểu CO₂, tỷ lệ tặng điểm thưởng xanh của người dùng và ngân sách đầu tư quỹ môi trường.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave('esg_config', esgSettings);
                    }}
                    className="space-y-6"
                  >
                    {/* Quy đổi Carbon và Điểm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Hệ số quy đổi CO₂ (kg/1kg thực phẩm)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={esgSettings.co2_conversion_rate}
                          onChange={e => setEsgSettings({ ...esgSettings, co2_conversion_rate: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1.5">Mặc định: 3.6kg CO₂ giảm thiểu trên mỗi 1kg thực phẩm giải cứu thành công.</span>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Tỉ lệ tặng Điểm Xanh (VNĐ/1 Điểm)</label>
                        <input
                          type="number"
                          required
                          value={esgSettings.points_conversion_rate}
                          onChange={e => setEsgSettings({ ...esgSettings, points_conversion_rate: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1.5">Số tiền chi tiêu tương ứng để nhận 1 Điểm Xanh. Mặc định: 1,000đ = 1 Điểm Xanh.</span>
                      </div>
                    </div>

                    {/* Mốc Điểm Xếp Hạng (Tiers) */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500" /> Ngưỡng thăng hạng tài khoản thành viên
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Đồng (Bronze)</label>
                          <input
                            type="number"
                            required
                            value={esgSettings.tier_thresholds.dong}
                            onChange={e => setEsgSettings({
                              ...esgSettings,
                              tier_thresholds: { ...esgSettings.tier_thresholds, dong: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Bạc (Silver)</label>
                          <input
                            type="number"
                            required
                            value={esgSettings.tier_thresholds.bac}
                            onChange={e => setEsgSettings({
                              ...esgSettings,
                              tier_thresholds: { ...esgSettings.tier_thresholds, bac: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Vàng (Gold)</label>
                          <input
                            type="number"
                            required
                            value={esgSettings.tier_thresholds.vang}
                            onChange={e => setEsgSettings({
                              ...esgSettings,
                              tier_thresholds: { ...esgSettings.tier_thresholds, vang: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Kim Cương (Diamond)</label>
                          <input
                            type="number"
                            required
                            value={esgSettings.tier_thresholds.kimcuong}
                            onChange={e => setEsgSettings({
                              ...esgSettings,
                              tier_thresholds: { ...esgSettings.tier_thresholds, kimcuong: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Green Forest Fund */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase flex justify-between">
                          <span>Phần trăm trích quỹ trồng rừng xanh (%)</span>
                          <span className="font-mono text-emerald-500 font-bold">{esgSettings.green_fund_rate}%</span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.1"
                          value={esgSettings.green_fund_rate}
                          onChange={e => setEsgSettings({ ...esgSettings, green_fund_rate: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-4"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Đối tác liên kết trích quỹ xanh</label>
                        <input
                          type="text"
                          required
                          value={esgSettings.green_fund_partner}
                          onChange={e => setEsgSettings({ ...esgSettings, green_fund_partner: e.target.value })}
                          placeholder="Ví dụ: GreenViet, Gaia Forest..."
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu cấu hình ESG
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 5: BILLING AND COMMISSIONS [NEW] */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-500" /> Cài đặt Phí & Hoa Hồng Nền Tảng
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Cấu hình tỷ lệ phần trăm chiết khấu hoa hồng đối tác bán lẻ, phí xử lý dịch vụ trên mỗi đơn hàng và chính sách thanh toán tiền ví.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave('billing_config', billingSettings);
                    }}
                    className="space-y-6"
                  >
                    {/* Commissions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase flex justify-between">
                          <span>Chiết khấu hoa hồng của đối tác (%)</span>
                          <span className="font-mono text-emerald-500 font-bold">{billingSettings.partner_commission_rate}%</span>
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="25"
                          step="0.5"
                          value={billingSettings.partner_commission_rate}
                          onChange={e => setBillingSettings({ ...billingSettings, partner_commission_rate: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-4"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Phí dịch vụ khách hàng (VNĐ/đơn hàng)</label>
                        <input
                          type="number"
                          required
                          value={billingSettings.service_fee}
                          onChange={e => setBillingSettings({ ...billingSettings, service_fee: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Auto-Payout settings */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-emerald-500" /> Bật Thanh Toán Đối Tác Tự Động (Auto-Payout)
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={billingSettings.auto_payout_enabled}
                            onChange={e => setBillingSettings({ ...billingSettings, auto_payout_enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Hạn mức rút tối thiểu của đối tác (VNĐ)</label>
                          <input
                            type="number"
                            required
                            value={billingSettings.min_withdrawal_limit}
                            onChange={e => setBillingSettings({ ...billingSettings, min_withdrawal_limit: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        {billingSettings.auto_payout_enabled && (
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Ngưỡng tự động thanh toán (VNĐ)</label>
                            <input
                              type="number"
                              required
                              value={billingSettings.auto_payout_threshold}
                              onChange={e => setBillingSettings({ ...billingSettings, auto_payout_threshold: parseInt(e.target.value) })}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu cấu hình tài chính
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 6: SECURITY & FRAUD AI CONFIGS [NEW] */}
              {activeTab === 'security' && (
                <motion.div
                  key="security-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-500" /> Bảo Mật & AI Phát Hiện Gian Lận
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Cấu hình tường lửa chống gian lận nạp rút, xác thực sinh trắc học và chính sách phân quyền truy cập hệ thống của Admin.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave('security_config', securitySettings);
                    }}
                    className="space-y-6"
                  >
                    {/* Anti Fraud AI Model */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" /> Kích hoạt hệ thống AI Quét gian lận tự động (Anti-Fraud AI)
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={securitySettings.enable_anti_fraud}
                            onChange={e => setSecuritySettings({ ...securitySettings, enable_anti_fraud: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {securitySettings.enable_anti_fraud && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="space-y-3"
                        >
                          <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase flex justify-between">
                            <span>Ngưỡng điểm rủi ro để tự động khóa tài khoản (%)</span>
                            <span className="font-mono text-red-500 font-bold">{securitySettings.risk_alert_threshold}%</span>
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="95"
                            step="5"
                            value={securitySettings.risk_alert_threshold}
                            onChange={e => setSecuritySettings({ ...securitySettings, risk_alert_threshold: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-2"
                          />
                          <span className="text-[9px] text-gray-400 block mt-1">Khi AI phát hiện một giao dịch/hành động của người dùng vượt quá tỷ lệ rủi ro này, tài khoản sẽ tự động chuyển trạng thái Tạm khóa (Suspended).</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Biometric & Session Limit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Yêu cầu Sinh trắc học cho giao dịch lớn (VNĐ)</label>
                        <input
                          type="number"
                          required
                          value={securitySettings.require_biometric_limit}
                          onChange={e => setSecuritySettings({ ...securitySettings, require_biometric_limit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1.5">Giao dịch nạp/rút/thanh toán có giá trị lớn hơn hạn mức này sẽ bắt buộc xác thực sinh trắc học FaceID/Vân tay.</span>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Thời hạn duy trì phiên đăng nhập (Ngày)</label>
                        <input
                          type="number"
                          required
                          value={securitySettings.session_timeout_days}
                          onChange={e => setSecuritySettings({ ...securitySettings, session_timeout_days: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1.5">Tự động bắt buộc đăng nhập lại sau số ngày này để duy trì tính bảo mật.</span>
                      </div>
                    </div>

                    {/* IP Whitelist */}
                    <div className="bg-gray-50 dark:bg-slate-950 p-6 rounded-2xl border border-gray-150 dark:border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-500" /> Bật Giới Hạn IP Whitelist Đăng Nhập Admin
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={securitySettings.enable_ip_whitelist}
                            onChange={e => setSecuritySettings({ ...securitySettings, enable_ip_whitelist: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5.5 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <AnimatePresence>
                        {securitySettings.enable_ip_whitelist && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pt-2"
                          >
                            <label className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mb-1 block uppercase">Danh sách IP Whitelist (Cách nhau bằng dấu phẩy)</label>
                            <input
                              type="text"
                              value={securitySettings.ip_whitelist}
                              onChange={e => setSecuritySettings({ ...securitySettings, ip_whitelist: e.target.value })}
                              placeholder="Ví dụ: 127.0.0.1, 14.161.40.231"
                              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-xl font-bold text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all font-mono"
                            />
                            <span className="text-[9px] text-gray-400 block mt-1.5">Chỉ cho phép các địa chỉ IP trên truy cập vào Dashboard Quản Trị của Admin.</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu cấu hình bảo mật
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
}
