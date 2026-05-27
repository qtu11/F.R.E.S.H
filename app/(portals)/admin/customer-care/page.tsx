/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Headphones, Send, Search, Image as ImageIcon, CheckCheck, Clock, User, Smile, MessageSquare, AlertCircle, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'partner' | 'admin';
  content: string;
  image?: string; // Base64
  timestamp: number;
  read: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  userRole: 'customer' | 'partner';
  userTyping: boolean;
  adminTyping: boolean;
  lastActive: number;
  unreadCountByAdmin: number;
  lastMessage: {
    content: string;
    image: boolean;
    timestamp: number;
    senderRole: 'customer' | 'partner' | 'admin';
  } | null;
}

export default function CustomerCareDashboard() {
  const { t, lang } = useGlobal();
  const { user } = useAuth();
  
  // State quản lý hội thoại
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'partner'>('all');
  const [userTyping, setUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gửi ảnh
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phóng to ảnh khi click
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Lưu số lượng tin nhắn chưa đọc cũ để so sánh và phát âm thanh
  const prevUnreadCountRef = useRef<number>(0);

  // Tạo âm thanh bíp thông báo tinh tế bằng Web Audio API
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Nốt 1 (tần số thấp)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.12);

      // Nốt 2 (tần số cao, tạo tiếng ding-dong)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.18);
      }, 70);

    } catch (err) {
      console.warn("AudioContext blocked or failed:", err);
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, userTyping]);

  // Polling lấy danh sách các phiên chat (1.5s/lần)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/chat/admin?action=get_conversations');
        const data = await res.json();
        if (data.success) {
          const list: Conversation[] = data.conversations;
          setConversations(list);
          
          // Tính tổng số tin nhắn chưa đọc của admin để phát âm báo
          const totalUnread = list.reduce((sum, item) => sum + item.unreadCountByAdmin, 0);
          if (totalUnread > prevUnreadCountRef.current) {
            playNotificationSound();
          }
          prevUnreadCountRef.current = totalUnread;
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy danh sách chat:", err);
        setLoading(false);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 1500);
    return () => clearInterval(interval);
  }, []);

  // Polling lấy chi tiết tin nhắn của user đang chọn (1.5s/lần)
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      setUserTyping(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/admin?action=get_messages&userId=${selectedUserId}&role=admin`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          setUserTyping(!!data.typing?.user);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách tin nhắn chi tiết:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Gửi tín hiệu gõ phím của admin
    if (selectedUserId && user) {
      fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_typing',
          userId: selectedUserId,
          senderRole: 'admin',
          isTyping: true
        })
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        fetch('/api/chat/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'set_typing',
            userId: selectedUserId,
            senderRole: 'admin',
            isTyping: false
          })
        });
      }, 3000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Hình ảnh phải nhỏ hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!selectedUserId || !user) return;

    const textContent = input.trim();
    setInput('');
    const imgBase64 = selectedImage;
    setSelectedImage(null);

    // Render tạm tin nhắn lên client cho mượt mà tức thì
    const tempMsg: ChatMessage = {
      id: Math.random().toString(),
      senderId: 'admin',
      senderName: user.name || 'Admin',
      senderRole: 'admin',
      content: textContent,
      image: imgBase64 || undefined,
      timestamp: Date.now(),
      read: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          senderRole: 'admin',
          senderName: user.name || 'Admin',
          content: textContent,
          image: imgBase64 || undefined
        })
      });
    } catch (err) {
      console.error("Gửi tin nhắn admin thất bại:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Lọc danh sách cuộc trò chuyện theo ô tìm kiếm và bộ lọc vai trò
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.userName.toLowerCase().includes(searchQuery.toLowerCase()) || c.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : c.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen font-sans flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#057A42] to-emerald-600 dark:from-emerald-950 dark:to-emerald-800 py-5 px-6 shadow-md transition-colors flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide uppercase">
              {lang === 'en' ? 'Support Inbox (Live)' : 'Hộp Thư Hỗ Trợ Trực Tuyến'}
            </h1>
            <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">F.R.E.S.H Omnichannel Console</p>
          </div>
        </div>
        <div className="bg-white/20 dark:bg-white/10 border border-white/30 px-4 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Realtime Active
        </div>
      </div>

      {/* Workspace chính */}
      <div className="flex-1 flex max-w-[1400px] w-full mx-auto bg-white dark:bg-slate-900 border-x border-gray-100 dark:border-slate-800 overflow-hidden relative shadow-inner">
        
        {/* CỘT BÊN TRÁI: DANH SÁCH CUỘC HỘI THOẠI */}
        <div className="w-full md:w-[350px] border-r border-gray-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 select-none">
          {/* Tìm kiếm */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm khách hàng/đối tác..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#057A42]"
              />
            </div>
            {/* Bộ lọc vai trò */}
            <div className="flex gap-1.5">
              {(['all', 'customer', 'partner'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                    roleFilter === role
                      ? 'bg-[#057A42] text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800'
                  }`}
                >
                  {role === 'all' ? 'Tất cả' : role === 'customer' ? 'Khách hàng' : 'Đối tác'}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách người dùng */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/50">
            {loading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
                      <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">Không có cuộc trò chuyện nào</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = selectedUserId === conv.userId;
                return (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-100/50 dark:hover:bg-slate-800/30 ${
                      isActive ? 'bg-white dark:bg-slate-800/60 border-l-[3px] border-l-[#057A42]' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-md border ${
                        conv.userRole === 'partner'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                          : 'bg-emerald-50 dark:bg-emerald-900/20 text-[#057A42] dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                      }`}>
                        {conv.userName.substring(0, 1).toUpperCase()}
                      </div>
                      {/* Chấm tròn trạng thái */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                          {conv.userName}
                        </h4>
                        <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold">
                          {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[11px] truncate font-medium ${conv.unreadCountByAdmin > 0 ? 'text-[#057A42] dark:text-emerald-400 font-extrabold' : 'text-gray-500 dark:text-slate-400'}`}>
                          {conv.userTyping ? (
                            <span className="text-[#057A42] dark:text-emerald-400 font-bold italic animate-pulse">Đang soạn tin...</span>
                          ) : conv.lastMessage ? (
                            conv.lastMessage.senderRole === 'admin'
                              ? `Bạn: ${conv.lastMessage.content || '[Hình ảnh]'}`
                              : conv.lastMessage.content || '[Hình ảnh]'
                          ) : (
                            'Chưa có tin nhắn'
                          )}
                        </p>
                        
                        {/* Huy hiệu tin nhắn chưa đọc */}
                        {conv.unreadCountByAdmin > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                            {conv.unreadCountByAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT BÊN PHẢI: KHUNG CHAT CHI TIẾT */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
          {!selectedUserId ? (
            /* Khung placeholder trống khi chưa chọn chat */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20 dark:bg-slate-950/20">
              <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-[#057A42] dark:text-emerald-400 shadow-lg mb-6 border border-emerald-100/50 dark:border-emerald-900/50">
                <Headphones className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">Live Chat Center</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed font-bold">
                Chọn một khách hàng hoặc đối tác ở thanh bên trái để bắt đầu tư vấn hỗ trợ và giải quyết khiếu nại trực tiếp theo thời gian thực.
              </p>
            </div>
          ) : (
            /* Giao diện khung Chat detail */
            <>
              {/* Header chat */}
              <div className="bg-white/80 dark:bg-slate-900/80 p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-md border ${
                    selectedConversation?.userRole === 'partner'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-[#057A42] dark:text-emerald-400 border-emerald-100'
                  }`}>
                    {selectedConversation?.userName.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {selectedConversation?.userName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        {selectedConversation?.userRole === 'partner' ? 'Đối tác kinh doanh' : 'Khách hàng F.R.E.S.H'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                    ID: {selectedUserId.substring(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-slate-950/10">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-8 h-8 text-yellow-500 dark:text-emerald-400 mx-auto animate-bounce mb-3" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Bắt đầu trò chuyện</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%] space-y-1.5">
                        <div className={`rounded-[1.5rem] px-5 py-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                          isAdmin
                            ? 'bg-[#057A42] text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-slate-850'
                        }`}>
                          {/* Tin nhắn có hình ảnh */}
                          {msg.image && (
                            <div 
                              onClick={() => setZoomImageUrl(msg.image || null)}
                              className="mb-2 max-w-[280px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-md cursor-zoom-in"
                            >
                              <img src={msg.image} alt="Sent image" className="w-full h-auto object-cover max-h-[180px]" />
                            </div>
                          )}
                          <p>{msg.content}</p>
                        </div>
                        {/* Thời gian nhắn */}
                        <div className={`flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isAdmin && (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* User đang gõ chữ */}
                {userTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1.5 uppercase tracking-wider">Đang soạn tin</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ô soạn thảo tin nhắn của Admin */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                {/* Preview ảnh đính kèm */}
                {selectedImage && (
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl mb-3 border border-slate-100 dark:border-slate-800 relative">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Chuẩn bị đính kèm</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate block">image_attachment.png</span>
                    </div>
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="p-1 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-slate-500 hover:text-[#057A42] border border-gray-100 dark:border-slate-800 transition-colors"
                    aria-label="Upload photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn tư vấn và phản hồi cho khách hàng..."
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-slate-850 rounded-2xl py-3.5 pl-5 pr-14 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && !selectedImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#057A42] text-white disabled:opacity-30 transition-all shadow-lg hover:scale-105"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL ZOOM ẢNH PHÓNG TO */}
      {zoomImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img src={zoomImageUrl} alt="Zoomed support image" className="w-full h-auto max-h-[80vh] object-contain shadow-2xl" />
            <button 
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
