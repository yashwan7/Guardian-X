'use client';

import { LEDColor } from '@/types';

export default function LEDIndicator({ color, size = 'md' }: { color: LEDColor; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-4 h-4', lg: 'w-6 h-6' };
  
  const getStyle = () => {
    switch (color) {
      case 'GREEN': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse';
      case 'YELLOW': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse';
      case 'BLUE': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse';
      case 'RED': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse';
      case 'OFF': default: return 'bg-slate-700 shadow-none';
    }
  };

  return <div className={`${sizeMap[size]} rounded-full transition-all duration-300 ${getStyle()}`} />;
}