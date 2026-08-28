'use client';

import React, { useEffect, useRef } from 'react';

interface InteractiveDotGridProps {
  className?: string;
  dotSize?: number;
  dotSpacing?: number;
  repulsionRadius?: number;
  repulsionStrength?: number;
}

interface Dot {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseOpacity: number;
  phase: number;
}

export function InteractiveDotGrid({
  className = '',
  dotSize = 2,
  dotSpacing = 18,
  repulsionRadius = 95,
  repulsionStrength = 30,
}: InteractiveDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;

    const initDots = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / dotSpacing);
      const rows = Math.ceil(height / dotSpacing);
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * dotSpacing;
          const y = r * dotSpacing;

          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const edgeFactor = Math.min(dist / (maxDistance * 0.8), 1);

          if (Math.random() > 0.85 && edgeFactor < 0.2) continue;

          const pattern = (r + c) % 3;
          const opacities = [0.2, 0.35, 0.55];
          const baseOpacity = opacities[pattern];

          dots.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            baseOpacity,
            phase: (r * 0.1 + c * 0.1) % (Math.PI * 2),
          });
        }
      }
    };

    initDots();

    const handleResize = () => {
      initDots();
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: -9999,
        y: -9999,
        active: false,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const springK = 0.08;
    const friction = 0.82;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        const dx = dot.baseX - mx;
        const dy = dot.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = dot.baseX;
        let targetY = dot.baseY;
        let proximityBoost = 0;

        if (dist < repulsionRadius) {
          const force = (1 - dist / repulsionRadius) * repulsionStrength;
          const angle = Math.atan2(dy, dx);
          targetX = dot.baseX + Math.cos(angle) * force;
          targetY = dot.baseY + Math.sin(angle) * force;
          proximityBoost = (1 - dist / repulsionRadius) * 0.5;
        }

        const ax = (targetX - dot.x) * springK;
        const ay = (targetY - dot.y) * springK;

        dot.vx = (dot.vx + ax) * friction;
        dot.vy = (dot.vy + ay) * friction;

        dot.x += dot.vx;
        dot.y += dot.vy;

        const pulse = 0.85 + Math.sin(time + dot.phase) * 0.25;
        const finalOpacity = Math.min(Math.max((dot.baseOpacity * pulse) + proximityBoost, 0.08), 0.9);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${finalOpacity})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [dotSize, dotSpacing, repulsionRadius, repulsionStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
    />
  );
}

export default InteractiveDotGrid;
