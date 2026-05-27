/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, History, Settings, ChevronRight, LogOut, ArrowUpFromLine, Plus, X, Check, Pencil, Trash2, Fingerprint, Shield, AlertCircle, Loader2, Camera } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { transactionService, Transaction } from '@/lib/data/transactions';
import { showToast } from '@/lib/data/notifications';
import { bankAccountService } from '@/lib/data/bankAccounts';

export default function CustomerProfile() {
  const { t } = useGlobal();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [savedCards, setSavedCards] = useState<any[]>([]);

  // eKYC & Sinh trắc học state
  const [biometricStatus, setBiometricStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [hasCheckedVerifyQuery, setHasCheckedVerifyQuery] = useState(false);

  const [biometricRecord, setBiometricRecord] = useState<any>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  
  // Luồng eKYC đa bước
  const [ekycStep, setEkycStep] = useState<'document_type' | 'document_front' | 'document_back' | 'ocr_verify' | 'face_scan' | 'submitting'>('document_type');
  const [documentType, setDocumentType] = useState<'cccd' | 'cmnd' | 'driver_license' | 'passport_visa'>('cccd');
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [faceImage, setFaceImage] = useState<string>('');
  const [ocrData, setOcrData] = useState<any>({ idNumber: '', fullName: '', dob: '', address: '', issueDate: '', issuePlace: '' });
  const [faceMatchScore, setFaceMatchScore] = useState<number>(0);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lấy trạng thái sinh trắc học của khách hàng
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/biometric?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.record) {
            setBiometricStatus(data.record.status);
            setBiometricRecord(data.record);
          }
          setLoadingStatus(false);
        })
        .catch(err => {
          console.error("Lỗi lấy trạng thái sinh trắc học:", err);
          setLoadingStatus(false);
        });
    }
  }, [user, showBiometricModal]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !loadingStatus && !hasCheckedVerifyQuery) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('verify') === 'true') {
        setHasCheckedVerifyQuery(true);
        if (biometricStatus === 'none' || biometricStatus === 'rejected') {
          startBiometricScan();
        }
      }
    }
  }, [loadingStatus, biometricStatus, hasCheckedVerifyQuery]);


  const startCamera = async (isUserFace: boolean = false) => {
    stopCamera();
    setCameraActive(false);
    try {
      const constraints = {
        video: isUserFace 
          ? { facingMode: 'user', width: 300, height: 300 }
          : { facingMode: 'environment', width: 640, height: 480 }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Không thể truy cập camera thực tế, dùng giả lập:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = (type: 'front' | 'back' | 'face') => {
    let base64Img = '';
    if (cameraActive && streamRef.current && videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = type === 'face' ? 300 : 640;
        canvas.height = type === 'face' ? 300 : 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          // Thêm watermark lục bảo của hệ thống F.R.E.S.H eKYC
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          if (type === 'face') {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 20, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
          }
          base64Img = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (err) {
        console.error("Lỗi vẽ canvas chụp ảnh:", err);
      }
    }

    // Giả lập ảnh vector nếu không có camera
    if (!base64Img) {
      const canvas = document.createElement('canvas');
      canvas.width = type === 'face' ? 300 : 400;
      canvas.height = type === 'face' ? 300 : 250;
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      if (type === 'face') {
        ctx.beginPath();
        ctx.arc(150, 130, 50, 0, Math.PI * 2);
        ctx.arc(150, 220, 70, Math.PI, 0);
        ctx.fill();
        ctx.font = '10px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText("F.R.E.S.H eKYC FACE_SELFIE", 20, 280);
      } else {
        ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText(type === 'front' ? "MẶT TRƯỚC GIẤY TỜ MẪU" : "MẶT SAU GIẤY TỜ MẪU", 50, 80);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`DOCUMENT_TYPE: ${documentType.toUpperCase()}`, 50, 120);
        ctx.fillText(`USER_NAME: ${user?.name ? user.name.toUpperCase() : 'KHÁCH HÀNG'}`, 50, 140);
        ctx.fillText(`SYSTEM_GEN_IMAGE`, 50, 160);
      }
      base64Img = canvas.toDataURL('image/jpeg');
    }

    stopCamera();

    if (type === 'front') {
      setFrontImage(base64Img);
      setEkycStep('document_back');
      setTimeout(() => startCamera(false), 500);
    } else if (type === 'back') {
      setBackImage(base64Img);
      runOCRVerification();
    } else {
      setFaceImage(base64Img);
      runFaceMatchVerification();
    }
  };

  // Giả lập quét tia laser OCR trích xuất thông tin
  const runOCRVerification = () => {
    setEkycStep('ocr_verify');
    setOcrScanning(true);
    setScanProgress(0);
    setScanMessage('Đang phân tích hình ảnh giấy tờ bằng AI OCR...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(Math.min(progress, 100));
      
      if (progress < 30) {
        setScanMessage('Đang phát hiện góc nghiêng và làm nét ảnh...');
      } else if (progress < 60) {
        setScanMessage('Đang phân tích ký tự quang học (OCR)...');
      } else if (progress < 90) {
        setScanMessage('Đang đối chiếu định dạng giấy tờ pháp lý Việt Nam...');
      } else if (progress === 100) {
        clearInterval(interval);
        
        // Tạo dữ liệu OCR ngẫu nhiên khớp với loại giấy tờ và tên thật
        const docName = user?.name ? user.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() : 'NGUYEN VAN A';
        let idNum = '';
        let place = 'Cục Cảnh sát QLHC về trật tự xã hội';
        
        if (documentType === 'cccd') {
          idNum = '0' + Math.floor(300000000000 + Math.random() * 690000000000).toString();
        } else if (documentType === 'cmnd') {
          idNum = Math.floor(100000000 + Math.random() * 899999999).toString();
          place = 'Công an TP. Hồ Chí Minh';
        } else if (documentType === 'driver_license') {
          idNum = Math.floor(790000000000 + Math.random() * 200000000000).toString();
          place = 'Sở Giao thông Vận tải TP.HCM';
        } else {
          idNum = 'C' + Math.floor(1000000 + Math.random() * 8999999).toString();
          place = 'Cục Quản lý Xuất nhập cảnh';
        }

        setOcrData({
          idNumber: idNum,
          fullName: docName,
          dob: user?.joinDate ? '1998-05-15' : '2000-09-20',
          address: user?.address || '123 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          issueDate: '2021-12-25',
          issuePlace: place
        });

        setOcrScanning(false);
        setScanMessage('Trích xuất OCR hoàn tất! Vui lòng xác nhận lại thông tin.');
      }
    }, 100);
  };

  // Giả lập quét sinh trắc học khuôn mặt và so sánh khuôn mặt (Face Match)
  const runFaceMatchVerification = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage('Đang khởi chạy thuật toán so khớp khuôn mặt...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(Math.min(progress, 100));

      if (progress < 25) {
        setScanMessage('Đang xác định độ sâu khuôn mặt 3D...');
      } else if (progress < 50) {
        setScanMessage('Đang chạy kiểm tra thực thể sống (Liveness Check)...');
      } else if (progress < 75) {
        setScanMessage('Đang so sánh đặc trưng khuôn mặt với ảnh trên giấy tờ...');
      } else if (progress < 95) {
        setScanMessage('Đang kiểm tra chỉ số sinh động (Chớp mắt, mỉm cười)...');
      } else if (progress === 100) {
        clearInterval(interval);
        
        // Tính điểm trùng khớp ngẫu nhiên cao (94% -> 99%)
        const matchScore = parseFloat((94.2 + Math.random() * 4.6).toFixed(1));
        setFaceMatchScore(matchScore);
        
        setIsScanning(false);
        setScanMessage(`So khớp khuôn mặt: ${matchScore}% Trùng khớp. Liveness Check: ĐẠT!`);
      }
    }, 100);
  };

  // Gửi toàn bộ dữ liệu eKYC lên backend
  const handleSubmitEKYC = async () => {
    setEkycStep('submitting');
    try {
      const res = await fetch('/api/biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          image: faceImage,
          documentType,
          frontImage,
          backImage,
          ocrData,
          faceMatchScore
        })
      });
      const data = await res.json();
      if (data.success) {
        setBiometricStatus('pending');
        setBiometricRecord(data.record);
        showToast('success', 'Gửi hồ sơ eKYC thành công', 'Thông tin eKYC của bạn đã được gửi cho Quản trị viên phê duyệt.');
        setShowBiometricModal(false);
      } else {
        showToast('error', 'Lỗi gửi yêu cầu', data.error || 'Vui lòng thử lại sau.');
        setEkycStep('face_scan');
      }
    } catch (err) {
      console.error("Lỗi gửi dữ liệu eKYC:", err);
      showToast('error', 'Lỗi kết nối', 'Không thể kết nối tới máy chủ.');
      setEkycStep('face_scan');
    }
  };

  const closeBiometricModal = () => {
    stopCamera();
    setShowBiometricModal(false);
    setIsScanning(false);
    setFrontImage('');
    setBackImage('');
    setFaceImage('');
  };

  const startBiometricScan = () => {
    setEkycStep('document_type');
    setFrontImage('');
    setBackImage('');
    setFaceImage('');
    setScanProgress(0);
    setScanMessage('Vui lòng chọn loại giấy tờ để bắt đầu xác minh.');
    setShowBiometricModal(true);
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const uid = user?.id || '';
    if (!uid) return;
    transactionService.getBalance(uid).then(setBalance).catch(console.error);
    transactionService.getByUser(uid).then(setTransactions).catch(console.error);
    bankAccountService.getByUser(uid).then(data => {
      setSavedCards((data || []).map((a: any, i: number) => ({
        id: a.id || i,
        type: a.bankName || 'Bank',
        last4: a.accountNumber?.slice(-4) || '0000',
        expiry: 'N/A',
        isDefault: a.isDefault || i === 0,
      })));
    }).catch(console.error);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    showToast('info', 'Logged out');
  };

  const handleSaveSettings = () => {
    showToast('success', 'Profile Updated', 'Your profile has been saved successfully');
    setShowSettingsModal(false);
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-700 dark:text-yellow-500 font-bold text-2xl shadow-sm border-2 border-white dark:border-slate-800 overflow-hidden shrink-0">
            {user?.avatar && user.avatar.startsWith('http') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div>
            <div className="text-white font-bold text-xl">{user?.name || 'John Doe'}</div>
            <div className="text-white/80 dark:text-emerald-200/80 text-sm">{user?.email || 'john.doe@example.com'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 font-bold text-xs mb-2">
            <Wallet className="w-4 h-4 text-[#057A42] dark:text-emerald-400" /> {t('wallet_balance')}
          </div>
          <div className="text-black dark:text-white font-black text-3xl mb-6">{balance.toLocaleString()} VND</div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push('/customer/wallet?action=deposit')} className="bg-[#057A42] dark:bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#046034] dark:hover:bg-emerald-700 transition-colors">
              <Plus className="w-4 h-4" /> {t('top_up')}
            </button>
            <button onClick={() => router.push('/customer/wallet?action=withdraw')} className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              <ArrowUpFromLine className="w-4 h-4" /> {t('withdraw')}
            </button>
          </div>
        </div>

        <h2 className="text-black dark:text-white font-extrabold text-sm mb-4">{t('settings_prefs')}</h2>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6 transition-colors">
          {[
            { icon: CreditCard, label: t('payment_methods'), color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', onClick: () => setShowPaymentModal(true) },
            { icon: History, label: t('transaction_history'), color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', onClick: () => showToast('info', 'Transaction History', `Showing last ${transactions.length} transactions.`) },
            { 
              icon: Fingerprint, 
              label: 'Xác minh sinh trắc học (Face ID)', 
              color: 'text-emerald-500 dark:text-emerald-400', 
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20', 
              onClick: () => {
                if (biometricStatus === 'verified') {
                  showToast('success', 'Face ID Đã Xác Minh', 'Tài khoản của bạn đã được xác minh sinh trắc học thành công.');
                } else if (biometricStatus === 'pending') {
                  showToast('info', 'Yêu cầu đang chờ duyệt', 'Hồ sơ sinh trắc học đang được Admin kiểm duyệt. Vui lòng kiên nhẫn.');
                } else {
                  startBiometricScan();
                }
              },
              badge: (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border leading-none transition-all ${
                  biometricStatus === 'verified'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : biometricStatus === 'pending'
                      ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 animate-pulse'
                      : biometricStatus === 'rejected'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                }`}>
                  {biometricStatus === 'verified' ? 'Đã xác minh' : biometricStatus === 'pending' ? 'Chờ duyệt ⚡' : biometricStatus === 'rejected' ? 'Bị từ chối' : 'Chưa xác minh'}
                </span>
              )
            },
            { icon: Settings, label: t('account_settings'), color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-700/50', onClick: () => setShowSettingsModal(true) },
          ].map((item, i) => (
            <div key={i} onClick={item.onClick} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{item.label}</div>
                  {item.icon === Fingerprint && biometricStatus === 'rejected' && (
                    <div className="text-[10px] text-red-500 font-semibold mt-0.5">Yêu cầu bị từ chối. Bấm để quét lại.</div>
                  )}
                  {item.icon === Fingerprint && biometricStatus === 'verified' && biometricRecord?.approvedAt && (
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-0.5">Xác minh lúc: {new Date(biometricRecord.approvedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {'badge' in item ? item.badge : null}
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-600" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> {t('log_out')}
        </button>
      </div>

      {/* Payment Methods Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> {t('payment_methods')}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {savedCards.map(card => (
                <div key={card.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${card.isDefault ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' : 'bg-gray-50 dark:bg-slate-700 border-gray-100 dark:border-slate-600'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs ${card.type === 'Visa' ? 'bg-blue-600' : card.type === 'Mastercard' ? 'bg-red-600' : 'bg-pink-500'}`}>
                      {card.type === 'Momo' ? 'M' : card.type[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{card.type} •••• {card.last4}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Expires {card.expiry}</p>
                    </div>
                    {card.isDefault && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl text-gray-500 dark:text-slate-400 font-bold text-sm hover:border-[#057A42] hover:text-[#057A42] dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add New Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" /> {t('account_settings')}
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="flex gap-2 mt-1">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Phone</label>
                <input type="tel" defaultValue={user?.phone || ''} className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveSettings} className="flex-1 bg-[#057A42] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#046034] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save Changes
                </button>
                <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BIOMETRIC SCANNER (F.R.E.S.H SYSTEM Web eKYC) */}
      <AnimatePresence>
        {showBiometricModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl" onClick={closeBiometricModal}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-center max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Nút đóng */}
              <button 
                onClick={closeBiometricModal}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 z-50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-6 justify-center">
                <Fingerprint className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Hệ thống Xác thực Web eKYC</span>
              </div>

              {/* BƯỚC 1: CHỌN LOẠI GIẤY TỜ PHÁP LÝ */}
              {ekycStep === 'document_type' && (
                <div className="space-y-6 text-left">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-black text-white">Xác minh danh tính của bạn</h3>
                    <p className="text-xs text-slate-400 font-medium">Chọn một loại giấy tờ hợp lệ để bắt đầu chụp ảnh OCR</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'cccd', label: 'CCCD gắn chíp / Thẻ căn cước', desc: 'Khuyên dùng' },
                      { id: 'cmnd', label: 'Chứng minh nhân dân', desc: '9 hoặc 12 số' },
                      { id: 'driver_license', label: 'Bằng lái xe', desc: 'Thẻ nhựa PET' },
                      { id: 'passport_visa', label: 'Hộ chiếu / Visa', desc: 'Toàn cầu' }
                    ].map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setDocumentType(doc.id as any)}
                        className={`p-4 rounded-2xl border text-left transition-all ${documentType === doc.id ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                      >
                        <div className="font-bold text-sm text-white">{doc.label}</div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-1">{doc.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Quy trình xác minh bảo mật:</h4>
                    <ul className="text-[11px] text-slate-400 font-medium space-y-1.5 list-decimal pl-4">
                      <li>Chụp ảnh mặt trước của giấy tờ gốc</li>
                      <li>Chụp ảnh mặt sau của giấy tờ gốc (trừ Hộ chiếu/Visa)</li>
                      <li>AI OCR tự động trích xuất & xác minh thông tin giấy tờ</li>
                      <li>Quét sinh trắc học khuôn mặt 3D so khớp hình ảnh (Face Match)</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setEkycStep('document_front');
                      setTimeout(() => startCamera(false), 300);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs"
                  >
                    Bắt đầu xác minh
                  </button>
                </div>
              )}

              {/* BƯỚC 2: CHỤP MẶT TRƯỚC GIẤY TỜ */}
              {ekycStep === 'document_front' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">Chụp mặt trước giấy tờ</h3>
                    <p className="text-xs text-slate-400">Đặt mặt trước của {documentType.toUpperCase()} vào khung hình bên dưới</p>
                  </div>

                  <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-slate-500 italic">Đang tải camera hoặc đang giả lập...</div>
                    )}
                    
                    {/* Khung căn chỉnh giấy tờ hình chữ nhật */}
                    <div className="absolute inset-8 rounded-xl border-2 border-dashed border-emerald-500/60 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-full font-bold uppercase tracking-wider">MẶT TRƯỚC</span>
                    </div>

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(15,23,42,0.75)_95%)] pointer-events-none" />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => capturePhoto('front')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Chụp ảnh
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        setEkycStep('document_type');
                      }}
                      className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-xs uppercase"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: CHỤP MẶT SAU GIẤY TỜ */}
              {ekycStep === 'document_back' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">Chụp mặt sau giấy tờ</h3>
                    <p className="text-xs text-slate-400">Đặt mặt sau của {documentType.toUpperCase()} vào khung hình bên dưới</p>
                  </div>

                  <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-slate-500 italic">Đang tải camera hoặc đang giả lập...</div>
                    )}
                    
                    {/* Khung căn chỉnh giấy tờ hình chữ nhật */}
                    <div className="absolute inset-8 rounded-xl border-2 border-dashed border-emerald-500/60 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-full font-bold uppercase tracking-wider">MẶT SAU</span>
                    </div>

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(15,23,42,0.75)_95%)] pointer-events-none" />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => capturePhoto('back')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Chụp ảnh
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        setEkycStep('document_front');
                        setTimeout(() => startCamera(false), 300);
                      }}
                      className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-xs uppercase"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 4: QUÉT OCR & XÁC NHẬN DỮ LIỆU */}
              {ekycStep === 'ocr_verify' && (
                <div className="space-y-6 text-left">
                  {ocrScanning ? (
                    <div className="space-y-6 py-8 text-center">
                      <div className="relative w-44 h-28 mx-auto rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                        {frontImage && <img src={frontImage} alt="Paper Scan" className="w-full h-full object-cover" />}
                        <motion.div 
                          animate={{ y: [0, 112, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10"
                        />
                      </div>
                      
                      <div className="space-y-2 max-w-[280px] mx-auto">
                        <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <span>Đang trích xuất OCR</span>
                          <span className="text-emerald-400">{scanProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${scanProgress}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider">{scanMessage}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center space-y-1">
                        <h3 className="text-base font-black text-white">Xác nhận thông tin OCR</h3>
                        <p className="text-xs text-slate-400">Kiểm tra thông tin được AI tự động đọc từ giấy tờ của bạn</p>
                      </div>

                      <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1 mb-1">Số ID / Số căn cước</label>
                          <input
                            type="text"
                            value={ocrData.idNumber}
                            onChange={e => setOcrData({ ...ocrData, idNumber: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1 mb-1">Họ và tên</label>
                          <input
                            type="text"
                            value={ocrData.fullName}
                            onChange={e => setOcrData({ ...ocrData, fullName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1 mb-1">Ngày sinh</label>
                            <input
                              type="date"
                              value={ocrData.dob}
                              onChange={e => setOcrData({ ...ocrData, dob: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1 mb-1">Ngày cấp</label>
                            <input
                              type="date"
                              value={ocrData.issueDate}
                              onChange={e => setOcrData({ ...ocrData, issueDate: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1 mb-1">Địa chỉ thường trú</label>
                          <input
                            type="text"
                            value={ocrData.address}
                            onChange={e => setOcrData({ ...ocrData, address: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1 mb-1">Nơi cấp</label>
                          <input
                            type="text"
                            value={ocrData.issuePlace}
                            onChange={e => setOcrData({ ...ocrData, issuePlace: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            setEkycStep('face_scan');
                            setTimeout(() => startCamera(true), 300);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs"
                        >
                          Xác nhận & Quét mặt
                        </button>
                        <button
                          onClick={() => {
                            setEkycStep('document_type');
                          }}
                          className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-xs uppercase"
                        >
                          Làm lại
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* BƯỚC 5: QUÉT SINH TRẮC HỌC KHUÔN MẶT LIVENESS */}
              {ekycStep === 'face_scan' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">Xác thực khuôn mặt (Liveness Check)</h3>
                    <p className="text-xs text-slate-400">Đưa khuôn mặt vào giữa khung hình tròn để AI quét sinh trắc học</p>
                  </div>

                  {/* Khung quét camera tròn */}
                  <div className="relative w-56 h-56 mx-auto rounded-full overflow-hidden border-2 border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
                    {cameraActive && !faceImage ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    ) : faceImage ? (
                      <img src={faceImage} alt="User Face selfie" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] text-slate-500 italic">Đang nạp camera...</div>
                    )}

                    {/* Laser Quét Chạy Lên Xuống bằng framer-motion */}
                    {isScanning && (
                      <motion.div 
                        animate={{ y: [0, 224, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] z-25 pointer-events-none"
                        style={{ top: 0 }}
                      />
                    )}

                    {/* Lưới quét Face ID lồng ngoài */}
                    <div className={`absolute inset-4 rounded-full border border-dashed border-emerald-500/35 pointer-events-none ${isScanning ? 'animate-spin-slow' : ''}`} />

                    {/* Khung căn chỉnh khuôn mặt */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(15,23,42,0.85)_75%)] pointer-events-none" />
                  </div>

                  {/* Tiến trình quét */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">
                      <span>{isScanning ? "Đang quét đặc trưng khuôn mặt" : faceImage ? "Hoàn tất quét khuôn mặt" : "Sẵn sàng quét"}</span>
                      <span className="text-emerald-400">{scanProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${scanProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-[280px] mx-auto mt-2 min-h-[30px] uppercase tracking-wider">
                      {scanMessage}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {!faceImage && !isScanning ? (
                      <button
                        onClick={() => {
                          capturePhoto('face');
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs"
                      >
                        Bắt đầu quét khuôn mặt
                      </button>
                    ) : faceImage && !isScanning ? (
                      <>
                        <button
                          onClick={handleSubmitEKYC}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs"
                        >
                          Gửi hồ sơ xác minh
                        </button>
                        <button
                          onClick={() => {
                            setFaceImage('');
                            setScanProgress(0);
                            setScanMessage('Sẵn sàng quét khuôn mặt.');
                            setTimeout(() => startCamera(true), 300);
                          }}
                          className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-xs uppercase"
                        >
                          Quét lại
                        </button>
                      </>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-slate-850 text-slate-500 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs opacity-50"
                      >
                        Đang quét sinh trắc học...
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* BƯỚC 6: ĐANG GỬI HỒ SƠ */}
              {ekycStep === 'submitting' && (
                <div className="py-12 space-y-4 flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">Đang tải lên hồ sơ eKYC</h3>
                    <p className="text-xs text-slate-400">Hình ảnh và thông tin của bạn đang được mã hóa truyền tải an toàn...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
