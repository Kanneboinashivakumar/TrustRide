import { Notification } from '@/types/common';

export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'warning',
    title: 'GPS Spoofing Alert',
    message: 'GPS Spoofing detected on Vehicle V-1002 (Mahindra Treo). Fallback location sensors activated.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false,
    isRead: false,
    category: 'security',
    link: '/app/threat-sandbox'
  },
  {
    id: 'NOTIF-002',
    type: 'info',
    title: 'Immobilization Executed',
    message: 'Immobilization command CMD-8821 was successfully executed on Sargam Electric Rickshaw.',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    read: false,
    isRead: false,
    category: 'commands',
    link: '/app/command-center'
  },
  {
    id: 'NOTIF-003',
    type: 'success',
    title: 'Hash Chain Verified',
    message: 'SHA-256 Hash Chain verification completed successfully across all 12 blocks.',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    read: true,
    isRead: true,
    category: 'audit',
    link: '/app/audit'
  },
  {
    id: 'NOTIF-004',
    type: 'warning',
    title: 'Replay Attempt Blocked',
    message: 'Stale command payload blocked by Nonce Replay Check for Vehicle V-1004.',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    read: true,
    isRead: true,
    category: 'security',
    link: '/app/threat-sandbox'
  }
];
