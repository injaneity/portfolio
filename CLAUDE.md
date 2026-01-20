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

- **Static Routes**: Direct markdown imports for main pages
  - `/` → `src/default.md`
  - `/projects` → `src/projects.md`
  - `/experience` → `src/experience.md`

- **Dynamic Routes**: Parameter-based markdown loading (see `DynamicMarkdownPage.tsx`)
  - `/projects/:id` → dynamically loads `src/projects-{id}.md`
  - `/experience/:id` → dynamically loads `src/experience-{id}.md`
  - Multiple params are joined with dashes: `/projects/web/1` → `projects-web-1.md`

### Component Architecture

**UnifiedMarkdownEditor**: The core content component that:
- Parses markdown into individual line sections
- Renders each section with appropriate Typography variants
- Makes every section click-to-edit with inline textarea editing
- Supports heading levels (#, ##, ###), blockquotes (>), and inline formatting (*italic*, **bold**)
- Auto-resizes textareas to match content
- Keyboard shortcuts: Enter creates new section, Cmd+Enter saves, Escape cancels, Backspace/Delete on empty removes section

**DynamicMarkdownPage**: Handles dynamic route-to-markdown mapping
- Constructs filename from URL params
- Imports markdown dynamically using Vite's `?raw` import
- Falls back to error message if file not found

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
1. Create a markdown file in `src/` (e.g., `about.md` or `projects-3.md`)
2. Add route in `App.tsx`:
   - Static: `<Route path="/about" element={<UnifiedMarkdownEditor initialContent={aboutMarkdown} />} />`
   - Dynamic: Already covered by existing wildcard routes

Markdown files are imported as raw strings using Vite's `?raw` suffix.
