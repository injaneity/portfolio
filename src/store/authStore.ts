import { create } from 'zustand';
import { githubService } from '@/services/github/GitHubService';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  login: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: async (token: string) => {
    // Validate token format
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      return {
        success: false,
        error: 'Invalid token format. Please provide a valid GitHub Personal Access Token.',
      };
    }

    // Validate token with GitHub API
    const validation = await githubService.validateToken(token);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Failed to authenticate with GitHub',
      };
    }

    // Store token in sessionStorage
    sessionStorage.setItem('github_pat', token);

    // Authenticate the GitHub service
    githubService.authenticate(token);

    // Update state
    set({
      isAuthenticated: true,
      user: validation.user,
      token,
    });

    return { success: true };
  },

  logout: () => {
    // Clear sessionStorage
    sessionStorage.removeItem('github_pat');

    // Reset state
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },

  checkSession: () => {
    // Check if token exists in sessionStorage
    const token = sessionStorage.getItem('github_pat');

    if (token) {
      // Re-authenticate with stored token
      githubService.authenticate(token);

      // Validate token and restore user
      githubService.validateToken(token).then((validation) => {
        if (validation.valid) {
          set({
            isAuthenticated: true,
            user: validation.user,
            token,
          });
        } else {
          // Token is invalid, clear it
          sessionStorage.removeItem('github_pat');
        }
      });
    }
  },
}));
