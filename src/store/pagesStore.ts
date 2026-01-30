import { create } from 'zustand';

export interface PageMetadata {
  title: string;
  slug: string;
  path: string;
  section: 'projects' | 'experience' | 'root';
  wordCount: number;
}

interface PagesState {
  pages: PageMetadata[];
  getPageBySlug: (slug: string, section?: string) => PageMetadata | undefined;
  searchPages: (query: string) => PageMetadata[];
}

// Dynamically discover all markdown files using Vite's import.meta.glob
const contentModules = import.meta.glob<string>('../content/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

// Helper to extract title from markdown content (first # heading or fallback to formatted slug)
function extractTitle(content: string, fallbackSlug: string): string {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fallback: format slug as title (e.g., "dev-01" -> "Dev 01", "landing" -> "Landing")
  return fallbackSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to count words in markdown content
function countWords(content: string): number {
  // Remove markdown syntax and count words
  const text = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/[*_~`]/g, '') // Remove formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/\n+/g, ' '); // Replace newlines with spaces

  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Determine section from slug or path
function determineSection(slug: string, path: string): 'projects' | 'experience' | 'root' {
  if (slug.startsWith('projects-') || path.includes('/projects/')) return 'projects';
  if (slug.startsWith('experience-') || path.includes('/experience/')) return 'experience';
  return 'root';
}

// Build pages array from discovered markdown files
const discoveredPages: PageMetadata[] = Object.entries(contentModules).map(([path, content]) => {
  // Extract filename without extension (e.g., "../content/landing.md" -> "landing")
  const slug = path.replace('../content/', '').replace('.md', '');
  const section = determineSection(slug, path);
  const title = extractTitle(content, slug);
  const wordCount = countWords(content);

  return {
    title,
    slug,
    path,
    section,
    wordCount,
  };
});

// Helper to dynamically load markdown content
export async function loadPageContent(slug: string): Promise<string | null> {
  try {
    const module = await import(`../content/${slug}.md?raw`);
    return module.default;
  } catch (e) {
    return null;
  }
}

export const usePagesStore = create<PagesState>((_, get) => ({
  pages: discoveredPages,

  getPageBySlug: (slug: string, section?: string) => {
    const { pages } = get();
    return pages.find(
      (page: PageMetadata) =>
        page.slug === slug &&
        (!section || page.section === section)
    );
  },

  searchPages: (query: string) => {
    const { pages } = get();
    const lowerQuery = query.toLowerCase();

    return pages.filter(
      (page: PageMetadata) =>
        page.title.toLowerCase().includes(lowerQuery) ||
        page.slug.toLowerCase().includes(lowerQuery) ||
        page.path.toLowerCase().includes(lowerQuery)
    );
  },
}));
