export type UserRole = 'CLIENT' | 'VENDOR' | 'ADMIN';

export interface User {
  id?: number;
  username: string;
  email?: string;
  role?: UserRole;
  phone_number?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}
