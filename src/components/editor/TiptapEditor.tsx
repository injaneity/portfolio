import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useRef, useState } from 'react';
import { FloatingActionBar } from './FloatingActionBar';
import { ArrowUp } from 'lucide-react';

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
        openOnClick: !editable,
        HTMLAttributes: {
          class: 'text-[#F38020] underline hover:text-[#d96d1a] cursor-pointer',
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
        class: 'prose prose-lg max-w-[680px] mx-auto focus:outline-none px-4 pt-[33vh] pb-[60vh] font-sohne-regular min-h-screen',
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
    <div className="w-full min-h-screen bg-white relative">
      {/* Floating action bar - shown on all pages */}
      <FloatingActionBar />

      {/* Editor content - starts in middle with top padding */}
      <EditorContent editor={editor} />

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 flex items-center gap-2 text-[#F38020] hover:text-[#d96d1a] transition-colors duration-300 z-50 font-sohne-regular text-sm"
          aria-label="Back to top"
        >
          <span>Return to top</span>
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
