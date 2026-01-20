import { Settings, Check } from 'lucide-react';
import { SettingsMenu } from '@/components/layout/SettingsMenu';
import { useState } from 'react';

interface EditorToolbarProps {
  saveStatus: 'saved' | 'saving' | 'unsaved';
  demoMode?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ saveStatus, demoMode }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[680px] mx-auto px-4 h-12 flex items-center justify-between">
          {/* Left side - Save status or Demo mode */}
          <div className="flex items-center gap-3">
            {demoMode ? (
              <span className="text-sm text-gray-500 font-sohne-regular">Demo mode</span>
            ) : (
              <>
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-1.5 text-sm text-green-600 font-sohne-regular">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </div>
                )}
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 font-sohne-regular">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-sm text-gray-400 font-sohne-regular">Unsaved</span>
                )}
              </>
            )}
          </div>

          {/* Right side - Settings icon */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Settings Menu */}
      {settingsOpen && (
        <SettingsMenu onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
};
