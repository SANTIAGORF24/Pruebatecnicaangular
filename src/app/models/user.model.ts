export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  success: boolean;
  message?: string;
} 