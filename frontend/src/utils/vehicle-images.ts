// Vehicle Image Helper mapping matching user's TrustRide Fleet Reference

export interface VehicleImageInfo {
  id: string;
  name: string;
  plate: string;
  type: string;
  category: string;
  badgeBg: string;
  badgeText: string;
  svgIcon: string;
  imageEmoji: string;
  primaryColor: string;
  imageUrl?: string;
}

export const VEHICLE_IMAGE_MAP: Record<string, VehicleImageInfo> = {
  'TR-101': {
    id: 'TR-101',
    name: 'Sargam Electric Rickshaw',
    plate: 'MH-12-ER-1001',
    type: 'Electric Rickshaw',
    category: 'Passenger 3-Wheeler',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    svgIcon: '🛺',
    imageEmoji: '🛺',
    primaryColor: '#2563eb',
    imageUrl: '/vehicles/sargam-rickshaw.png',
  },
  'V-1001': {
    id: 'V-1001',
    name: 'Sargam Electric Rickshaw',
    plate: 'MH-12-ER-1001',
    type: 'Electric Rickshaw',
    category: 'Passenger 3-Wheeler',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    svgIcon: '🛺',
    imageEmoji: '🛺',
    primaryColor: '#2563eb',
    imageUrl: '/vehicles/sargam-rickshaw.png',
  },
  'TR-102': {
    id: 'TR-102',
    name: 'Mahindra Treo',
    plate: 'KA-01-TR-2002',
    type: 'Electric Rickshaw',
    category: 'Passenger 3-Wheeler',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    svgIcon: '🛺',
    imageEmoji: '⚡',
    primaryColor: '#d97706',
    imageUrl: '/vehicles/mahindra-treo.png',
  },
  'V-1002': {
    id: 'V-1002',
    name: 'Mahindra Treo',
    plate: 'KA-01-TR-2002',
    type: 'Electric Rickshaw',
    category: 'Passenger 3-Wheeler',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    svgIcon: '🛺',
    imageEmoji: '⚡',
    primaryColor: '#d97706',
    imageUrl: '/vehicles/mahindra-treo.png',
  },
  'TR-103': {
    id: 'TR-103',
    name: 'Piaggio Ape E-City',
    plate: 'DL-01-AP-3003',
    type: 'Electric 3-Wheeler',
    category: 'Cargo Box Van',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    svgIcon: '🛺',
    imageEmoji: '🛺',
    primaryColor: '#0284c7',
    imageUrl: '/vehicles/piaggio-ape.png',
  },
  'V-1003': {
    id: 'V-1003',
    name: 'Piaggio Ape E-City',
    plate: 'DL-01-AP-3003',
    type: 'Electric 3-Wheeler',
    category: 'Cargo Box Van',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    svgIcon: '🛺',
    imageEmoji: '🛺',
    primaryColor: '#0284c7',
    imageUrl: '/vehicles/piaggio-ape.png',
  },
  'V-1004': {
    id: 'V-1004',
    name: 'Euler HiLoad EV',
    plate: 'HR-26-EU-4004',
    type: 'Electric Light Truck',
    category: 'Flatbed Commercial Pickup',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-600 dark:text-amber-400',
    svgIcon: '🚚',
    imageEmoji: '🛠️',
    primaryColor: '#eab308',
    imageUrl: '/vehicles/euler-hiload.png',
  },
  'V-1005': {
    id: 'V-1005',
    name: 'Omega Seiki Rage+',
    plate: 'TS-09-OS-5005',
    type: 'Electric Motorcycle',
    category: 'Heavy Duty Cargo Trike',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-600 dark:text-rose-400',
    svgIcon: '🏍️',
    imageEmoji: '🔒',
    primaryColor: '#dc2626',
    imageUrl: '/vehicles/omega-rage.png',
  },
  'V-1006': {
    id: 'V-1006',
    name: 'TATA Ace EV 1000',
    plate: 'MH-14-TA-6006',
    type: 'Electric Light Truck',
    category: 'Four Wheeler Cargo Container',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-600 dark:text-purple-400',
    svgIcon: '🚚',
    imageEmoji: '🚚',
    primaryColor: '#9333ea',
    imageUrl: '/vehicles/tata-ace.png',
  },
  'V-1007': {
    id: 'V-1007',
    name: 'Bajaj Maxima C EV',
    plate: 'UP-32-BJ-7007',
    type: 'Electric 3-Wheeler',
    category: 'Open Cargo Deck',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    svgIcon: '🛺',
    imageEmoji: '🛺',
    primaryColor: '#2563eb',
    imageUrl: '/vehicles/bajaj-maxima.png',
  },
  'V-1008': {
    id: 'V-1008',
    name: 'Zypp Electric Scooter',
    plate: 'MH-01-ZP-8008',
    type: 'Electric Scooter',
    category: 'Last-Mile Delivery Moped',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    svgIcon: '🛵',
    imageEmoji: '🛵',
    primaryColor: '#16a34a',
    imageUrl: '/vehicles/zypp-scooter.png',
  },
};

export function getVehicleImage(id: string): VehicleImageInfo {
  return VEHICLE_IMAGE_MAP[id] || VEHICLE_IMAGE_MAP['TR-101'];
}
