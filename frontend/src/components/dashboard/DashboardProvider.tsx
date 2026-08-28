'use client';

import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket/client';
import { useDeviceStore } from '@/stores/deviceStore';
import { api } from '@/lib/api/client';
import type { TelemetryPayload, DeviceEvent } from '@/types';

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
  const {
    setDevices, setFirmware, setFleetSummary, setEvents,
    setWsConnected, setBackendConnected, updateFromTelemetry,
    addEvent, updateDevice, setIsLoading
  } = useDeviceStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devices, firmware, summary, events] = await Promise.allSettled([
          api.devices.list(),
          api.firmware.list(),
          api.fleet.summary(),
          api.events.list(),
        ]);
        if (devices.status === 'fulfilled') setDevices(devices.value);
        if (firmware.status === 'fulfilled') setFirmware(firmware.value);
        if (summary.status === 'fulfilled') setFleetSummary(summary.value);
        if (events.status === 'fulfilled') setEvents(events.value);
        setBackendConnected(true);
      } catch {
        setBackendConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Refresh data periodically
    const refreshInterval = setInterval(() => {
      api.fleet.summary().then(setFleetSummary).catch(() => {});
    }, 10000);

    // Connect WebSocket
    wsClient.connect(
      () => {
        setWsConnected(true);
        wsClient.subscribe('/topic/telemetry', (data) => {
          updateFromTelemetry(data as TelemetryPayload);
        });
        wsClient.subscribe('/topic/events', (data) => {
          addEvent(data as DeviceEvent);
          api.fleet.summary().then(setFleetSummary).catch(() => {});
        });
        wsClient.subscribe('/topic/devices/NXP-001', (data) => {
          const device = data as import('@/types').Device;
          updateDevice(device.deviceId, device);
        });
      },
      () => setWsConnected(false)
    );

    return () => {
      clearInterval(refreshInterval);
      wsClient.disconnect();
    };
  }, []);

  return <>{children}</>;
}