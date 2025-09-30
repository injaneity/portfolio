import { UnifiedMarkdownEditor } from './components/UnifiedMarkdownEditor'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-full flex justify-center">
        <UnifiedMarkdownEditor />
      </div>
    </div>
  )
}

export default App
