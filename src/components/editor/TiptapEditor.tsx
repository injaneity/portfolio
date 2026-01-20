import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { SearchBar } from '../layout/SearchBar';

interface TiptapEditorProps {
  initialContent: string;
  editable: boolean;
  onContentChange?: (markdown: string) => void;
  placeholder?: string;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialContent,
  editable,
  onContentChange,
  placeholder = 'Start writing...',
  onSaveStatusChange,
}) => {
  const saveTimeoutRef = useRef<number | undefined>(undefined);
  const lastContentRef = useRef(initialContent);
  const [_, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#F6821F] cursor-pointer transition-colors',
        },
      }),
      Image,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-[680px] mx-auto focus:outline-none px-4 py-8',
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        const markdown = ((editor.storage as any).markdown as any).getMarkdown();

        // Check if content actually changed
        if (markdown !== lastContentRef.current) {
          setSaveStatus('unsaved');
          onSaveStatusChange?.('unsaved');

          // Clear existing timeout
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          // Set saving status and debounce save
          saveTimeoutRef.current = setTimeout(() => {
            setSaveStatus('saving');
            onSaveStatusChange?.('saving');
            onContentChange(markdown);
            lastContentRef.current = markdown;

            // After save completes, set to saved
            setTimeout(() => {
              setSaveStatus('saved');
              onSaveStatusChange?.('saved');
            }, 500);
          }, 2000);
        }
      }
    },
  });

  // Update editor when content changes externally
  useEffect(() => {
    if (editor && initialContent !== ((editor.storage as any).markdown as any).getMarkdown()) {
      editor.commands.setContent(initialContent);
      lastContentRef.current = initialContent;
    }
  }, [initialContent, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Intercept clicks on links inside the editor and use SPA navigation
  const navigate = useNavigate();
  useEffect(() => {
    if (!editor) return;

    const dom = (editor.view && (editor.view as any).dom) || null;
    if (!dom) return;

    const handleClick = (e: MouseEvent) => {
      if (editable) return; // don't intercept while editing

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore hash links, mailto:, tel:, and external http(s) links
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        /^https?:\/\//i.test(href)
      ) {
        return;
      }

      // Prevent default and navigate via react-router for internal links
      e.preventDefault();
      try {
        navigate(href);
      } catch (err) {
        // fallback: change location
        window.location.href = href;
      }
    };

    dom.addEventListener('click', handleClick);
    return () => dom.removeEventListener('click', handleClick);
  }, [editor, editable, navigate]);

  // Mount a React LinkIcon into each anchor inside the editor (reliable React component instead of CSS ::after)
  useEffect(() => {
    if (!editor) return;

    const dom = (editor.view && (editor.view as any).dom) as HTMLElement | null;
    if (!dom) return;

    const roots = new WeakMap<HTMLElement, Root>();

      const mountIcon = (anchor: HTMLAnchorElement) => {
      if (anchor.dataset.hasIcon) return;
      // create wrapper span
      const span = document.createElement('span');
      span.className = 'inline-block align-middle ml-2 link-icon-root';
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      span.style.pointerEvents = 'none';
      // append span after anchor text
      anchor.appendChild(span);
      try {
        const root = createRoot(span);
        root.render(<Link2 color="#F6821F" size={16} />);
        roots.set(span, root);
        anchor.dataset.hasIcon = '1';
      } catch (err) {
        // ignore render errors
      }
    };

    const unmountIcon = (span: HTMLElement) => {
      const root = roots.get(span);
      if (root) {
        try {
          root.unmount();
        } catch (e) {
          /* ignore */
        }
      }
      if (span.parentNode) span.parentNode.removeChild(span);
    };

    // initial pass
    const scan = () => {
      const anchors = Array.from(dom.querySelectorAll('a')) as HTMLAnchorElement[];
      anchors.forEach((a) => {
        // skip external links and mailto/tel/hash
        const href = a.getAttribute('href') || '';
        if (/^(mailto:|tel:|#|https?:\/\/)/i.test(href)) return;
        mountIcon(a);
      });
    };

    // initial scan and mount
    scan();
    const delayed = setTimeout(scan, 200);

    // Re-scan and mount icons whenever the editor updates content
    const updateHandler = () => {
      scan();
    };

    editor.on('update', updateHandler);

    return () => {
      clearTimeout(delayed);
      try {
        editor.off('update', updateHandler);
      } catch (e) {
        // ignore
      }
      // cleanup created roots
      const spans = Array.from(dom.querySelectorAll('.link-icon-root')) as HTMLElement[];
      spans.forEach((s) => unmountIcon(s));
    };
  }, [editor]);

  // Show back to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Centered Search Bar - Fixed at top */}
      <div className="flex-shrink-0 pt-12 pb-8 bg-white z-10">
        <div className="max-w-2xl mx-auto px-4">
          <SearchBar centered />
        </div>
      </div>

      {/* Editor content - Scrollable area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 flex items-center gap-2 text-[#F6821F] hover:text-[#d96d1a] transition-colors duration-300 z-50 font-sohne-regular text-sm"
          aria-label="Back to top"
        >
          <span>Return to top</span>
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
