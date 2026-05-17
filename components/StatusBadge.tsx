'use client';

import { Badge } from './Badge';
import { useGlobal } from '@/app/providers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_KEY_MAP: Record<string, string> = {
  live: 'status_live',
  pending: 'status_pending',
  approved: 'status_approved',
  rejected: 'status_rejected',
  active: 'status_active',
  inactive: 'status_inactive',
  suspended: 'status_suspended',
  banned: 'status_banned',
  completed: 'status_completed',
  preparing: 'status_preparing',
  ready: 'status_ready',
  picked_up: 'status_picked_up',
  in_transit: 'status_in_transit',
  delivered: 'status_delivered',
  cancelled: 'status_cancelled',
  healthy: 'status_healthy',
  'high load': 'status_high_load',
  out_of_stock: 'status_out_of_stock',
  archived: 'status_archived',
};

const statusVariant: Record<string, Parameters<typeof Badge>[0]['variant']> = {
  live: 'success',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  active: 'success',
  inactive: 'default',
  suspended: 'error',
  banned: 'error',
  completed: 'default',
  preparing: 'info',
  ready: 'success',
  picked_up: 'purple',
  in_transit: 'orange',
  delivered: 'success',
  cancelled: 'error',
  healthy: 'success',
  'high load': 'warning',
  out_of_stock: 'error',
  archived: 'default',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useGlobal();
  const key = status.toLowerCase();
  const variant = statusVariant[key] || 'default';
  const label = t(STATUS_KEY_MAP[key] || 'status_' + key);
  return <Badge variant={variant} size={size}>{label}</Badge>;
}
