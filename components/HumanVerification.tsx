'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, X, Leaf } from 'lucide-react';
import { useGlobal } from '@/app/providers';

interface HumanVerificationProps {
  onVerify: (verified: boolean) => void;
}

export function HumanVerification({ onVerify }: HumanVerificationProps) {
  const { theme, lang } = useGlobal();
  const [status, setStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [showSlider, setShowSlider] = useState(false);
  
  // Các thông số tracking hành vi
  const mouseMovementsRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const loadTimeRef = useRef<number>(0);
  const checkboxRef = useRef<HTMLDivElement>(null);

  // Puzzle state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blockRef = useRef<HTMLCanvasElement>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [isDragSuccess, setIsDragSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const puzzleSize = 42; // Kích thước mảnh ghép

  useEffect(() => {
    loadTimeRef.current = Date.now();

    const trackMouseMove = (e: MouseEvent) => {
      // Giới hạn lưu tối đa 50 chuyển động gần nhất để tránh ngốn ram
      if (mouseMovementsRef.current.length < 50) {
        mouseMovementsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
        });
      } else {
        mouseMovementsRef.current.shift();
        mouseMovementsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
        });
      }
    };

    window.addEventListener('mousemove', trackMouseMove);
    return () => {
      window.removeEventListener('mousemove', trackMouseMove);
    };
  }, []);

  // Khởi tạo và vẽ Canvas Puzzle
  const initPuzzle = useCallback(() => {
    const canvas = canvasRef.current;
    const block = blockRef.current;
    if (!canvas || !block) return;

    const ctx = canvas.getContext('2d');
    const blockCtx = block.getContext('2d');
    if (!ctx || !blockCtx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Thiết lập tọa độ đích ngẫu nhiên cho mảnh ghép
    const randomX = Math.floor(Math.random() * (width - puzzleSize * 2)) + puzzleSize;
    const randomY = Math.floor(Math.random() * (height - puzzleSize - 20)) + 10;
    setTargetX(randomX);
    setTargetY(randomY);
    setSliderValue(0);
    setIsDragSuccess(false);

    // Vẽ hình nền lên canvas chính bằng các hình khối vector nghệ thuật hữu cơ (F.R.E.S.H theme)
    ctx.clearRect(0, 0, width, height);
    
    // Nền gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'dark') {
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
    } else {
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#e2e8f0');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Vẽ một quả táo và lá cây nghệ thuật làm vật thể ghép hình
    // Vẽ quả táo (thân chính)
    ctx.beginPath();
    ctx.arc(140, 75, 38, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'dark' ? '#057A42' : '#10B981';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(165, 75, 38, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'dark' ? '#046034' : '#057A42';
    ctx.fill();

    // Vẽ lõm quả táo ở dưới
    ctx.beginPath();
    ctx.arc(152, 114, 12, 0, Math.PI, true);
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#f8fafc';
    ctx.fill();

    // Vẽ cuống quả táo
    ctx.beginPath();
    ctx.moveTo(152, 38);
    ctx.quadraticCurveTo(145, 20, 135, 18);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    // Vẽ lá xanh nhỏ
    ctx.beginPath();
    ctx.ellipse(145, 22, 16, 8, Math.PI / -4, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.fill();

    // Vẽ một vài vòng tròn phát sáng trừu tượng trang trí
    ctx.beginPath();
    ctx.arc(50, 40, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(260, 110, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();

    // Định nghĩa đường viền của mảnh ghép (puzzle piece) với mấu lồi/lõm tròn
    const drawPuzzlePath = (c: CanvasRenderingContext2D, x: number, y: number) => {
      const r = 8; // Bán kính mấu tròn
      c.beginPath();
      c.moveTo(x, y);
      // Cạnh trên
      c.lineTo(x + puzzleSize / 2 - r, y);
      c.arc(x + puzzleSize / 2, y, r, Math.PI, 0);
      c.lineTo(x + puzzleSize, y);
      // Cạnh phải
      c.lineTo(x + puzzleSize, y + puzzleSize / 2 - r);
      c.arc(x + puzzleSize, y + puzzleSize / 2, r, Math.PI * 1.5, Math.PI * 0.5);
      c.lineTo(x + puzzleSize, y + puzzleSize);
      // Cạnh dưới
      c.lineTo(x + puzzleSize / 2 + r, y + puzzleSize);
      c.arc(x + puzzleSize / 2, y + puzzleSize, r, 0, Math.PI, true);
      c.lineTo(x, y + puzzleSize);
      // Cạnh trái
      c.lineTo(x, y + puzzleSize / 2 + r);
      c.arc(x, y + puzzleSize / 2, r, Math.PI * 0.5, Math.PI * 1.5);
      c.closePath();
    };

    // Vẽ phần bóng của mảnh khuyết trên canvas chính
    ctx.save();
    drawPuzzlePath(ctx, randomX, randomY);
    ctx.fillStyle = theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
    ctx.stroke();
    ctx.restore();

    // Cắt ảnh của mảnh ghép để vẽ lên canvas block di động
    block.width = width; // Cùng kích thước để đồng bộ di chuyển bằng slider dễ dàng
    block.height = height;
    blockCtx.clearRect(0, 0, width, height);

    blockCtx.save();
    // Tạo clip path hình mảnh ghép tại vị trí X = 0, Y = randomY
    // Đầu tiên copy phần ảnh từ canvas chính tại (randomX, randomY) sang (10, randomY) của block
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Vẽ lại nền và quả táo y hệt lên tempCanvas nhưng KHÔNG có lỗ khuyết
    tempCtx.fillStyle = bgGrad;
    tempCtx.fillRect(0, 0, width, height);
    
    tempCtx.beginPath();
    tempCtx.arc(140, 75, 38, 0, Math.PI * 2);
    tempCtx.fillStyle = theme === 'dark' ? '#057A42' : '#10B981';
    tempCtx.fill();

    tempCtx.beginPath();
    tempCtx.arc(165, 75, 38, 0, Math.PI * 2);
    tempCtx.fillStyle = theme === 'dark' ? '#046034' : '#057A42';
    tempCtx.fill();

    tempCtx.beginPath();
    tempCtx.arc(152, 114, 12, 0, Math.PI, true);
    tempCtx.fillStyle = theme === 'dark' ? '#0f172a' : '#f8fafc';
    tempCtx.fill();

    tempCtx.beginPath();
    tempCtx.moveTo(152, 38);
    tempCtx.quadraticCurveTo(145, 20, 135, 18);
    tempCtx.lineWidth = 4;
    tempCtx.strokeStyle = '#78350f';
    tempCtx.stroke();

    tempCtx.beginPath();
    tempCtx.ellipse(145, 22, 16, 8, Math.PI / -4, 0, Math.PI * 2);
    tempCtx.fillStyle = '#34d399';
    tempCtx.fill();

    tempCtx.beginPath();
    tempCtx.arc(50, 40, 20, 0, Math.PI * 2);
    tempCtx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    tempCtx.fill();

    tempCtx.beginPath();
    tempCtx.arc(260, 110, 25, 0, Math.PI * 2);
    tempCtx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    tempCtx.fill();

    // Clip theo hình mảnh ghép trên block
    drawPuzzlePath(blockCtx, 10, randomY);
    blockCtx.clip();
    
    // Copy vùng ảnh từ tempCanvas tại (randomX, randomY) đặt sang (10, randomY)
    blockCtx.drawImage(
      tempCanvas,
      randomX, randomY, puzzleSize + 16, puzzleSize + 16, // Lấy dư tí mấu
      10, randomY, puzzleSize + 16, puzzleSize + 16
    );
    blockCtx.restore();

    // Vẽ viền ngoài cho mảnh ghép di động
    blockCtx.save();
    drawPuzzlePath(blockCtx, 10, randomY);
    blockCtx.lineWidth = 1.5;
    blockCtx.strokeStyle = '#10B981';
    blockCtx.shadowBlur = 4;
    blockCtx.shadowColor = '#10B981';
    blockCtx.stroke();
    blockCtx.restore();
  }, [theme]);

  useEffect(() => {
    if (showSlider) {
      setTimeout(() => {
        initPuzzle();
      }, 50);
    }
  }, [showSlider, initPuzzle]);

  const verifyHumanBehavior = () => {
    const timeDiff = Date.now() - loadTimeRef.current;
    const movements = mouseMovementsRef.current;

    // 1. Kiểm tra webdriver (bot tự động phổ biến)
    if (typeof window !== 'undefined' && window.navigator.webdriver) {
      return false;
    }

    // 2. Kiểm tra click quá nhanh từ lúc tải trang (dưới 0.8s)
    if (timeDiff < 800) {
      return false;
    }

    // 3. Kiểm tra chuyển động chuột trước khi click
    if (movements.length < 4) {
      return false; // Robot click trực tiếp bằng JavaScript mà không di chuột
    }

    // 4. Tính toán độ thẳng hàng của đường đi chuột (Bot thường di chuột theo đường thẳng tuyệt đối)
    let isStraightLine = true;
    if (movements.length >= 8) {
      const sample = movements.slice(-6);
      const slopes = [];
      for (let i = 1; i < sample.length; i++) {
        const dx = sample[i].x - sample[i-1].x;
        const dy = sample[i].y - sample[i-1].y;
        if (dx !== 0) {
          slopes.push(dy / dx);
        }
      }
      // Nếu tất cả các hệ số góc bằng nhau tuyệt đối, có khả năng là bot di chuột tuyến tính
      const uniqueSlopes = new Set(slopes.map(s => s.toFixed(4)));
      if (uniqueSlopes.size > 1) {
        isStraightLine = false;
      }
    } else {
      isStraightLine = false;
    }

    if (isStraightLine && movements.length >= 8) {
      return false; // Nghi ngờ bot di chuyển tuyến tính tuyệt đối
    }

    return true;
  };

  const handleCheckboxClick = () => {
    if (status === 'verified' || status === 'checking') return;

    setStatus('checking');

    // Chạy phân tích hành vi
    const isProbablyHuman = verifyHumanBehavior();

    setTimeout(() => {
      if (isProbablyHuman) {
        // Con người thật -> Duyệt luôn và hiện tick xanh mượt mà
        setStatus('verified');
        onVerify(true);
      } else {
        // Nghi ngờ hoặc là bot -> Mở thử thách kéo Slider Puzzle cục bộ
        setShowSlider(true);
      }
    }, 1000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDragSuccess) return;
    const value = parseInt(e.target.value);
    setSliderValue(value);

    // Di chuyển block canvas tương ứng
    const block = blockRef.current;
    if (block) {
      // Giá trị slider từ 0 -> 100 tương ứng di chuyển block từ 0 -> width - puzzleSize - 20
      const canvasWidth = canvasRef.current?.width || 300;
      const maxMove = canvasWidth - puzzleSize - 20;
      const currentX = (value / 100) * maxMove;
      block.style.transform = `translateX(${currentX}px)`;
    }
  };

  const handleSliderRelease = () => {
    if (isDragSuccess) return;
    setIsDragging(false);

    // Tính toán khoảng cách thực tế so với targetX
    const canvasWidth = canvasRef.current?.width || 300;
    const maxMove = canvasWidth - puzzleSize - 20;
    const currentX = (sliderValue / 100) * maxMove + 10; // +10 là điểm xuất phát ban đầu của block

    const diff = Math.abs(currentX - targetX);

    if (diff <= 5) {
      // Ghép thành công!
      setIsDragSuccess(true);
      setStatus('verified');
      setTimeout(() => {
        setShowSlider(false);
        onVerify(true);
      }, 800);
    } else {
      // Thất bại -> Tạo hiệu ứng rung giật nhẹ và vẽ lại puzzle
      const block = blockRef.current;
      if (block) {
        block.style.transition = 'transform 0.3s ease';
        block.style.transform = 'translateX(0px)';
        setTimeout(() => {
          block.style.transition = 'none';
        }, 300);
      }
      setSliderValue(0);
      initPuzzle();
    }
  };

  return (
    <div className="w-full select-none" ref={checkboxRef}>
      {/* Ô Checkbox kiểu Turnstile */}
      <div 
        onClick={handleCheckboxClick}
        className={`w-full p-4 flex items-center justify-between rounded-2xl border transition-all duration-300 cursor-pointer ${
          status === 'verified'
            ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30'
            : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80'
        } backdrop-blur-xl`}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-[#057A42] dark:hover:border-emerald-400 transition-colors"
                />
              )}

              {status === 'checking' && (
                <motion.div
                  key="checking"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-[#057A42] dark:border-t-emerald-400 animate-spin"
                />
              )}

              {status === 'verified' && (
                <motion.div
                  key="verified"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"
                >
                  <svg className="w-3 h-3 stroke-white stroke-[3] fill-none" viewBox="0 0 12 12">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      d="M2.5 6L5 8.5L9.5 3.5"
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {status === 'verified' 
              ? (lang === 'en' ? 'Verification Successful' : 'Xác thực thành công')
              : (lang === 'en' ? 'I am not a robot' : 'Tôi không phải là robot')
            }
          </span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-[#057A42] dark:text-emerald-400" />
            <span>FRESH Shield</span>
          </div>
          <span className="text-[8px] text-slate-400 dark:text-slate-600">Secure & Offline</span>
        </div>
      </div>

      {/* Modal Thử thách Slider Puzzle (Kéo mảnh ghép) */}
      <AnimatePresence>
        {showSlider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="w-[340px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-2xl transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#057A42] dark:text-emerald-400 animate-pulse" />
                  <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {lang === 'en' ? 'Human Check' : 'Kiểm tra con người'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setShowSlider(false);
                    setStatus('idle');
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mô tả */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-bold">
                {lang === 'en' 
                  ? 'Drag the slider to fit the puzzle piece.' 
                  : 'Kéo thanh trượt để khớp mảnh ghép hình quả táo F.R.E.S.H.'}
              </p>

              {/* Khu vực Canvas Vẽ Puzzle */}
              <div className="relative w-[300px] h-[150px] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 mx-auto bg-slate-100 dark:bg-slate-950">
                <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={150} 
                  className="absolute inset-0 w-full h-full"
                />
                <canvas 
                  ref={blockRef} 
                  width={300} 
                  height={150} 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: 'translateX(0px)' }}
                />

                {/* Phản hồi trạng thái khi hoàn thành */}
                {isDragSuccess && (
                  <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center border border-emerald-500/40">
                    <motion.div 
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-500 text-white rounded-full p-2.5 shadow-lg"
                    >
                      <svg className="w-6 h-6 stroke-white stroke-[4] fill-none" viewBox="0 0 12 12">
                        <path d="M2.5 6L5 8.5L9.5 3.5" />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Thanh trượt điều khiển (Slider) */}
              <div className="mt-5 relative w-[300px] mx-auto">
                <div className="h-10 w-full rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 flex items-center px-1.5 relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 dark:bg-emerald-500/20 transition-all duration-75"
                    style={{ width: `${sliderValue}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
                      {isDragSuccess 
                        ? (lang === 'en' ? 'Match!' : 'Đã khớp!') 
                        : (lang === 'en' ? 'Slide to complete' : 'Trượt để lắp ghép')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    disabled={isDragSuccess}
                    className="w-full h-full opacity-0 cursor-grab active:cursor-grabbing relative z-10"
                  />
                  
                  {/* Cục chạy Slider giả lập vô cùng tinh tế */}
                  <div 
                    className={`absolute w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all duration-75 border ${
                      isDragSuccess
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : isDragging
                          ? 'bg-[#057A42] border-[#046034] text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400'
                    }`}
                    style={{ 
                      left: `calc(${sliderValue}% * (100% - 2rem) / 100 + 6px)`,
                      pointerEvents: 'none'
                    }}
                  >
                    {isDragSuccess ? (
                      <svg className="w-4 h-4 stroke-white stroke-[3] fill-none" viewBox="0 0 12 12">
                        <path d="M2.5 6L5 8.5L9.5 3.5" />
                      </svg>
                    ) : (
                      <RefreshCw className={`w-3.5 h-3.5 ${isDragging ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
