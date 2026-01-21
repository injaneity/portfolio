import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('@/components/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const EditorPage = lazy(() => import('@/components/pages/EditorPage').then(m => ({ default: m.EditorPage })));

function AppContent() {

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#F6821F] mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading...</p>
          </div>
        </div>
      }>
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
      </Suspense>

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
    <div className="min-h-screen bg-white">
      <AppContent />
    </div>
  );
}

export default App;
