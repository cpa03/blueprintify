import { motion } from 'framer-motion';
import { TECH_STACK_OPTIONS } from '@blueprint/shared';
import { useWizardStore } from '../../store';
import clsx from 'clsx';

export function StepStack() {
  const techStack = useWizardStore((s) => s.techStack);
  const addTechStack = useWizardStore((s) => s.addTechStack);
  const removeTechStack = useWizardStore((s) => s.removeTechStack);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);

  const categories = Object.entries(TECH_STACK_OPTIONS) as [
    keyof typeof TECH_STACK_OPTIONS,
    typeof TECH_STACK_OPTIONS[keyof typeof TECH_STACK_OPTIONS]
  ][];

  const canProceed = techStack.length >= 1;

  const isSelected = (name: string) => techStack.some((t) => t.name === name);

  const toggleTech = (tech: { name: string; category: string }) => {
    if (isSelected(tech.name)) {
      removeTechStack(tech.name);
    } else {
      addTechStack({ name: tech.name, category: tech.category as 'frontend' | 'backend' | 'database' | 'hosting' | 'ai' | 'testing' | 'styling' | 'other' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose your tech stack</h2>
        <p className="text-dark-400">Select the technologies you plan to use. This helps generate accurate architecture.</p>
      </div>

      <div className="glass-card p-6 space-y-6" role="group" aria-label="Tech Stack Selection">
        {categories.map(([category, options]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2" id={`category-${category}`}>
              <span aria-hidden="true">
                {category === 'frontend' && '🎨'}
                {category === 'backend' && '⚙️'}
                {category === 'database' && '🗄️'}
                {category === 'hosting' && '☁️'}
                {category === 'styling' && '🖌️'}
              </span>
              {category}
            </h3>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`category-${category}`}>
              {options.map((tech) => (
                <button
                  key={tech.name}
                  onClick={() => toggleTech(tech)}
                  aria-pressed={isSelected(tech.name)}
                  className={clsx(
                    'tech-chip',
                    isSelected(tech.name) && 'selected'
                  )}
                >
                  {isSelected(tech.name) && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Selected summary */}
        {techStack.length > 0 && (
          <div className="pt-4 border-t border-dark-700">
            <p className="text-sm text-dark-400 mb-2" id="selected-tech-label">
              Selected ({techStack.length}):
            </p>
            <ul className="flex flex-wrap gap-2" aria-labelledby="selected-tech-label">
              {techStack.map((tech) => (
                <li
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300"
                >
                  {tech.name}
                  <button
                    onClick={() => removeTechStack(tech.name)}
                    className="hover:text-accent-pink transition-colors"
                    aria-label={`Remove ${tech.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={prevStep} className="btn-secondary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="btn-primary flex items-center gap-2"
        >
          Next: Add Features
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
