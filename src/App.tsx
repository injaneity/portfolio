import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { LandingPage } from '@/components/pages/LandingPage';
import { EditorPage } from '@/components/pages/EditorPage';
import { usePagesStore } from '@/store/pagesStore';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const fetchPages = usePagesStore((state) => state.fetchPages);

  useEffect(() => {
    // Fetch pages when authenticated
    if (isAuthenticated) {
      fetchPages();
    }
  }, [isAuthenticated, fetchPages]);

  return (
    <>
      <Routes>
        {/* Landing page with dual-mode editing */}
        <Route path="/" element={<LandingPage />} />

        {/* Projects section */}
        <Route path="/projects" element={<EditorPage />} />
        <Route path="/projects/:slug" element={<EditorPage />} />

        {/* Experience section */}
        <Route path="/experience" element={<EditorPage />} />
        <Route path="/experience/:slug" element={<EditorPage />} />

        {/* Catch-all for root-level pages */}
        <Route path="/:slug" element={<EditorPage />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1F1F1F',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
