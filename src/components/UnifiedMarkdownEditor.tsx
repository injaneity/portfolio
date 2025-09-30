import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Typography } from './ui/typography';
import defaultMarkdownContent from '../default.md?raw';

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

// Split markdown into sections (separated by double newlines)
function parseMarkdownSections(markdown: string): string[] {
  return markdown.split('\n\n');
}

// Render a single section
function renderSection(section: string): React.ReactNode {
  const lines = section.split('\n');
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      return <div key={index} className="h-6" />; // Empty line spacing
    }

    // Determine the type and render accordingly
    if (trimmedLine.startsWith('# ')) {
      return (
        <Typography key={index} variant="title" className="mb-2">
          {parseInlineMarkdown(trimmedLine.slice(2))}
        </Typography>
      );
    } else if (trimmedLine.startsWith('## ')) {
      return (
        <Typography key={index} variant="h2" className="mb-4">
          {parseInlineMarkdown(trimmedLine.slice(3))}
        </Typography>
      );
    } else if (trimmedLine.startsWith('### ')) {
      return (
        <Typography key={index} variant="h3" className="mb-3">
          {parseInlineMarkdown(trimmedLine.slice(4))}
        </Typography>
      );
    } else {
      return (
        <Typography key={index} variant="body" className="mb-3">
          {parseInlineMarkdown(trimmedLine)}
        </Typography>
      );
    }
  });
}

interface EditableSectionProps {
  section: string;
  sectionIndex: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onUpdate: (index: number, content: string) => void;
  onDelete: (index: number) => void;
  onStopEditing: () => void;
}

function EditableSection({ section, sectionIndex, isEditing, onEdit, onUpdate, onDelete, onStopEditing }: EditableSectionProps) {
  const [value, setValue] = useState(section);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(section);
  }, [section]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Position cursor at end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
      
      // Auto-resize on mount
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 100) + 'px';
    }
  }, [isEditing]);

  // Auto-resize when value changes
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 100) + 'px';
    }
  }, [value, isEditing]);

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
    handleSaveOrDelete(value);
  };

  if (isEditing) {
    return (
      <div className="mb-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full bg-transparent border-none outline-none resize-none text-[20px] leading-relaxed font-['Source_Serif_Pro',Georgia,Cambria,'Times_New_Roman',Times,serif] p-0 m-0"
          style={{ 
            minHeight: '100px',
            height: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            boxShadow: 'none',
            overflow: 'hidden'
          }}
          placeholder="Type your content here..."
        />
      </div>
    );
  }

  return (
    <div 
      className="cursor-pointer hover:bg-muted/10 rounded-md p-2 -m-2 transition-colors"
      onClick={() => onEdit(sectionIndex)}
      title="Click to edit this section"
    >
      {renderSection(section)}
    </div>
  );
}

export function UnifiedMarkdownEditor() {
  const [markdown, setMarkdown] = useState(defaultMarkdownContent);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  const sections = parseMarkdownSections(markdown);

  const updateSection = (index: number, content: string) => {
    const newSections = [...sections];
    newSections[index] = content;
    setMarkdown(newSections.join('\n\n'));
  };

  const deleteSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setMarkdown(newSections.join('\n\n'));
    setEditingSectionIndex(null);
  };

  return (
    <div className="w-full max-w-2xl lg:max-w-3xl px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Document Content */}
      <div className="space-y-0">
        {sections.map((section, index) => (
          <EditableSection
            key={index}
            section={section}
            sectionIndex={index}
            isEditing={editingSectionIndex === index}
            onEdit={setEditingSectionIndex}
            onUpdate={updateSection}
            onDelete={deleteSection}
            onStopEditing={() => setEditingSectionIndex(null)}
          />
        ))}
      </div>
    </div>
  );
}
