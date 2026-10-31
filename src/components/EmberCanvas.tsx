import { useEffect, useRef } from 'react';
import { ThemeMode } from '../types/game';

interface EmberCanvasProps {
  enabled: boolean;
  theme?: ThemeMode;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  warmth: number;
}

export function EmberCanvas({ enabled, theme }: EmberCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<ThemeMode | undefined>(theme);
  themeRef.current = theme;

  useEffect(() => {
    if (!enabled) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(34, Math.max(16, Math.floor(width / 55)));
    const particles: EmberParticle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -(0.22 + Math.random() * 0.48),
      size: 1.0 + Math.random() * 1.9,
      alpha: Math.random() * 0.45,
      decay: 0.0012 + Math.random() * 0.002,
      warmth: Math.random(),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const activeTheme =
        themeRef.current ??
        (typeof document !== 'undefined' &&
        document.documentElement.dataset.theme === 'dark'
          ? 'dark'
          : 'light');
      const isLight = activeTheme !== 'dark';

      for (const p of particles) {
        p.x += p.vx + Math.sin(p.y * 0.015) * 0.14;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02 || p.y < -10) {
          p.x = Math.random() * width;
          p.y = height + 8;
          p.alpha = 0.25 + Math.random() * 0.4;
        }

        const effectiveAlpha = isLight ? p.alpha * 0.48 : p.alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? p.warmth > 0.5
            ? `rgba(217, 119, 6, ${effectiveAlpha.toFixed(3)})`
            : `rgba(180, 83, 9, ${effectiveAlpha.toFixed(3)})`
          : p.warmth > 0.5
            ? `rgba(255, 140, 26, ${effectiveAlpha.toFixed(3)})`
            : `rgba(255, 106, 0, ${effectiveAlpha.toFixed(3)})`;
        ctx.fill();
      }
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    />
  );
}
