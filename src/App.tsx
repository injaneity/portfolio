import { Routes, Route } from 'react-router-dom'
import { UnifiedMarkdownEditor } from './components/UnifiedMarkdownEditor'

import defaultMarkdown from './default.md?raw'
import projectsMarkdown from './projects.md?raw'
import experienceMarkdown from './experience.md?raw'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full flex justify-center">
        <Routes>
          <Route path="/" element={<UnifiedMarkdownEditor key="default" initialContent={defaultMarkdown} />} />
          <Route path="/projects" element={<UnifiedMarkdownEditor key="projects" initialContent={projectsMarkdown} />} />
          <Route path="/experience" element={<UnifiedMarkdownEditor key="experience" initialContent={experienceMarkdown} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
