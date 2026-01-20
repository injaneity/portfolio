import { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { githubService } from '@/services/github/GitHubService';
import toast from 'react-hot-toast';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePageModal: React.FC<CreatePageModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [section, setSection] = useState<'root' | 'projects' | 'experience'>('root');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Generate slug: lowercase, replace spaces with hyphens, remove special chars
    const generatedSlug = newTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!slug) {
      setError('Slug is required');
      return;
    }

    setLoading(true);

    try {
      // Determine the file path
      const filePath =
        section === 'root'
          ? `src/content/${slug}.md`
          : `src/content/${section}/${slug}.md`;

      // Create initial markdown content
      const initialContent = `# ${title}\n\nStart writing here...`;

      // Create the file on GitHub
      await githubService.updateContent(
        filePath,
        initialContent,
        `Create new page: ${title}`
      );

      toast.success(`Page "${title}" created successfully!`);

      // Navigate to the new page
      if (section === 'root') {
        navigate(`/${slug}`);
      } else {
        navigate(`/${section}/${slug}`);
      }

      // Reset and close
      setTitle('');
      setSlug('');
      setSection('root');
      onClose();
    } catch (err: any) {
      console.error('Error creating page:', err);
      setError(err.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F38020]" />
            <h2 className="text-xl font-semibold text-gray-900 font-sohne-medium">Create New Page</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="My New Page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38020]"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-new-page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: {section === 'root' ? '/' : `/${section}/`}{slug || 'slug'}
            </p>
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38020]"
            >
              <option value="root">Root (General Pages)</option>
              <option value="projects">Projects</option>
              <option value="experience">Experience</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#F38020] text-white rounded-lg hover:bg-[#d96d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !title || !slug}
            >
              {loading ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
