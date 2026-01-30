import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import { ImageWithCaptionComponent } from './ImageWithCaptionComponent';

export const ImageWithCaption = Node.create({
  name: 'image',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
          };
        },
      },
      {
        tag: 'figure',
        getAttrs: (element) => {
          const img = element.querySelector('img');
          if (!img) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { alt, src, title } = HTMLAttributes;
    // Minimal fallback - just img tag for serialization/copy-paste
    // ReactNodeViewRenderer handles the actual interactive rendering
    return ['img', { src, alt: alt || '', title }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageWithCaptionComponent);
  },

  addKeyboardShortcuts() {
    return {
      // Convert to markdown on Enter when image is selected
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;

        // For atomic nodes, check if the selection is a NodeSelection
        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          const node = selection.node;
          const { src, alt, title } = node.attrs;
          const altText = alt || '';
          const titleText = title ? ` "${title}"` : '';
          const markdown = `![${altText}](${src}${titleText})`;

          // Replace image with markdown text in a paragraph
          const pos = selection.from;
          editor.commands.deleteRange({ from: pos, to: selection.to });
          editor.commands.insertContentAt(pos, {
            type: 'paragraph',
            content: [{ type: 'text', text: markdown }],
          });

          // Position cursor after the markdown text
          setTimeout(() => {
            editor.commands.setTextSelection(pos + markdown.length + 1);
            editor.commands.focus();
          }, 10);
          return true;
        }

        return false;
      },

      // Allow navigating past images with ArrowDown
      ArrowDown: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;

        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          // Move cursor to after the image
          const pos = selection.to;
          editor.commands.setTextSelection(pos);
          return true;
        }

        return false;
      },

      // Allow navigating past images with ArrowUp
      ArrowUp: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;

        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          // Move cursor to before the image
          const pos = selection.from;
          editor.commands.setTextSelection(Math.max(0, pos - 1));
          return true;
        }

        return false;
      },
    };
  },
});
