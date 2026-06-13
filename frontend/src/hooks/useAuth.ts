'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { TOKEN_KEY } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const jwt = token.startsWith('Bearer ') ? token.slice(7) : token;
      const payload = JSON.parse(atob(jwt.split('.')[1]));

      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      setState({
        user: payload as User,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(
    (token: string, user: User) => {
      localStorage.setItem(TOKEN_KEY, token);
      setState({ user, isLoading: false, isAuthenticated: true });
      router.push('/dashboard');
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/login');
  }, [router]);

  return { ...state, login, logout };
};
