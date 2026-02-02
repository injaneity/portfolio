# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website built with React, TypeScript, Vite, and Tailwind CSS v4. The site features an editable markdown-based content system where each section can be clicked to edit inline.

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint the codebase
npm run lint

# Preview production build
npm preview
```

## Key Architecture Patterns

### Routing and Content System

The application uses a path-based routing system that maps routes to markdown files:

- **Landing Page**: `/` → loads `src/content/landing.md`
- **Dynamic Routes**: All other routes use slug-based loading via `EditorPage`
  - `/projects` → loads `src/content/projects.md`
  - `/experience` → loads `src/content/experience.md`
  - `/:slug` → loads `src/content/{slug}.md`

All markdown files are stored in the `src/content/` directory and loaded dynamically using Vite's `?raw` import.

### Component Architecture

**TiptapEditor**: The core rich text editor component that provides:
- Full markdown support with WYSIWYG editing via TipTap
- Syntax highlighting for code blocks using Lowlight
- Image support with captions and click-to-edit functionality
- Link rendering with internal/external link detection and navigation
- Inline formatting (bold, italic, headings, blockquotes, lists, etc.)
- Custom extensions:
  - `CodeBlockWithUI`: Code blocks with language selection and copy functionality
  - `ImageWithCaption`: Images with optional captions and markdown conversion
  - `LinkIconExtension`: Visual indicators for links with click-to-select
- Keyboard shortcuts for link/image conversion to markdown for editing
- Auto-save functionality with debouncing
- Download page as markdown feature
- Search bar integration

**EditorPage**: Handles dynamic route-to-markdown mapping
- Extracts slug from URL params
- Loads markdown from `src/content/{slug}.md`
- Falls back to default content if file not found
- Manages loading and error states

**LandingPage**: Dedicated component for the home page
- Always loads `src/content/landing.md`
- Uses same TiptapEditor for consistent editing experience

### Styling System

Uses Tailwind CSS v4 with a custom typography system:
- `typography.tsx` and `typography-variants.ts` define consistent text styles
- Typography variants: title, h2, h3, body, caption
- Path alias `@/` maps to `src/` directory

### Build Configuration

- Uses `rolldown-vite` (performance-optimized Vite fork)
- React SWC plugin for fast refresh
- Tailwind CSS Vite plugin for v4 support
- Path aliases configured in both `vite.config.ts` and `tsconfig.json`

## Content Management

To add new pages:
1. Create a markdown file in `src/content/` directory (e.g., `src/content/about.md`)
2. The route is automatically handled by existing wildcard routes in `App.tsx`
   - `/about` will automatically load `src/content/about.md`
   - No code changes needed unless you want a custom page component

Markdown files are imported as raw strings using Vite's `?raw` suffix and edited in-browser using the TiptapEditor.

### TipTap Dependencies

The project uses TipTap v3.18 for rich text editing:
- Core packages: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/core`
- Extensions: `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `@tiptap/extension-typography`, `@tiptap/extension-code-block-lowlight`
- Markdown support: `@tiptap/markdown` (official package with GitHub Flavored Markdown support)
- Syntax highlighting: `lowlight` with common language support

**Note**: The project uses the official `@tiptap/markdown` extension which provides:
- Bidirectional markdown conversion (editor.getMarkdown() to serialize)
- GitHub Flavored Markdown (GFM) support
- Integration with the marked library
- More reliable and actively maintained than the legacy tiptap-markdown package
