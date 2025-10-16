/**
 * Client-side authentication port.
 * Used for interacting with the auth API from the frontend.
 */
export interface AuthClientPort {
  signup(input: {
    email: string;
    password: string;
    name: string;
    defaultCurrency: string;
  }): Promise<void>;

  login(input: {
    email: string;
    password: string;
  }): Promise<void>;

  logout(): Promise<void>;

  refreshToken(): Promise<void>;

  getMe(): Promise<{
    id: string;
    email: string;
    name: string;
    defaultCurrency: string;
    createdAt: string;
  } | null>;

  getSessionToken(): Promise<string | null>;
}