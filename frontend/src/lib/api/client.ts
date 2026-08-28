import { createClient } from '@/lib/supabase/client';
import type { Device, FirmwareRelease, FleetSummary, DeviceEvent } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Not authenticated or Supabase not configured
  }
  return {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(options?.headers as Record<string, string> || {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((error as { error?: string }).error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; version: string; timestamp: string }>('/api/health'),
  devices: {
    list: () => request<Device[]>('/api/devices'),
    get: (deviceId: string) => request<Device>(`/api/devices/${deviceId}`),
  },
  fleet: {
    summary: () => request<FleetSummary>('/api/fleet/summary'),
  },
  firmware: {
    list: () => request<FirmwareRelease[]>('/api/firmware'),
    get: (id: string) => request<FirmwareRelease>(`/api/firmware/${id}`),
  },
  deployments: {
    create: (data: { firmwareReleaseId: string; deviceId: string }) =>
      request<unknown>('/api/deployments', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<unknown[]>('/api/deployments'),
  },
  events: {
    list: () => request<DeviceEvent[]>('/api/events'),
    security: () => request<unknown[]>('/api/events/security'),
  },
};