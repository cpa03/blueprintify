import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "../../store";
import { FormEvent, useEffect, useRef } from "react";
import { FORM_LIMITS, ANIMATION } from "../../config/constants";
import { useAutoSaveToast } from "../../hooks/useAutoSaveToast";

export function StepInfo() {
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const projectName = useWizardStore((s) => s.projectName);
  const description = useWizardStore((s) => s.description);
  const targetAudience = useWizardStore((s) => s.targetAudience);
  const constraints = useWizardStore((s) => s.constraints);
  const setProjectName = useWizardStore((s) => s.setProjectName);
  const setDescription = useWizardStore((s) => s.setDescription);
  const setTargetAudience = useWizardStore((s) => s.setTargetAudience);
  const setConstraints = useWizardStore((s) => s.setConstraints);
  const nextStep = useWizardStore((s) => s.nextStep);

  useAutoSaveToast(
    [projectName, description, targetAudience, constraints],
    "Project info saved",
    2000,
  );

  const canProceed =
    projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN &&
    description.length >= FORM_LIMITS.DESCRIPTION.MIN;
  const isDescriptionInvalid =
    description.length > 0 && description.length < FORM_LIMITS.DESCRIPTION.MIN;

  const getFormProgress = () => {
    const requiredFields = [
      projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN,
      description.length >= FORM_LIMITS.DESCRIPTION.MIN,
    ];
    const optionalFields = [targetAudience.length > 0, constraints.length > 0];

    const completedRequired = requiredFields.filter(Boolean).length;
    const completedOptional = optionalFields.filter(Boolean).length;
    const totalFields = requiredFields.length + completedOptional;
    const completedFields = completedRequired + completedOptional;

    return {
      completed: completedFields,
      total: totalFields,
      percentage: (completedFields / totalFields) * 100,
    };
  };

  const formProgress = getFormProgress();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      nextStep();
    }
  };

  useEffect(() => {
    projectNameInputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            Tell us about your project
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-emerald"
                initial={{ width: 0 }}
                animate={{ width: `${formProgress.percentage}%` }}
                transition={{ duration: ANIMATION.NORMAL, ease: "easeOut" }}
              />
            </div>
            <span className="text-dark-400 tabular-nums">
              {formProgress.completed}/{formProgress.total}
            </span>
          </div>
        </div>
        <p className="text-dark-400">
          We&apos;ll use this information to generate a tailored architecture
          blueprint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {/* Project Name */}
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="projectName"
              className="label flex items-center gap-2"
            >
              Project Name{" "}
              <span className="text-accent-pink" aria-hidden="true">
                *
              </span>
              <AnimatePresence>
                {projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-emerald/20 text-accent-emerald"
                    aria-label="Project name is valid"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </label>
            <span
              className={`text-xs tabular-nums transition-colors duration-200 ${
                projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN
                  ? "text-accent-emerald"
                  : projectName.length >
                      FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD
                    ? "text-accent-pink"
                    : "text-dark-500"
              }`}
            >
              {projectName.length}/{FORM_LIMITS.PROJECT_NAME.MAX}
            </span>
          </div>
          <div className="relative">
            <input
              ref={projectNameInputRef}
              id="projectName"
              name="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-project"
              className={`input-field transition-colors duration-200 ${
                projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN
                  ? "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20"
                  : projectName.length >= FORM_LIMITS.PROJECT_NAME.MAX
                    ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20"
                    : projectName.length >
                        FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD
                      ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20"
                      : ""
              }`}
              maxLength={FORM_LIMITS.PROJECT_NAME.MAX}
              required
              aria-required="true"
              aria-describedby={
                projectName.length >
                  FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
                projectName.length < FORM_LIMITS.PROJECT_NAME.MAX
                  ? "projectName-warning"
                  : undefined
              }
            />
            <AnimatePresence>
              {projectName.length >= FORM_LIMITS.PROJECT_NAME.MIN && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {projectName.length > FORM_LIMITS.PROJECT_NAME.WARNING_THRESHOLD &&
            projectName.length < FORM_LIMITS.PROJECT_NAME.MAX && (
              <p
                id="projectName-warning"
                role="status"
                className="text-xs text-accent-pink mt-1"
              >
                Approaching character limit
              </p>
            )}
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="description"
              className="label flex items-center gap-2"
            >
              Project Description{" "}
              <span className="text-accent-pink" aria-hidden="true">
                *
              </span>
              <AnimatePresence>
                {description.length >= FORM_LIMITS.DESCRIPTION.MIN && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-emerald/20 text-accent-emerald"
                    aria-label="Description is valid"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </label>
            <span
              className={`text-xs tabular-nums transition-colors duration-200 ${
                description.length >= FORM_LIMITS.DESCRIPTION.MIN
                  ? "text-accent-emerald"
                  : description.length > 0
                    ? "text-yellow-500"
                    : "text-dark-500"
              }`}
            >
              {description.length}/{FORM_LIMITS.DESCRIPTION.MAX}
            </span>
          </div>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does, its main purpose, and key functionality..."
              className={`textarea-field h-32 transition-colors duration-200 ${
                description.length >= FORM_LIMITS.DESCRIPTION.MIN
                  ? "border-accent-emerald/50 focus:border-accent-emerald focus:ring-accent-emerald/20 pr-12"
                  : isDescriptionInvalid
                    ? "border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20"
                    : description.length > 0
                      ? "border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500/20"
                      : ""
              }`}
              maxLength={FORM_LIMITS.DESCRIPTION.MAX}
              required
              aria-required="true"
              aria-invalid={isDescriptionInvalid}
              aria-describedby={
                isDescriptionInvalid
                  ? "description-error"
                  : description.length > 0 &&
                      description.length < FORM_LIMITS.DESCRIPTION.MIN
                    ? "description-hint"
                    : undefined
              }
            />
            <AnimatePresence>
              {description.length >= FORM_LIMITS.DESCRIPTION.MIN && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute right-3 top-3 pointer-events-none"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isDescriptionInvalid &&
            description.length > 0 &&
            description.length < FORM_LIMITS.DESCRIPTION.MIN && (
              <p id="description-hint" className="text-xs text-yellow-500 mt-1">
                {FORM_LIMITS.DESCRIPTION.MIN - description.length} more
                characters needed
              </p>
            )}
          {isDescriptionInvalid && (
            <p
              id="description-error"
              role="alert"
              className="text-xs text-accent-pink mt-1"
            >
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
            Constraints or Requirements{" "}
            <span className="text-dark-500">(optional)</span>
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
