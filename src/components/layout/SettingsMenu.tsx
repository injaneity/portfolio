import { useState, useEffect, useRef } from 'react';
import { User, Plus, LogOut, Key, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthModal } from '@/components/modals/AuthModal';
import { CreatePageModal } from '@/components/modals/CreatePageModal';

interface SettingsMenuProps {
  onClose: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createPageModalOpen, setCreatePageModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[55]" onClick={onClose} />

      {/* Settings Panel */}
      <div
        ref={menuRef}
        className="fixed top-16 left-1/2 -translate-x-1/2 translate-x-[8rem] w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 font-sohne-medium">Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="py-2">
          {isAuthenticated && user ? (
            <>
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || user.login}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email || `@${user.login}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <button
                onClick={() => {
                  setCreatePageModalOpen(true);
                  onClose();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-sohne-regular"
              >
                <Plus className="w-4 h-4" />
                <span>New Page</span>
              </button>

              <div className="my-2 border-t border-gray-100" />

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Guest</p>
                    <p className="text-xs text-gray-500">View only</p>
                  </div>
                </div>
              </div>

              {/* Login Action */}
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  onClose();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 font-sohne-regular"
              >
                <Key className="w-4 h-4" />
                <span>Login with GitHub</span>
              </button>

              <div className="px-4 py-3 text-xs text-gray-500">
                Login to edit and create pages. Landing page edits are saved locally for guests.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CreatePageModal
        isOpen={createPageModalOpen}
        onClose={() => setCreatePageModalOpen(false)}
      />
    </>
  );
};
