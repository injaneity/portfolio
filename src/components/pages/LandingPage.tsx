import { useState, useEffect } from 'react';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { useAuth } from '@/features/auth/AuthProvider';
import { githubService } from '@/services/github/GitHubService';
import toast from 'react-hot-toast';

const DEMO_STORAGE_KEY = 'landing_demo';
const CONTENT_PATH = 'src/content/landing.md';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [isAuthenticated]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Admin: Load from GitHub
        const githubContent = await githubService.getContent(CONTENT_PATH);
        setContent(githubContent);
      } else {
        // Guest: Try to fetch from GitHub first (if public repo)
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_OWNER}/${import.meta.env.VITE_GITHUB_REPO}/${import.meta.env.VITE_GITHUB_BRANCH}/${CONTENT_PATH}`
          );
          if (response.ok) {
            const githubContent = await response.text();
            // Check if there's local demo content
            const localContent = localStorage.getItem(DEMO_STORAGE_KEY);
            // Use local content if exists, otherwise use GitHub content
            setContent(localContent || githubContent);
          } else {
            // If fetch fails, check localStorage or use default
            const localContent = localStorage.getItem(DEMO_STORAGE_KEY);
            setContent(localContent || `# Hi! I'm Zane Chee.\n\n## About Me\n\nAs a full-time software engineer, I've learned that my true strength lies in designing software, not landscape sketches. From winning hackathons to building impactful systems, I thrive on solving tough problems.\n\n> In the spirit of art, my portfolio is fully editable with markdown. Try it!`);
          }
        } catch {
          // On fetch error, check localStorage or use default
          const localContent = localStorage.getItem(DEMO_STORAGE_KEY);
          setContent(localContent || `# Hi! I'm Zane Chee.\n\n## About Me\n\nAs a full-time software engineer, I've learned that my true strength lies in designing software, not landscape sketches. From winning hackathons to building impactful systems, I thrive on solving tough problems.\n\n> In the spirit of art, my portfolio is fully editable with markdown. Try it!`);
        }
      }
    } catch (error: any) {
      console.error('Error loading content:', error);
      toast.error('Failed to load page content');
      setContent(`# Hi! I'm Zane Chee.\n\n## About Me\n\nAs a full-time software engineer, I've learned that my true strength lies in designing software, not landscape sketches. From winning hackathons to building impactful systems, I thrive on solving tough problems.\n\n> In the spirit of art, my portfolio is fully editable with markdown. Try it!`);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = async (newContent: string) => {
    if (isAuthenticated) {
      // Admin: Save to GitHub
      try {
        await githubService.updateContent(
          CONTENT_PATH,
          newContent,
          'Update landing page'
        );
        toast.success('Changes saved to GitHub');
      } catch (error: any) {
        console.error('Error saving content:', error);
        toast.error('Failed to save changes');
      }
    } else {
      // Guest: Save to localStorage
      localStorage.setItem(DEMO_STORAGE_KEY, newContent);
      setContent(newContent);
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

  return (
    <TiptapEditor
      initialContent={content}
      editable={true}
      onContentChange={handleContentChange}
      mode={isAuthenticated ? 'admin' : 'demo'}
      placeholder="Start writing your landing page..."
    />
  );
};
