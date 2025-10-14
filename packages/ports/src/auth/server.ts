/**
 * Server-side authentication port.
 * Implement this interface in your adapters.
 */
export interface AuthServerPort {
  signup(input: {
    email: string;
    password: string;
    name: string;
    defaultCurrency: string;
  }): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      defaultCurrency: string;
      createdAt: string;
    };
    accessToken: string;
    refreshToken: string;
  }>;

  login(input: {
    email: string;
    password: string;
  }): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      defaultCurrency: string;
      createdAt: string;
    };
    accessToken: string;
    refreshToken: string;
  }>;

  logout(refreshToken: string): Promise<void>;

  refreshToken(input: {
    refreshToken: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;

  getUserById(id: string): Promise<{
    id: string;
    email: string;
    name: string;
    defaultCurrency: string;
    createdAt: string;
  } | null>;

  forgotPassword(email: string): Promise<void>;

  resetPassword(input: {
    token: string;
    newPassword: string;
  }): Promise<void>;
}