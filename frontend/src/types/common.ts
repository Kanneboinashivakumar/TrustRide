export type Status = 'online' | 'offline' | 'warning' | 'danger' | 'pending' | 'idle';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Theme = 'light' | 'dark' | 'system';
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';
export type ViewMode = 'table' | 'grid' | 'map';
export type SortDirection = 'asc' | 'desc';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  loading?: boolean;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'critical' | 'command' | 'audit' | 'security';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  isRead?: boolean;
  category?: ActivityCategory;
  link?: string;
}

export type ActivityCategory = 'all' | 'critical' | 'warnings' | 'commands' | 'security' | 'audit';
