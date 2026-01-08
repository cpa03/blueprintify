import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWizardStore } from '../../store';

const SUGGESTED_FEATURES = [
  'User authentication',
  'Admin dashboard',
  'API documentation',
  'Unit tests',
  'CI/CD pipeline',
  'Docker support',
  'Rate limiting',
  'Logging & monitoring',
  'Email notifications',
  'File uploads',
  'Search functionality',
  'Dark mode'
];

export function StepFeatures() {
  const [newFeature, setNewFeature] = useState('');
  const features = useWizardStore((s) => s.features);
  const addFeature = useWizardStore((s) => s.addFeature);
  const removeFeature = useWizardStore((s) => s.removeFeature);
  const nextStep = useWizardStore((s) => s.nextStep);
  const prevStep = useWizardStore((s) => s.prevStep);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      addFeature(newFeature.trim());
      setNewFeature('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const isInFeatures = (feature: string) => 
    features.some((f) => f.toLowerCase() === feature.toLowerCase());

  const suggestedNotAdded = SUGGESTED_FEATURES.filter((f) => !isInFeatures(f));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Add key features</h2>
        <p className="text-dark-400">List the main features your project should have. This helps prioritize tasks.</p>
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Add custom feature */}
        <div>
          <label htmlFor="feature-input" className="label">Add a feature</label>
          <div className="flex gap-2">
            <input
              id="feature-input"
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Real-time notifications"
              className="input-field flex-1"
              aria-label="New feature name"
            />
            <button
              onClick={handleAddFeature}
              disabled={!newFeature.trim()}
              className="btn-primary px-4"
              aria-label="Add feature"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Added features */}
        {features.length > 0 && (
          <div>
            <label className="label" id="added-features-label">Your features ({features.length})</label>
            <div className="flex flex-wrap gap-2" role="list" aria-labelledby="added-features-label">
              {features.map((feature, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-lg text-sm text-primary-300"
                  role="listitem"
                >
                  <span className="text-accent-emerald" aria-hidden="true">✓</span>
                  {feature}
                  <button
                    onClick={() => removeFeature(index)}
                    className="hover:text-accent-pink transition-colors"
                    aria-label={`Remove ${feature}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestedNotAdded.length > 0 && (
          <div>
            <label className="label" id="suggestions-label">Quick add suggestions</label>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="suggestions-label">
              {suggestedNotAdded.map((feature) => (
                <button
                  key={feature}
                  onClick={() => addFeature(feature)}
                  className="tech-chip hover:border-accent-emerald/50"
                  aria-label={`Add suggestion: ${feature}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {feature}
                </button>
              ))}
            </div>
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
          className="btn-primary flex items-center gap-2"
        >
          Next: Review
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
