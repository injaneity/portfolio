import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { InputRule } from '@tiptap/core';
import { ImageWithCaptionComponent } from './ImageWithCaptionComponent';

export const ImageWithCaption = Image.extend({
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

  addInputRules() {
    return [
      new InputRule({
        // Match ![alt](url) followed by space
        find: /!\[([^\]]*)\]\(([^)]+)\)\s$/,
        handler: ({ state, range, match }) => {
          const [, alt, src] = match;
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          if (src) {
            const $start = state.doc.resolve(start);
            const parent = $start.parent;

            // Create image node
            const imageNode = this.type.create({
              src,
              alt: alt || null,
            });

            // Check if paragraph only contains the markdown (ignoring whitespace)
            const textContent = parent.textContent.trim();
            const markdownText = match[0].trim(); // The matched markdown without trailing space

            // If the paragraph only contains this markdown, replace entire paragraph
            if (textContent === markdownText || textContent === markdownText.replace(/\s$/, '')) {
              const parentPos = $start.before();
              tr.replaceWith(parentPos, parentPos + parent.nodeSize, imageNode);
            } else {
              // Multiple things in paragraph, just replace the markdown text
              tr.replaceWith(start, end, imageNode);
            }
          }
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Convert to markdown on Enter when image is selected
      // OR convert markdown to image when Enter pressed on markdown text
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;

        // Case 1: Image node selected - convert to markdown
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

        // Case 2: Cursor in paragraph - check if line has image markdown
        const { $from } = selection;
        const parent = $from.parent;

        if (parent.type.name === 'paragraph') {
          const textContent = parent.textContent;
          const imageMatch = textContent.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

          if (imageMatch) {
            const [, alt, src] = imageMatch;
            const parentPos = $from.before();

            // Create image node
            const imageNode = this.type.create({
              src,
              alt: alt || null,
            });

            // Replace paragraph with image
            const { tr } = editor.state;
            tr.replaceWith(parentPos, parentPos + parent.nodeSize, imageNode);
            editor.view.dispatch(tr);

            return true;
          }
        }

        return false;
      },

      // Allow navigating past images with ArrowDown
      ArrowDown: ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;

        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          const { tr, doc } = state;
          const beforeImagePos = selection.from;
          const afterImagePos = selection.to;

          try {
            // Get the horizontal pixel coordinate from the line before the image
            const coordsBefore = view.coordsAtPos(beforeImagePos > 0 ? beforeImagePos - 1 : 0);
            const xCoord = coordsBefore.left;

            // Find the next paragraph after the image
            const $after = doc.resolve(afterImagePos);
            const nextNode = $after.nodeAfter;

            if (nextNode && nextNode.type.name === 'paragraph' && nextNode.content.size > 0) {
              const paragraphStart = afterImagePos + 1;

              // Get the vertical coordinate of the start of the next paragraph
              const coordsAfter = view.coordsAtPos(paragraphStart);
              const yCoord = coordsAfter.top + 5; // Slightly below the top to ensure we're in the line

              // Find the position at the same horizontal coordinate in the next paragraph
              const targetCoords = view.posAtCoords({ left: xCoord, top: yCoord });

              if (targetCoords) {
                const sel = TextSelection.near(doc.resolve(targetCoords.pos));
                if (sel) {
                  tr.setSelection(sel);
                  editor.view.dispatch(tr);
                  return true;
                }
              }
            }
          } catch (error) {
            console.error('Error in ArrowDown navigation:', error);
          }

          // Fallback to default behavior
          const $after = doc.resolve(afterImagePos);
          const sel = TextSelection.near($after, 1);
          if (sel) {
            tr.setSelection(sel);
            editor.view.dispatch(tr);
            return true;
          }
        }

        return false;
      },

      // Allow navigating past images with ArrowUp
      ArrowUp: ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;

        if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
          const { tr, doc } = state;
          const beforeImagePos = selection.from;
          const afterImagePos = selection.to;

          try {
            // Get the horizontal pixel coordinate from the line after the image
            const coordsAfter = view.coordsAtPos(afterImagePos < doc.content.size ? afterImagePos + 1 : afterImagePos);
            const xCoord = coordsAfter.left;

            // Find the previous paragraph before the image
            const $before = doc.resolve(beforeImagePos);
            const prevNode = $before.nodeBefore;

            if (prevNode && prevNode.type.name === 'paragraph' && prevNode.content.size > 0) {
              const paragraphEnd = beforeImagePos - 1;

              // Get the vertical coordinate of the end of the previous paragraph
              const coordsBefore = view.coordsAtPos(paragraphEnd);
              const yCoord = coordsBefore.bottom - 5; // Slightly above the bottom to ensure we're in the last line

              // Find the position at the same horizontal coordinate in the previous paragraph
              const targetCoords = view.posAtCoords({ left: xCoord, top: yCoord });

              if (targetCoords) {
                const sel = TextSelection.near(doc.resolve(targetCoords.pos));
                if (sel) {
                  tr.setSelection(sel);
                  editor.view.dispatch(tr);
                  return true;
                }
              }
            }
          } catch (error) {
            console.error('Error in ArrowUp navigation:', error);
          }

          // Fallback to default behavior
          const $before = doc.resolve(beforeImagePos);
          const sel = TextSelection.near($before, -1);
          if (sel) {
            tr.setSelection(sel);
            editor.view.dispatch(tr);
            return true;
          }
        }

        return false;
      },
    };
  },
});
