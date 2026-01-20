import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { useAuth } from '@/features/auth/AuthProvider';
import { githubService } from '@/services/github/GitHubService';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export const EditorPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine section from pathname
  const pathname = location.pathname;
  const section = pathname.startsWith('/projects')
    ? 'projects'
    : pathname.startsWith('/experience')
    ? 'experience'
    : undefined;

  // Determine the content path
  // Use "index" as slug when slug is undefined (for /projects and /experience routes)
  const actualSlug = slug || 'index';
  const contentPath = section
    ? `src/content/${section}/${actualSlug}.md`
    : `src/content/${actualSlug}.md`;

  useEffect(() => {
    loadContent();
  }, [section, slug, isAuthenticated]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Admin: Load from GitHub with auth
        const githubContent = await githubService.getContent(contentPath);
        setContent(githubContent);
      } else {
        // Guest: Check localStorage first, then fetch from public GitHub
        const storageKey = `page_demo_${contentPath}`;
        const localContent = localStorage.getItem(storageKey);

        if (localContent) {
          // Use local edits if they exist
          setContent(localContent);
        } else {
          // Otherwise fetch from public GitHub
          const response = await fetch(
            `https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_OWNER}/${import.meta.env.VITE_GITHUB_REPO}/${import.meta.env.VITE_GITHUB_BRANCH}/${contentPath}`
          );

          if (response.ok) {
            const githubContent = await response.text();
            setContent(githubContent);
          } else if (response.status === 404) {
            setError('Page not found');
          } else {
            setError('Failed to load page content');
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading content:', err);
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        setError('Page not found');
      } else {
        setError(err.message || 'Failed to load page content');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = async (newContent: string) => {
    if (isAuthenticated) {
      // Admin: Save to GitHub
      try {
        await githubService.updateContent(
          contentPath,
          newContent,
          `Update ${section ? `${section}/` : ''}${actualSlug}`
        );
        toast.success('Changes saved to GitHub');
      } catch (error: any) {
        console.error('Error saving content:', error);
        toast.error('Failed to save changes');
      }
    } else {
      // Guest: Save to localStorage (local only, not persisted to GitHub)
      const storageKey = `page_demo_${contentPath}`;
      localStorage.setItem(storageKey, newContent);
      setContent(newContent);
      // No toast for guests - silent local save
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F38020] mx-auto mb-4"></div>
          <p className="text-gray-600 font-sohne-regular">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2 font-sohne-bold">Error</h2>
              <p className="text-red-800 mb-4 font-sohne-regular">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-sohne-regular"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TiptapEditor
      initialContent={content}
      editable={true}
      onContentChange={handleContentChange}
      placeholder="Start writing..."
    />
  );
};
