'use client';

import { useDeviceStore } from '@/stores/deviceStore';
import MetricCard from '@/components/ui/MetricCard';
import DeviceTwin from '@/components/dashboard/DeviceTwin';
import FirmwareDeployment from '@/components/dashboard/FirmwareDeployment';
import LiveEvents from '@/components/dashboard/LiveEvents';

export default function DashboardPage() {
  const { fleetSummary, devices, events, isLoading } = useDeviceStore();
  const primaryDevice = devices.find((d) => d.deviceId === 'NXP-001') ?? devices[0];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
              Command Center
            </h1>
            <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-300/60 dark:border-blue-700/60 text-blue-600 dark:text-blue-400 font-bold tracking-wider shadow-sm">
              NXP FRDM-MCXN236
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-Time Dual-Bank Firmware Lifecycle &amp; Hardware Resilience Platform
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-white/90 dark:border-white/10 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03),_inset_0_1px_1px_rgba(255,255,255,1)]">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="font-sans text-xs text-slate-700 dark:text-slate-200 font-bold tracking-wide">
            Fleet Online &bull; 100% Health
          </span>
        </div>
      </div>

      {/* 2. Compact System Status Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Total Devices"
          value={fleetSummary?.totalDevices ?? 1}
          isLoading={isLoading}
          color="info"
          icon="server"
        />
        <MetricCard
          label="Healthy"
          value={fleetSummary?.healthy ?? 1}
          isLoading={isLoading}
          color="success"
          icon="check-circle"
        />
        <MetricCard
          label="Updating"
          value={fleetSummary?.updating ?? 0}
          isLoading={isLoading}
          color="warning"
          icon="refresh"
        />
        <MetricCard
          label="Failed"
          value={fleetSummary?.failed ?? 0}
          isLoading={isLoading}
          color="danger"
          icon="x-circle"
        />
        <MetricCard
          label="Safe Mode"
          value={fleetSummary?.safeMode ?? 0}
          isLoading={isLoading}
          color="orange"
          icon="shield-alert"
        />
        <MetricCard
          label="Security Events"
          value={fleetSummary?.securityEvents ?? 0}
          isLoading={isLoading}
          color="accent"
          icon="alert-triangle"
        />
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Master Hardware Twin & Firmware Repository (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <DeviceTwin device={primaryDevice} />
          <FirmwareDeployment />
        </div>

        {/* Right Column: Real-Time Event Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <LiveEvents events={events} />
        </div>
      </div>
    </div>
  );
}