import { motion } from 'framer-motion';
import { useWizardStore } from '../../store';
import { useBlueprintStream } from '../../hooks/useBlueprintStream';

export function StepReview() {
  const wizard = useWizardStore();
  const prevStep = useWizardStore((s) => s.prevStep);
  const { startGeneration } = useBlueprintStream();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review your project</h2>
        <p className="text-dark-400">Make sure everything looks good before generating your blueprint.</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* Project Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">📝</span>
            Project Information
          </h3>
          <div className="bg-dark-800/50 rounded-xl p-4 space-y-3">
            <div>
              <span className="text-sm text-dark-400">Name:</span>
              <p className="text-white font-medium">{wizard.projectName}</p>
            </div>
            <div>
              <span className="text-sm text-dark-400">Description:</span>
              <p className="text-dark-200">{wizard.description}</p>
            </div>
            {wizard.targetAudience && (
              <div>
                <span className="text-sm text-dark-400">Target Audience:</span>
                <p className="text-dark-200">{wizard.targetAudience}</p>
              </div>
            )}
            {wizard.constraints && (
              <div>
                <span className="text-sm text-dark-400">Constraints:</span>
                <p className="text-dark-200">{wizard.constraints}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center text-accent-cyan">⚙️</span>
            Tech Stack ({wizard.techStack.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {wizard.techStack.map((tech) => (
              <span
                key={tech.name}
                className="px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-200"
              >
                {tech.name}
                <span className="text-dark-500 ml-1.5 text-xs">({tech.category})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        {wizard.features.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center text-accent-emerald">✨</span>
              Features ({wizard.features.length})
            </h3>
            <ul className="space-y-2">
              {wizard.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-dark-200">
                  <svg className="w-4 h-4 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Generation info */}
      <div className="bg-gradient-to-r from-primary-500/10 to-accent-purple/10 border border-primary-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-white">What happens next?</h4>
            <p className="text-sm text-dark-300 mt-1">
              Clicking &quot;Generate Blueprint&quot; will use AI to create a comprehensive <code className="text-primary-300">blueprint.md</code> and <code className="text-primary-300">task.md</code> for your project. This usually takes 30-60 seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={prevStep} className="btn-secondary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={startGeneration}
          className="btn-primary flex items-center gap-2 animate-glow"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Blueprint
        </button>
      </div>
    </motion.div>
  );
}
