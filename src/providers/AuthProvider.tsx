import type { PropsWithChildren } from 'react';
import { AuthProvider as SupabaseAuthProvider } from '../contexts/AuthContext';

export function AuthProvider({ children }: PropsWithChildren) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
} 