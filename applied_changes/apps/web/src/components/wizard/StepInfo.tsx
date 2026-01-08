import { motion } from 'framer-motion';
import { useWizardStore } from '../../store';
import { FormEvent } from 'react';

export function StepInfo() {
  const projectName = useWizardStore((s) => s.projectName);
  const description = useWizardStore((s) => s.description);
  const targetAudience = useWizardStore((s) => s.targetAudience);
  const constraints = useWizardStore((s) => s.constraints);
  const setProjectName = useWizardStore((s) => s.setProjectName);
  const setDescription = useWizardStore((s) => s.setDescription);
  const setTargetAudience = useWizardStore((s) => s.setTargetAudience);
  const setConstraints = useWizardStore((s) => s.setConstraints);
  const nextStep = useWizardStore((s) => s.nextStep);

  const canProceed = projectName.length >= 1 && description.length >= 10;
  const isDescriptionInvalid = description.length > 0 && description.length < 10;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      nextStep();
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
        <h2 className="text-2xl font-bold text-white mb-2">Tell us about your project</h2>
        <p className="text-dark-400">We'll use this information to generate a tailored architecture blueprint.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Project Name */}
        <div>
          <label htmlFor="projectName" className="label">
            Project Name <span className="text-accent-pink" aria-hidden="true">*</span>
          </label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-awesome-project"
            className="input-field"
            maxLength={100}
            required
            aria-required="true"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">
            Project Description <span className="text-accent-pink" aria-hidden="true">*</span>
            <span className="text-dark-500 ml-2">({description.length}/2000)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your project does, its main purpose, and key functionality..."
            className={`textarea-field h-32 ${isDescriptionInvalid ? 'border-accent-pink' : ''}`}
            maxLength={2000}
            required
            aria-required="true"
            aria-invalid={isDescriptionInvalid}
            aria-describedby={isDescriptionInvalid ? "description-error" : undefined}
          />
          {isDescriptionInvalid && (
            <p id="description-error" role="alert" className="text-xs text-accent-pink mt-1">
              Description must be at least 10 characters
            </p>
          )}
        </div>

        {/* Target Audience (Optional) */}
        <div>
          <label htmlFor="targetAudience" className="label">
            Target Audience <span className="text-dark-500">(optional)</span>
          </label>
          <input
            id="targetAudience"
            name="targetAudience"
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Developers, Small businesses, Enterprise teams"
            className="input-field"
          />
        </div>

        {/* Constraints (Optional) */}
        <div>
          <label htmlFor="constraints" className="label">
            Constraints or Requirements <span className="text-dark-500">(optional)</span>
          </label>
          <textarea
            id="constraints"
            name="constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g., Must be serverless, needs to support 10k concurrent users, budget limitations..."
            className="textarea-field h-24"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!canProceed}
            className="btn-primary flex items-center gap-2"
          >
            Next: Choose Tech Stack
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
