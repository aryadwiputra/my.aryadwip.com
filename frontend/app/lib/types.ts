export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}