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


// Static metadata for known pages (add more as needed)
const staticPages: PageMetadata[] = [
  {
    title: 'Landing',
    slug: 'landing',
    path: 'src/content/landing.md',
    section: 'root',
    wordCount: 0, // Will be filled dynamically
  },
  {
    title: 'Experience',
    slug: 'experience',
    path: 'src/content/experience.md',
    section: 'root',
    wordCount: 0, // Will be filled dynamically
  },
  // Add more pages here if needed
];

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
  pages: staticPages,

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
