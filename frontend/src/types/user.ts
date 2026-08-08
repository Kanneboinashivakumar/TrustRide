export type UserRole = 'admin' | 'financier' | 'fleet_operator' | 'driver' | 'auditor' | 'regulator' | 'oem';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  organization: string;
  department?: string;
  phone?: string;
  lastActive?: string;
  status?: string;
  permissions?: string[];
}

export interface TeamMember extends User {
  joinedAt?: string;
  permissions?: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}
