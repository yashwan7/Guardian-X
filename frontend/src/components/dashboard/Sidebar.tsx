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
    <aside className="w-56 shrink-0 bg-[#08111e] border-r border-[#1a3250] flex flex-col justify-between select-none z-20 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#1a3250] flex items-center gap-2.5 bg-[#0a1524]">
          <div className="w-7 h-7 rounded-lg bg-[#203B5C]/30 border border-[#84B6E4]/40 flex items-center justify-center text-[#84B6E4] shadow-[0_0_12px_rgba(132,182,228,0.25)]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">
                GUARDIAN
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#203B5C]/50 text-[#84B6E4] border border-[#84B6E4]/40 font-semibold shadow-[0_0_8px_rgba(132,182,228,0.25)]">
                X
              </span>
            </div>
            <p className="text-[9px] font-mono text-[#84B6E4]/80 tracking-widest uppercase -mt-0.5 font-medium">
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
                        ? 'bg-[#203B5C]/40 text-[#84B6E4] font-semibold border border-[#84B6E4]/40 shadow-[0_0_14px_rgba(132,182,228,0.2)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#102038]'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? 'text-[#84B6E4]' : 'text-slate-400 group-hover:text-[#84B6E4]'
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
      <div className="p-3 border-t border-[#1a3250] bg-[#060c16]">
        <div className="p-2 rounded-lg bg-[#0c182a] border border-[#1e385c] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-slate-400 block">TARGET PLATFORM</span>
            <span className="text-[10px] font-mono font-bold text-slate-200">FRDM-MCXN236</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#84B6E4] animate-pulse shadow-[0_0_10px_#84B6E4]" />
        </div>
      </div>
    </aside>
  );
}