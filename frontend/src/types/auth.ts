// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'view_dashboard'
  | 'view_analytics'
  | 'upload_data'
  | 'edit_settings'
  | 'manage_users';

export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  admin: [
    'view_dashboard',
    'view_analytics',
    'upload_data',
    'edit_settings',
    'manage_users'
  ],
  editor: [
    'view_dashboard',
    'view_analytics',
    'upload_data',
    'edit_settings'
  ],
  viewer: [
    'view_dashboard',
    'view_analytics'
  ]
};