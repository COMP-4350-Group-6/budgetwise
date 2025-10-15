import type { AuthClientPort } from "@budget/ports";

export function makeAuthClientUsecases(deps: { auth: AuthClientPort }) {
  const { auth } = deps;
  return {
    getCurrentUser: () => auth.getMe(),
    signUp: (input: Parameters<AuthClientPort["signup"]>[0]) => auth.signup(input),
    signIn: (input: Parameters<AuthClientPort["login"]>[0]) => auth.login(input),
    signOut: () => auth.logout(),
  };
}


