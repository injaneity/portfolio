import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
};

// Custom hook to use auth
export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
};
