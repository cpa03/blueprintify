import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { TemplateGrid } from './components/TemplateGrid';
import { StepIndicator } from './components/StepIndicator';
import { Wizard } from './components/Wizard';
import { useWizardStore, useEditorStore } from './store';

// Lazy load Editor to reduce initial bundle size
const Editor = lazy(() => import('./components/Editor').then(module => ({ default: module.Editor })));

function App() {
  const [showEditor, setShowEditor] = useState(true);
  const currentStep = useWizardStore((s) => s.currentStep);
  const hasContent = useEditorStore((s) => s.blueprintContent.length > 0 || s.tasksContent.length > 0);

  // Show templates only on first step with no content
  const showTemplates = currentStep === 'info' && !hasContent;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Hero section (only on first view) */}
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                From <span className="text-gradient">Idea</span> to <span className="text-gradient">Blueprint</span> in Seconds
              </h1>
              <p className="text-lg text-dark-400 max-w-2xl mx-auto">
                Generate production-ready architectural documentation for your projects. 
                Powered by AI, designed for autonomous development.
              </p>
            </motion.div>
          )}

          {/* Templates */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <TemplateGrid />
                <div className="text-center text-dark-500 my-8">
                  — or start from scratch —
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Split Pane Layout */}
          <div className="flex gap-6 min-h-[600px]">
            {/* Wizard Panel */}
            <motion.div
              layout
              className={`glass-card overflow-hidden transition-all duration-300 ${
                showEditor ? 'w-1/2' : 'w-full'
              }`}
            >
              <Wizard />
            </motion.div>

            {/* Editor Panel */}
            <AnimatePresence>
              {showEditor && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-1/2 glass-card overflow-hidden relative"
                >
                  {/* Toggle button */}
                  <button
                    onClick={() => setShowEditor(false)}
                    className="absolute top-4 right-4 z-10 btn-ghost"
                    title="Hide editor"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <Suspense fallback={
                    <div className="h-full flex items-center justify-center text-dark-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        <span>Loading Editor...</span>
                      </div>
                    </div>
                  }>
                    <Editor />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Show editor button when hidden */}
          {!showEditor && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowEditor(true)}
              className="fixed bottom-6 right-6 btn-primary shadow-2xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Show Editor
            </motion.button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-dark-500">
          <p>Built with ⚡ Cloudflare Workers + React</p>
          <p>© 2024 Blueprint Generator</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
