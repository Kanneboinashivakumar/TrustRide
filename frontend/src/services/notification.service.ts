import { mockNotifications } from '@/data/mock-notifications';
import type { Notification, ActivityCategory } from '@/types/common';

const API_BASE = 'http://localhost:4000/api';

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    return fetchJson<Notification[]>(`${API_BASE}/notifications`, mockNotifications);
  },
  async getUnread(): Promise<Notification[]> {
    const notifs = await this.getAll();
    return notifs.filter(n => !n.read && !n.isRead);
  },
  async getByCategory(category: ActivityCategory): Promise<Notification[]> {
    const notifs = await this.getAll();
    if (category === 'all') return notifs;
    return notifs.filter(n => n.category === category || n.type === category);
  },
  async markAsRead(id: string): Promise<void> {
    const n = mockNotifications.find(x => x.id === id);
    if (n) {
      n.read = true;
      n.isRead = true;
    }
  },
  async markAllAsRead(): Promise<void> {
    mockNotifications.forEach(n => {
      n.read = true;
      n.isRead = true;
    });
  },
  async getUnreadCount(): Promise<number> {
    const unread = await this.getUnread();
    return unread.length;
  },
};
