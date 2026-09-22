export type UserRole = 'PASSENGER' | 'OPERATIONS_AGENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserRegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}
