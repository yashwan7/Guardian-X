'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  Cpu,
  HardDrive,
  GitBranch,
  FlaskConical,
  ShieldAlert,
  HeartPulse,
  Bot,
  ScrollText,
  Shield,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'FLEET & HARDWARE',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/fleet', label: 'Fleet Overview', icon: Server },
      { href: '/dashboard/devices', label: 'Devices', icon: Cpu },
      { href: '/dashboard/firmware', label: 'Firmware Releases', icon: HardDrive },
      { href: '/dashboard/rollouts', label: 'OTA Rollouts', icon: GitBranch },
    ],
  },
  {
    title: 'SECURITY & RESILIENCE',
    items: [
      { href: '/dashboard/attack-lab', label: 'Attack Lab', icon: FlaskConical },
      { href: '/dashboard/security', label: 'Security Center', icon: ShieldAlert },
      { href: '/dashboard/recovery', label: 'Recovery Center', icon: HeartPulse },
      { href: '/dashboard/ai', label: 'Guardian AI', icon: Bot },
    ],
  },
  {
    title: 'GOVERNANCE',
    items: [
      { href: '/dashboard/audit', label: 'Audit Logs', icon: ScrollText },
      { href: '/dashboard/policies', label: 'Policies', icon: Shield },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[#040705] border-r border-[#121e17] flex flex-col justify-between select-none z-20">
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#121e17] flex items-center gap-2.5 bg-[#050907]">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">
                GUARDIAN
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                X
              </span>
            </div>
            <p className="text-[9px] font-mono text-emerald-600/80 tracking-widest uppercase -mt-0.5 font-medium">
              SECURE OTA
            </p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-2 text-[9px] font-mono font-semibold tracking-wider text-slate-400 uppercase block mb-1.5">
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
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30 shadow-[0_0_12px_rgba(0,245,160,0.12)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#09100c]'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Target Hardware Footer Badge */}
      <div className="p-3 border-t border-[#121e17] bg-[#030504]">
        <div className="p-2 rounded-lg bg-[#070d0a] border border-[#14241c] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-400 block">TARGET PLATFORM</span>
            <span className="text-[10px] font-mono font-bold text-slate-200">FRDM-MCXN236</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        </div>
      </div>
    </aside>
  );
}