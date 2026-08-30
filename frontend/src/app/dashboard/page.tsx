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
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Command Center
            </h1>
            <span className="text-[9px] font-mono bg-[#203B5C]/40 border border-[#84B6E4]/40 text-[#84B6E4] px-2 py-0.5 rounded font-semibold tracking-wider shadow-[0_0_8px_rgba(132,182,228,0.2)]">
              NXP FRDM-MCXN236
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-Time Dual-Bank Firmware Lifecycle &amp; Hardware Resilience Platform
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#0c182a] border border-[#1a3250] rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[#84B6E4] animate-pulse shadow-[0_0_8px_#84B6E4]" />
          <span className="font-mono text-[11px] text-[#84B6E4] font-semibold tracking-wider">
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

        {/* Right Column: Real-Time Event Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <LiveEvents events={events} />
        </div>
      </div>
    </div>
  );
}