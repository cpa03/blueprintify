import { motion } from 'framer-motion';
import { STARTER_TEMPLATES } from '@blueprint/shared';
import { useWizardStore } from '../store';

export function TemplateGrid() {
  const loadTemplate = useWizardStore((s) => s.loadTemplate);

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-2">Quick Start Templates</h2>
      <p className="text-dark-400 mb-6">Choose a template to pre-fill your project configuration</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STARTER_TEMPLATES.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => loadTemplate(template)}
            className="glass-card p-5 text-left hover:border-primary-500/50 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{template.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {template.techStack.slice(0, 3).map((tech) => (
                    <span 
                      key={tech.name}
                      className="px-2 py-0.5 text-xs bg-dark-800 rounded text-dark-300"
                    >
                      {tech.name}
                    </span>
                  ))}
                  {template.techStack.length > 3 && (
                    <span className="px-2 py-0.5 text-xs bg-dark-800 rounded text-dark-400">
                      +{template.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
