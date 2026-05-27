'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Lock, Mail, ArrowRight, Eye, EyeOff, User, Phone, MapPin, ArrowLeft,
  FileText, Check, Building2, CreditCard, Upload, Loader2, AlertCircle,
  ScanLine, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';
import { HumanVerification } from '@/components/HumanVerification';
import { AuthSettings } from '@/components/AuthSettings';

type Step = 1 | 2 | 3;

export default function PartnerRegister() {
  const { user, login, refreshUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  // If user already has an organization (returning to add documents), skip to step 3
  useEffect(() => {
    if (!user) return;
    fetch('/api/organizations/mine')
      .then(res => res.json())
      .then(data => {
        if (data?.id) {
          setOrgId(data.id);
          if (data?.status === 'pending' || data?.status === 'rejected') {
            setStep(3);
            if (data.documents?.length > 0) setUploaded(true);
          }
        }
      })
      .catch(() => {})
      .catch(() => {})
    .finally(() => setInitializing(false));
  }, [user]);

  // If not logged in, stop initializing so the form shows
  useEffect(() => {
    if (!user) setInitializing(false);
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Step 2: Business
  const [orgName, setOrgName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [address, setAddress] = useState('');

  // Step 3: Documents
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('business_license');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const validateStep1 = () => {
    if (!name || !email || !password) { setError('Vui lòng điền đầy đủ họ tên, email và mật khẩu'); return false; }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return false; }
    if (!isVerified) { setError('Vui lòng xác thực bạn không phải robot'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!orgName) { setError('Vui lòng nhập tên doanh nghiệp'); return false; }
    if (!taxCode) { setError('Vui lòng nhập mã số thuế'); return false; }
    return true;
  };

  const handleNext = async () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
      return;
    }
    if (step === 2 && validateStep2()) {
      setLoading(true);
      try {
        const res = await fetch('/api/partners/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, organizationName: orgName, taxCode, address }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Đăng ký thất bại'); setLoading(false); return; }
        setOrgId(data.organization.id);
        await refreshUser();
        setStep(3);
      } catch (err: any) { setError(err.message || 'Lỗi kết nối'); }
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep((step - 1) as Step);
    else router.push('/partner/login');
  };

  const handleUpload = async () => {
    if (!docFile || !orgId) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      formData.append('type', docType);
      formData.append('organizationId', orgId);
      const res = await fetch('/api/organizations/documents/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload thất bại');
      setUploaded(true);
    } catch (err: any) { setError(err.message); }
    setUploading(false);
  };

  const handleFinish = () => {
    router.push('/partner');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden px-4 transition-colors duration-300">
      <DynamicBackground />
      <AuthSettings />

      <Link href="/partner/login" className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 hover:-translate-x-1 duration-200 z-50 select-none">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 dark:bg-emerald-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                step > s ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' :
                'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 rounded-[2.5rem] shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-4 shadow-lg">
                    <User className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Đăng ký đối tác</h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Bước 1: Thông tin tài khoản</p>
                </div>

                {error && <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">{error}</div>}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="Nguyễn Văn A" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Email doanh nghiệp</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="buyer@bigc.vn" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-11 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 hover:text-gray-500">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="090 123 4567" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <HumanVerification onVerify={setIsVerified} />
                  </div>
                </div>

                <button onClick={handleNext} disabled={loading} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/30 uppercase tracking-wider text-sm disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-4 shadow-lg">
                    <Building2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Thông tin doanh nghiệp</h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Bước 2: Thẩm định pháp lý (KYB)</p>
                </div>

                {error && <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">{error}</div>}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Tên doanh nghiệp *</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type="text" required value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="Công ty TNHH Big C" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Mã số thuế *</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type="text" required value={taxCode} onChange={e => setTaxCode(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="0123456789" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Địa chỉ trụ sở</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600" />
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm" placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleBack} className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-sm flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Quay lại
                  </button>
                  <button onClick={handleNext} disabled={loading} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/30 uppercase tracking-wider text-sm disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Đăng ký ngay <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-4 shadow-lg">
                    <FileText className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Tải hồ sơ pháp lý</h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Bước 3: Giấy tờ thẩm định</p>
                </div>

                {error && <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">{error}</div>}

                {uploaded ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2">Đã gửi hồ sơ thành công!</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                      Hồ sơ của bạn đang chờ được thẩm định. Chúng tôi sẽ gửi email thông báo khi có kết quả.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400 text-left mb-6">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Trạng thái hồ sơ: Chờ duyệt</strong>
                          <p className="mt-1 text-amber-600/80 dark:text-amber-500/80">Bạn có thể bổ sung thêm giấy tờ sau nếu cần.</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleFinish} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl transition-all shadow-xl hover:shadow-emerald-500/30 uppercase tracking-wider text-sm">
                      Vào cổng đối tác
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1">Loại giấy tờ</label>
                      <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-3.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm">
                        <option value="business_license">Giấy phép đăng ký kinh doanh</option>
                        <option value="tax_certificate">Mã số thuế / Giấy chứng nhận ĐKKD</option>
                        <option value="authorization_letter">Giấy ủy quyền người đại diện</option>
                        <option value="contract">Hợp đồng hợp tác</option>
                        <option value="other">Giấy tờ khác</option>
                      </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                      {docFile ? (
                        <div className="space-y-2">
                          <FileText className="w-8 h-8 mx-auto text-emerald-500" />
                          <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{docFile.name}</p>
                          <p className="text-[10px] text-gray-400">{(docFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600" />
                          <p className="text-sm font-bold text-gray-500 dark:text-slate-400">Nhấn để chọn file</p>
                          <p className="text-[10px] text-gray-400">Hỗ trợ PDF, JPG, PNG (tối đa 10MB)</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button onClick={handleBack} className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-sm flex items-center justify-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Quay lại
                      </button>
                      <button onClick={handleUpload} disabled={!docFile || uploading} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/30 uppercase tracking-wider text-sm disabled:opacity-50">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Đang tải lên...' : 'Tải lên & Hoàn tất'}
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mt-4">
                      Bạn cũng có thể hoàn tất sau trong trang quản lý hồ sơ
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
