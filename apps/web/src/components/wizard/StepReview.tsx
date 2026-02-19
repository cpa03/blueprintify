import { motion } from "framer-motion";
import { memo } from "react";
import { useWizardStore } from "../../store";
import { useBlueprintStream } from "../../hooks/useBlueprintStream";
import { GENERATION_ESTIMATES } from "../../config/constants";
import { pageTransition } from "../../utils/motion";

export const StepReview = memo(function StepReview(): JSX.Element {
  // Use specific selectors to avoid re-rendering on unrelated state changes
  const projectName = useWizardStore((s) => s.projectName);
  const description = useWizardStore((s) => s.description);
  const targetAudience = useWizardStore((s) => s.targetAudience);
  const constraints = useWizardStore((s) => s.constraints);
  const techStack = useWizardStore((s) => s.techStack);
  const features = useWizardStore((s) => s.features);
  const setStep = useWizardStore((s) => s.setStep);
  const { startGeneration, isGenerating, progress } = useBlueprintStream();

  return (
    <motion.div {...pageTransition} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Review your project
        </h2>
        <p className="text-dark-400">
          Make sure everything looks good before generating your blueprint.
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* Project Info */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
                📝
              </span>
              Project Information
            </h3>
            <button
              onClick={() => setStep("info")}
              className="btn-ghost btn-sm flex items-center gap-1 text-primary-400 hover:text-primary-300"
              title="Edit project information"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-4 space-y-3">
            <div>
              <span className="text-sm text-dark-400">Name:</span>
              <p className="text-white font-medium">{projectName}</p>
            </div>
            <div>
              <span className="text-sm text-dark-400">Description:</span>
              <p className="text-dark-200">{description}</p>
            </div>
            {targetAudience && (
              <div>
                <span className="text-sm text-dark-400">Target Audience:</span>
                <p className="text-dark-200">{targetAudience}</p>
              </div>
            )}
            {constraints && (
              <div>
                <span className="text-sm text-dark-400">Constraints:</span>
                <p className="text-dark-200">{constraints}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                ⚙️
              </span>
              Tech Stack ({techStack.length})
            </h3>
            <button
              onClick={() => setStep("stack")}
              className="btn-ghost btn-sm flex items-center gap-1 text-accent-cyan hover:text-accent-cyan/80"
              title="Edit tech stack"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech.name}
                className="px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-200"
              >
                {tech.name}
                <span className="text-dark-500 ml-1.5 text-xs">
                  ({tech.category})
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center text-accent-emerald">
                  ✨
                </span>
                Features ({features.length})
              </h3>
              <button
                onClick={() => setStep("features")}
                className="btn-ghost btn-sm flex items-center gap-1 text-accent-emerald hover:text-accent-emerald/80"
                title="Edit features"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-dark-200"
                >
                  <svg
                    className="w-4 h-4 text-accent-emerald"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
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
            <svg
              className="w-5 h-5 text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-white">What happens next?</h4>
            <p className="text-sm text-dark-300 mt-1">
              Clicking &quot;Generate Blueprint&quot; will use AI to create a
              comprehensive{" "}
              <code className="text-primary-300">blueprint.md</code> and{" "}
              <code className="text-primary-300">task.md</code> for your
              project. This usually takes{" "}
              {GENERATION_ESTIMATES.TYPICAL_DURATION_SECONDS} seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep("features")}
          className="btn-secondary"
          disabled={isGenerating}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={startGeneration}
            disabled={isGenerating || !projectName || !description}
            className="btn-primary flex items-center gap-2 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Blueprint
              </>
            )}
          </button>
          {isGenerating && progress && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-primary-400 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
              {progress}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
