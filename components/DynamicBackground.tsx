'use client';

import { useEffect, useRef } from 'react';
import { useGlobal } from '@/app/providers';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

export function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useGlobal();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 45;
    const mouse = { x: -1000, y: -1000, radius: 120 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const getColors = (isDark: boolean) => {
      // Trả về danh sách màu tương thích với từng theme
      if (isDark) {
        return [
          '16, 185, 129', // Emerald
          '5, 122, 66',   // Fresh Green
          '59, 130, 246',  // Blue
          '6, 182, 212',   // Cyan
        ];
      } else {
        return [
          '5, 122, 66',   // Fresh Green (darker for visibility)
          '16, 185, 129', // Emerald
          '37, 99, 235',  // Indigo Blue
          '13, 148, 136', // Teal
        ];
      }
    };

    const initParticles = () => {
      particles = [];
      const colors = getColors(theme === 'dark');
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 4 + 1.5;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const baseAlpha = Math.random() * 0.25 + 0.08;

        particles.push({
          x,
          y,
          vx,
          vy,
          radius,
          color,
          alpha: baseAlpha,
          baseAlpha,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Vẽ lưới gradient nền nhẹ nhàng
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );

      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.3)');
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(248, 250, 252, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cập nhật và vẽ các hạt
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce ở các cạnh
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Tương tác chuột: Đẩy các hạt ra xa khi chuột đến gần
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Đẩy nhẹ nhàng
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;
          
          // Tăng độ sáng khi chuột ở gần
          p.alpha = Math.min(p.baseAlpha * 2.5, 0.65);
        } else {
          // Trả về độ sáng ban đầu từ từ
          if (p.alpha > p.baseAlpha) {
            p.alpha -= 0.01;
          }
        }

        // Vẽ hạt
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        // Thêm hiệu ứng nhấp nháy phát sáng nhẹ bằng shadow
        ctx.shadowBlur = theme === 'dark' ? p.radius * 2 : 0;
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      });

      // Vẽ các liên kết mảnh mai giữa các hạt ở gần nhau
      ctx.shadowBlur = 0; // Tắt shadow cho nét vẽ line để tối ưu hóa hiệu năng
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (110 - dist) / 110 * 0.08 * (theme === 'dark' ? 1 : 0.6);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(16, 185, 129, ${lineAlpha})` 
              : `rgba(5, 122, 66, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none transition-colors duration-300"
    />
  );
}
