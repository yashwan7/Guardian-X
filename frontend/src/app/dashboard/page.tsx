'use client';

import { useDeviceStore } from '@/stores/deviceStore';
import MetricCard from '@/components/ui/MetricCard';
import DeviceTwin from '@/components/dashboard/DeviceTwin';
import FirmwareDeployment from '@/components/dashboard/FirmwareDeployment';
import LiveEvents from '@/components/dashboard/LiveEvents';
import FleetHealth from '@/components/dashboard/FleetHealth';

export default function DashboardPage() {
  const { fleetSummary, devices, events, isLoading } = useDeviceStore();
  const primaryDevice = devices.find((d) => d.deviceId === 'NXP-001') ?? devices[0];

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Command Center
            </h1>
            <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-semibold tracking-wider shadow-[0_0_8px_rgba(0,245,160,0.12)]">
              NXP FRDM-MCXN236
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-Time Dual-Bank Firmware Lifecycle &amp; Hardware Resilience Platform
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#060b08] border border-[#14221b] rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider">
            FLEET ONLINE &bull; 100% HEALTH
          </span>
        </div>
      </div>

      {/* 2. Compact System Status Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Master Hardware Twin & Firmware Repository (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <DeviceTwin device={primaryDevice} />
          <FirmwareDeployment />
        </div>

        {/* Right Column: Fleet Health & Real-Time Event Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <FleetHealth summary={fleetSummary} isLoading={isLoading} />
          <LiveEvents events={events} />
        </div>
      </div>
    </div>
  );
}