import { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';

export const UserMenu: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {isAuthenticated && user ? (
          <>
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium">{user.name || user.login}</span>
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Guest</span>
          </>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {isAuthenticated && user ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.login}
                </p>
                <p className="text-xs text-gray-500">{user.email || `@${user.login}`}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600">
                Guest mode - View only
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Landing page edits are saved locally
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
