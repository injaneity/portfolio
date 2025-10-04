import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Typography } from './ui/typography';
import { getTypographyClass } from './ui/typography-variants';

// Parse inline markdown (bold, italic)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const current = text.replace(/^#+\s*/, ''); // Remove heading markers
  let key = 0;

  if (!current.trim()) return [current];

  // Split on markdown patterns
  const tokens = current.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  
  return tokens.map((token) => {
    if (token.match(/^\*\*[^*]+\*\*$/)) {
      return <strong key={key++}>{token.slice(2, -2)}</strong>;
    } else if (token.match(/^\*[^*]+\*$/)) {
      return <em key={key++}>{token.slice(1, -1)}</em>;  
    } else {
      return token || null;
    }
  }).filter(Boolean);
}

// Split markdown into sections (each line is its own section)
function parseMarkdownSections(markdown: string): string[] {
  // Normalize line endings by removing \r characters
  const normalized = markdown.replace(/\r/g, '');
  return normalized.split('\n').filter(line => line.trim() !== '');
}

// Render a single section (now each section is a single line)
function renderSection(section: string): React.ReactNode {
  const trimmedLine = section.trim();
  
  if (!trimmedLine) {
    return null;
  }

  // Determine the type and render accordingly
  if (trimmedLine.startsWith('# ')) {
    return (
      <Typography variant="title">
        {parseInlineMarkdown(trimmedLine.slice(2))}
      </Typography>
    );
  } else if (trimmedLine.startsWith('## ')) {
    return (
      <Typography variant="h2">
        {parseInlineMarkdown(trimmedLine.slice(3))}
      </Typography>
    );
  } else if (trimmedLine.startsWith('### ')) {
    return (
      <Typography variant="h3">
        {parseInlineMarkdown(trimmedLine.slice(4))}
      </Typography>
    );
  } else if (trimmedLine.startsWith('> ')) {
    return (
      <Typography variant="caption">
        {parseInlineMarkdown(trimmedLine.slice(2))}
      </Typography>
    );
  } else {
    return (
      <Typography variant="body">
        {parseInlineMarkdown(trimmedLine)}
      </Typography>
    );
  }
}

interface EditableSectionProps {
  section: string;
  sectionIndex: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onUpdate: (index: number, content: string) => void;
  onDelete: (index: number) => void;
  onCreateNewSection: (index: number, content: string) => void;
  onStopEditing: () => void;
}

function EditableSection({ section, sectionIndex, isEditing, onEdit, onUpdate, onDelete, onCreateNewSection, onStopEditing }: EditableSectionProps) {
  const [value, setValue] = useState(section);
  const [initialHeight, setInitialHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    setValue(section);
  }, [section]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Position cursor at end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      
      // Set height to match the initial rendered height exactly
      const textarea = textareaRef.current;
      if (initialHeight !== null) {
        // Force a reflow and use the exact measured height
        textarea.style.height = 'auto';
        textarea.style.height = initialHeight + 'px';
        textarea.style.maxHeight = initialHeight + 'px';
        textarea.style.minHeight = initialHeight + 'px';
      } else {
        // Fallback to auto-resize
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 100) + 'px';
      }
    }
  }, [isEditing, initialHeight]);

  // Auto-resize when value changes, but maintain exact height from initial render
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      
      // If we have an initial height, maintain it exactly to prevent jumping
      if (initialHeight !== null) {
        textarea.style.height = initialHeight + 'px';
        textarea.style.maxHeight = initialHeight + 'px';
        textarea.style.minHeight = initialHeight + 'px';
      } else {
        // Only auto-resize if we don't have an initial height measurement
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = Math.max(scrollHeight, 100) + 'px';
      }
    }
  }, [value, isEditing, initialHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setValue(section); // Reset to original
      onStopEditing();
    }
    
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSaveOrDelete(value);
    }

    // Handle Enter key to create new section
    if (e.key === 'Enter' && !e.metaKey && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);
      
      // Update current section with text before cursor
      const currentContent = textBeforeCursor.trim();
      if (currentContent) {
        onUpdate(sectionIndex, currentContent);
      } else {
        // If current section is empty, delete it
        onDelete(sectionIndex);
      }
      
      // Create new section with remaining text or empty body text
      const newContent = textAfterCursor.trim() || '';
      onCreateNewSection(sectionIndex, newContent);
      return;
    }

    // Handle backspace/delete on empty content
    if ((e.key === 'Backspace' || e.key === 'Delete') && value.trim() === '') {
      e.preventDefault();
      onDelete(sectionIndex);
      onStopEditing();
    }
  };

  const handleSaveOrDelete = (content: string) => {
    if (content.trim() === '') {
      onDelete(sectionIndex);
    } else {
      onUpdate(sectionIndex, content);
    }
    onStopEditing();
  };

  const handleBlur = () => {
    // Only save on blur if we're not clicking on another section
    if (!isMouseDownRef.current) {
      setTimeout(() => {
        handleSaveOrDelete(value);
      }, 0);
    }
    isMouseDownRef.current = false;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    // Capture the current height of the rendered section before editing
    if (sectionRef.current) {
      const height = sectionRef.current.offsetHeight;
      setInitialHeight(height);
    }
    onEdit(sectionIndex);
  };

  if (isEditing) {
    const typographyClass = getTypographyClass(value);
    
    // Set appropriate minimum height based on content type
    const getMinHeight = (typographyClass: string) => {
      switch (typographyClass) {
        case 'typography-caption':
          return '35px'; // Smaller min height for captions
        case 'typography-body':
          return '60px'; // Medium height for body text
        case 'typography-h3':
          return '70px'; // Slightly larger for h3
        case 'typography-h2':
          return '80px'; // Larger for h2
        case 'typography-title':
          return '100px'; // Largest for title
        default:
          return '60px';
      }
    };

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full bg-transparent border-none outline-none resize-none hover:bg-muted/10 rounded-md transition-colors ${typographyClass}`}
        style={{ 
          minHeight: getMinHeight(typographyClass),
          height: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          boxShadow: 'none',
          overflow: 'hidden'
        }}
        placeholder="Type your content here..."
      />
    );
  }

  return (
    <div 
      ref={sectionRef}
      className="cursor-pointer hover:bg-muted/10 rounded-md transition-colors"
      onMouseDown={() => {
        isMouseDownRef.current = true;
      }}
      onClick={handleEditClick}
      title="Click to edit this section"
    >
      {renderSection(section)}
    </div>
  );
}

export function UnifiedMarkdownEditor({ initialContent = '' }: { initialContent?: string }) {
  const [markdown, setMarkdown] = useState(initialContent);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  useEffect(() => {
    setMarkdown(initialContent);
    setEditingSectionIndex(null); // Reset editing state when content changes
  }, [initialContent]);

  const sections = parseMarkdownSections(markdown);

  const updateSection = (index: number, content: string) => {
    const newSections = [...sections];
    newSections[index] = content;
    setMarkdown(newSections.join('\n'));
  };

  const deleteSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setMarkdown(newSections.join('\n'));
    setEditingSectionIndex(null);
  };

  const createNewSection = (afterIndex: number, content: string) => {
    const newSections = [...sections];
    newSections.splice(afterIndex + 1, 0, content);
    setMarkdown(newSections.join('\n'));
    // Set editing to the new section immediately
    setTimeout(() => {
      setEditingSectionIndex(afterIndex + 1);
    }, 0);
  };

  return (
    <div className="w-full max-w-2xl lg:max-w-3xl px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Document Content */}
      <div className="space-y-0">
        {sections.map((section, index) => (
          <EditableSection
            key={`${index}-${section.slice(0, 20)}`}
            section={section}
            sectionIndex={index}
            isEditing={editingSectionIndex === index}
            onEdit={setEditingSectionIndex}
            onUpdate={updateSection}
            onDelete={deleteSection}
            onCreateNewSection={createNewSection}
            onStopEditing={() => setEditingSectionIndex(null)}
          />
        ))}
      </div>
    </div>
  );
}
