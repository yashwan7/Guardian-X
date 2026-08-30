'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Cpu,
  Package,
  GitMerge,
  FlaskConical,
  ShieldAlert,
  LifeBuoy,
  Bot,
  FileText,
  Sliders,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Fleet & Core',
    items: [
      { label: 'Control Center', href: '/dashboard', icon: Layers, exact: true },
      { label: 'Fleet Nodes', href: '/dashboard/fleet', icon: Cpu },
      { label: 'Device Inventory', href: '/dashboard/devices', icon: Cpu },
    ],
  },
  {
    title: 'Firmware & Rollouts',
    items: [
      { label: 'Firmware Library', href: '/dashboard/firmware', icon: Package },
      { label: 'OTA Campaigns', href: '/dashboard/rollouts', icon: GitMerge },
    ],
  },
  {
    title: 'Security & Recovery',
    items: [
      { label: 'Resilience Lab', href: '/dashboard/attack-lab', icon: FlaskConical },
      { label: 'SOC Intelligence', href: '/dashboard/security', icon: ShieldAlert },
      { label: 'Recovery Engine', href: '/dashboard/recovery', icon: LifeBuoy },
    ],
  },
  {
    title: 'Intelligence & Ops',
    items: [
      { label: 'Guardian AI Copilot', href: '/dashboard/ai', icon: Bot },
      { label: 'Audit Trail', href: '/dashboard/audit', icon: FileText },
      { label: 'Safety Policies', href: '/dashboard/policies', icon: Sliders },
      { label: 'Configuration', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-white/80 dark:border-white/10 flex flex-col justify-between select-none z-20 transition-colors shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
          {/* Apple Vision Pro Sunrise Gradient Brand Icon */}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#ffa8ba] via-[#fed7aa] to-[#60a5fa] p-0.5 shadow-[0_8px_20px_-4px_rgba(255,168,186,0.6)] flex items-center justify-center text-white border border-white/60">
            <ShieldCheck className="w-5 h-5 drop-shadow-sm text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Guardian
              </span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-sm">
                X
              </span>
            </div>
            <p className="text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Secure OTA Vision
            </p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-130px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-2 text-[10px] font-sans font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">
                {group.title}
              </span>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-700/50 shadow-[0_4px_12px_rgba(59,130,246,0.12),_inset_0_1px_1px_rgba(255,255,255,0.8)]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className={`p-1 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-sm'
                          : 'text-slate-400 group-hover:text-blue-500'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Target Hardware Footer Badge */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-sans font-semibold text-slate-400 block">TARGET MCU</span>
            <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">FRDM-MCXN236</span>
          </div>
          {/* Apple Vision Tactile Knob */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-[0_2px_8px_rgba(52,211,153,0.5)] border border-white/80 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}