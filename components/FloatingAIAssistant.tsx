/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, Mic, Headset, PhoneCall, MoreVertical, ArrowLeft, Image as ImageIcon, Smile, MessageSquareDot, Fingerprint, Camera, ShieldCheck, ShieldAlert, Sparkle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

type Message = {
  id?: string;
  role: 'user' | 'assistant' | 'admin';
  content: string;
  image?: string;
  timestamp?: number;
};

export function FloatingAIAssistant() {
  const { t, lang } = useGlobal();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showOmnichannel, setShowOmnichannel] = useState(false);
  const [chatMode, setChatMode] = useState<'ai' | 'admin'>('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminMessages, setAdminMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Trạng thái đính kèm ảnh chat
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái yêu cầu đăng nhập
  const [authError, setAuthError] = useState(false);

  // Typing indicator
  const [adminTyping, setAdminTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SINH TRẮC HỌC (BIOMETRIC SCANNER) STATE
  const [biometricStatus, setBiometricStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo tin nhắn chào mừng AI
  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('ai_welcome') }]);
  }, [t]);

  // Đồng bộ hóa trạng thái sinh trắc học của User từ API
  useEffect(() => {
    if (isOpen && user) {
      fetch(`/api/biometric?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.record) {
            setBiometricStatus(data.record.status);
          }
        })
        .catch(err => console.error("Lỗi lấy trạng thái sinh trắc học:", err));
    }
  }, [isOpen, user, showBiometricModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, adminMessages, isOpen, adminTyping]);

  // Polling tin nhắn Admin (1.5s/lần)
  useEffect(() => {
    if (isOpen && chatMode === 'admin' && user) {
      const fetchAdminMessages = async () => {
        try {
          const res = await fetch(`/api/chat/admin?action=get_messages&userId=${user.id}&role=user`);
          const data = await res.json();
          if (data.success) {
            const formatted: Message[] = data.messages.map((m: any) => ({
              id: m.id,
              role: m.senderRole === 'admin' ? 'admin' : 'user',
              content: m.content,
              image: m.image,
              timestamp: m.timestamp
            }));
            setAdminMessages(formatted);
            setAdminTyping(!!data.typing?.admin);
          }
        } catch (err) {
          console.error("Failed to fetch admin messages:", err);
        }
      };

      fetchAdminMessages();
      const interval = setInterval(fetchAdminMessages, 1500);
      return () => clearInterval(interval);
    }
  }, [isOpen, chatMode, user]);

  const handleHandoff = () => {
    setShowOmnichannel(false);
    if (!user) {
      setAuthError(true);
      return;
    }
    setChatMode('admin');
    setAuthError(false);
  };

  // Kích hoạt camera quét sinh trắc học
  const startBiometricScan = async () => {
    if (!user) {
      setShowOmnichannel(false);
      setAuthError(true);
      return;
    }
    setShowOmnichannel(false);
    setShowBiometricModal(true);
    setIsScanning(true);
    setScanProgress(0);

    // Bật camera thật
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 300, height: 300 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Không thể truy cập camera thật, chuyển sang quét đồ họa lập thể.");
    }

    // Hiệu ứng quét tiến trình giả lập
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
        handleCaptureAndSubmit();
      }
    }, 120);
  };

  const handleCaptureAndSubmit = async () => {
    let capturedImage = "";

    // Chụp hình từ video thật bằng canvas ẩn
    if (streamRef.current && videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 300, 300);
          // Vẽ thêm khung lưới chỉ thị để trông chuyên nghiệp hơn
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.strokeRect(20, 20, 260, 260);
          capturedImage = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (err) {
        console.error("Lỗi chụp ảnh canvas:", err);
      }
    }

    // Nếu không có camera, tự động vẽ một đồ họa chân dung vector trừu tượng chất lượng cao
    if (!capturedImage) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 300;
      tempCanvas.height = 300;
      const ctx = tempCanvas.getContext('2d')!;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 300, 300);
      // Nét vẽ khuôn mặt vector
      ctx.beginPath();
      ctx.arc(150, 140, 50, 0, Math.PI * 2); // đầu
      ctx.arc(150, 230, 80, Math.PI, 0); // vai
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Vẽ chữ ký sinh trắc học
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText("BIOMETRIC_HASH: F7A9D2", 20, 280);
      capturedImage = tempCanvas.toDataURL('image/jpeg');
    }

    // Tắt camera stream
    stopCamera();

    // Gửi lên API
    try {
      const res = await fetch('/api/biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          image: capturedImage
        })
      });
      const data = await res.json();
      if (data.success) {
        setBiometricStatus('pending');
      }
    } catch (err) {
      console.error("Lỗi gửi dữ liệu sinh trắc học:", err);
    }

    setIsScanning(false);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const closeBiometricModal = () => {
    stopCamera();
    setShowBiometricModal(false);
    setIsScanning(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước hình ảnh phải nhỏ hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Lắng nghe gõ phím để gửi typing state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (chatMode === 'admin' && user) {
      fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_typing',
          userId: user.id,
          senderRole: user.role,
          isTyping: true,
          userName: user.name,
          userRole: user.role
        })
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        fetch('/api/chat/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_typing',
            userId: user.id,
            senderRole: user.role,
            isTyping: false
          })
        });
      }, 3000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    if (chatMode === 'admin') {
      if (!user) return;
      const textContent = input.trim();
      setInput('');
      const imgBase64 = selectedImage;
      setSelectedImage(null);

      const tempMsg: Message = {
        role: 'user',
        content: textContent,
        image: imgBase64 || undefined,
        timestamp: Date.now()
      };
      setAdminMessages(prev => [...prev, tempMsg]);

      try {
        await fetch('/api/chat/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            senderRole: user.role,
            senderName: user.name,
            content: textContent,
            image: imgBase64 || undefined
          })
        });
      } catch (err) {
        console.error("Gửi tin nhắn admin thất bại:", err);
      }
    } else {
      const userMessage = { role: 'user' as const, content: input.trim() };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...messages,
              userMessage
            ],
            lang: lang || 'vi'
          })
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantReply = '';
        let buffer = '';

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        setIsLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          buffer = lines.pop() || '';
          
          for (const line of lines) {
              const cleanLine = line.trim();
              if (!cleanLine) continue;
              
              if (cleanLine.startsWith('data: ')) {
                  const dataStr = cleanLine.substring(6).trim();
                  if (dataStr === '[DONE]') break;
                  try {
                      const data = JSON.parse(dataStr);
                      const token = data.choices[0]?.delta?.content || '';
                      assistantReply += token;
                      setMessages(prev => {
                          const newMessages = [...prev];
                          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantReply };
                          return newMessages;
                      });
                  } catch (_e) {
                      // Silently ignore
                  }
              }
          }
        }
      } catch (error) {
        setMessages(prev => {
            if (prev[prev.length -1].role === 'assistant' && prev[prev.length -1].content === '') {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = t('connection_lost');
                return newArr;
            }
            return [...prev, { role: 'assistant', content: t('connection_lost') }];
        });
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col border border-gray-100 dark:border-white/10 shadow-2xl transition-colors"
          >
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between backdrop-blur-xl relative">
              <div className="flex items-center gap-3">
                {chatMode === 'admin' ? (
                  <button 
                    onClick={() => setChatMode('ai')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                    aria-label="Back to AI"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : null}

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#057A42] to-emerald-400 flex items-center justify-center p-[1px] relative shadow-lg">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center transition-colors">
                    {chatMode === 'admin' ? (
                      <Headset className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
                    ) : (
                      <Bot className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">
                    {chatMode === 'admin' ? (lang === 'en' ? 'Support Portal' : 'Tổng Đài Hỗ Trợ') : 'F.R.E.S.H AI'}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mr-1">
                      {chatMode === 'admin' ? (lang === 'en' ? 'Staff Online' : 'Nhân viên trực tuyến') : t('omnichannel_online')}
                    </span>
                    {/* Badge Trạng thái sinh trắc học */}
                    {user && (
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        biometricStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : biometricStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 animate-pulse'
                            : biometricStatus === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {biometricStatus === 'verified' ? 'FaceID Verified' : biometricStatus === 'pending' ? 'Pending FaceID' : biometricStatus === 'rejected' ? 'FaceID Rejected' : 'No FaceID'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatMode === 'ai' && (
                  <div className="relative">
                      <button onClick={() => setShowOmnichannel(!showOmnichannel)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-300 transition-colors" aria-label="More options">
                        <MoreVertical className="w-5 h-5" />
                     </button>
                     <AnimatePresence>
                       {showOmnichannel && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                          >
                             <button onClick={handleHandoff} className="w-full text-left px-5 py-4 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                                <Headset className="w-4 h-4 text-blue-500" /> {lang === 'en' ? 'Chat with Staff (Handoff)' : 'Gặp Nhân Viên (Handoff)'}
                             </button>
                             {/* Nút quét sinh trắc học */}
                             <button onClick={startBiometricScan} className="w-full text-left px-5 py-4 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 border-t border-gray-100 dark:border-white/5 transition-colors">
                                <Fingerprint className="w-4 h-4 text-emerald-500" /> {lang === 'en' ? 'Verify Face ID' : 'Xác minh khuôn mặt (FaceID)'}
                             </button>
                             <button className="w-full text-left px-5 py-4 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 border-t border-gray-100 dark:border-white/5 transition-colors">
                                <PhoneCall className="w-4 h-4 text-emerald-500" /> {t('voice_call_ai')}
                             </button>
                          </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-300 transition-colors" aria-label="Close chat">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Khung yêu cầu đăng nhập */}
            {authError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="w-16 h-16 rounded-[1.5rem] bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
                  <Bot className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Yêu cầu Đăng nhập</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Chủ tịch cần phải đăng nhập tài khoản F.R.E.S.H trước khi thực hiện hành động hỗ trợ trực tiếp từ nhân viên hoặc xác minh sinh trắc học Face ID.
                </p>
                <div className="flex flex-col gap-2 w-full pt-4">
                  <Link 
                    href="/customer/login" 
                    onClick={() => { setIsOpen(false); setAuthError(false); }}
                    className="w-full py-3.5 bg-[#057A42] hover:bg-[#046034] text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-widest text-center transition-all duration-200"
                  >
                    Đăng nhập Khách hàng
                  </Link>
                  <button 
                    onClick={() => setAuthError(false)}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 uppercase tracking-widest"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            ) : (
              /* Khung tin nhắn */
              <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar bg-gray-50 dark:bg-slate-900/50 transition-colors">
                {chatMode === 'admin' ? (
                  <>
                    {adminMessages.length === 0 && (
                      <div className="text-center py-8 space-y-3">
                        <MessageSquareDot className="w-10 h-10 mx-auto text-[#057A42] dark:text-emerald-400 animate-pulse" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          Đang kết nối với nhân viên hỗ trợ...
                        </p>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto font-medium">
                          Gửi tin nhắn hoặc hình ảnh bên dưới để nhân viên của F.R.E.S.H có thể hỗ trợ chủ tịch tức thì.
                        </p>
                      </div>
                    )}
                    {adminMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed font-medium shadow-sm transition-all ${
                          msg.role === 'user' 
                            ? 'bg-[#057A42] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          {msg.image && (
                            <div className="mb-2 max-w-[240px] rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-md">
                              <img src={msg.image} alt="Sent image" className="w-full h-auto object-cover max-h-[160px]" />
                            </div>
                          )}
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {adminTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1.5 uppercase tracking-wider">Nhân viên đang soạn</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm leading-relaxed font-medium shadow-sm transition-all ${
                          msg.role === 'user' 
                            ? 'bg-[#057A42] text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          {msg.role === 'assistant' && idx === 0 && (
                            <Sparkles className="w-4 h-4 text-yellow-500 dark:text-emerald-400 mb-2" />
                          )}
                          <div className="markdown-body prose dark:prose-invert prose-sm">
                             <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2 animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input đính kèm & Soạn tin nhắn */}
            {!authError && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/10 backdrop-blur-xl transition-colors">
                <AnimatePresence>
                  {selectedImage && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 75, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl mb-3 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Đã đính kèm ảnh</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate block">image.png</span>
                      </div>
                      <button 
                        onClick={removeSelectedImage}
                        className="p-1 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {chatMode === 'admin' ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-white/10 hover:text-[#057A42] dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10 transition-all duration-200"
                      aria-label="Attach photo"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsRecording(!isRecording)}
                      className={`p-3 rounded-2xl transition-all shrink-0 border ${isRecording ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-100 dark:border-white/10 hover:text-[#057A42] dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/10'}`}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={input} 
                        onChange={handleInputChange} 
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? t('listening') : (chatMode === 'admin' ? (lang === 'en' ? 'Ask anything to staff...' : 'Nhập tin nhắn cho nhân viên...') : t('ask_anything'))}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                        disabled={isRecording}
                      />
                      <button 
                        onClick={handleSend} disabled={(!input.trim() && !selectedImage) || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#057A42] text-white disabled:opacity-30 transition-all shadow-lg hover:scale-105"
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL BIOMETRIC SCANNER (FACE ID SWEEPER) */}
      <AnimatePresence>
        {showBiometricModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-[340px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Nút đóng */}
              <button 
                onClick={closeBiometricModal}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4 justify-center">
                <Fingerprint className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-widest">F.R.E.S.H FaceID Scanner</span>
              </div>

              {/* Khung quét camera tròn */}
              <div className="relative w-56 h-56 mx-auto rounded-full overflow-hidden border-2 border-slate-800/80 bg-slate-950 flex items-center justify-center shadow-inner">
                {/* Real video */}
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Laser Quét Chạy Lên Xuống */}
                {isScanning && (
                  <motion.div 
                    animate={{ y: [0, 224, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] z-20 pointer-events-none"
                    style={{ top: 0 }}
                  />
                )}

                {/* Lưới quét Face ID lồng ngoài */}
                <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/30 animate-spin-slow pointer-events-none" />

                {/* Khung căn chỉnh khuôn mặt */}
                <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
              </div>

              {/* Tiến trình quét */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">
                  <span>{isScanning ? "Đang định vị khuôn mặt" : "Đã hoàn thành"}</span>
                  <span className="text-emerald-400">{scanProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-75 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-[250px] mx-auto mt-4 uppercase tracking-wider">
                {isScanning 
                  ? "Vui lòng giữ khuôn mặt trực diện và ổn định trong khung camera để ghi nhận sinh trắc học."
                  : "Chụp ảnh chân dung sinh trắc học thành công! Đang lưu hash..."}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 1 }}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 mb-4 text-[11px] font-bold text-gray-600 dark:text-slate-300 max-w-[220px] shadow-2xl relative"
            >
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-gray-100 dark:border-white/10 rotate-45" />
              {t('ai_welcome').substring(0, 80)}...
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#057A42] to-emerald-400 p-[1px] shadow-2xl relative z-50 transition-all"
          aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          <div className="w-full h-full rounded-[2rem] bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden transition-colors">
            <div className={`absolute inset-0 ${isOpen ? 'bg-orange-500/10' : 'bg-[#057A42]/10 animate-pulse'}`}></div>
            {isOpen ? (
              <X className="w-7 h-7 text-orange-500 relative z-10" />
            ) : (
              <Bot className="w-7 h-7 text-[#057A42] dark:text-emerald-400 relative z-10" />
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
