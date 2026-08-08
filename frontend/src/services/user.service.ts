import { mockUsers, mockTeamMembers, currentUser } from '@/data/mock-users';
import type { User, TeamMember, UserRole } from '@/types/user';

const delay = (ms: number = 200) => new Promise(r => setTimeout(r, ms));

export const userService = {
  async getCurrentUser(): Promise<User> {
    await delay();
    return currentUser;
  },
  async getAll(): Promise<User[]> {
    await delay();
    return mockUsers;
  },
  async getById(id: string): Promise<User | undefined> {
    await delay(150);
    return mockUsers.find(u => u.id === id);
  },
  async getTeamMembers(): Promise<TeamMember[]> {
    await delay();
    return mockTeamMembers;
  },
  async getByRole(role: UserRole): Promise<User[]> {
    await delay();
    return mockUsers.filter(u => u.role === role);
  },
};
