/**
 * Template Grid Component
 *
 * Displays a grid of starter templates that users can select
 * to pre-populate the wizard with predefined project configurations.
 * Templates include various tech stacks and feature combinations.
 *
 * Features:
 * - Grid display of available templates
 * - Template preview on hover/focus
 * - Keyboard navigation support
 * - Loading state with animation
 * - Toast notification on template selection
 *
 * @module components/TemplateGrid
 * @see {@link STARTER_TEMPLATES} - Available template definitions
 * @see {@link useWizardStore} - Wizard state management
 *
 * @example
 * ```tsx
 * <TemplateGrid />
 * ```
 */

import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { STARTER_TEMPLATES } from "@blueprint/shared";
import { useWizardStore, useToast } from "../store";
import { ANIMATION, TOAST_MESSAGES } from "../config/constants";
import { FORM, FOCUS_VISIBLE_RING_CARD, ICON, SPINNER } from "../config/styles";

function TemplateGridComponent(): JSX.Element {
  const loadTemplate = useWizardStore((s) => s.loadTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleTemplateClick = useCallback(
    (template: (typeof STARTER_TEMPLATES)[0]) => {
      if (selectedId !== null) return;

      setSelectedId(template.id);
      setIsLoading(true);

      setTimeout(() => {
        loadTemplate(template);
        toast.success(TOAST_MESSAGES.TEMPLATE_LOADED(template.name));
        setIsLoading(false);
      }, ANIMATION.FAST);
    },
    [selectedId, loadTemplate, toast]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, template: (typeof STARTER_TEMPLATES)[0]) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (selectedId === null) {
          handleTemplateClick(template);
        }
      }
    },
    [selectedId, handleTemplateClick]
  );

  return (
    <section className="mb-12">
      <h2 className={FORM.SECTION_TITLE}>Quick Start Templates</h2>
      <p className={FORM.SECTION_SUBTITLE}>
        Choose a template to pre-fill your project configuration
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STARTER_TEMPLATES.map((template, index) => {
          const isSelected = selectedId === template.id;

          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isSelected ? 0.98 : 1,
              }}
              transition={{ delay: index * ANIMATION.STAGGER }}
              onClick={() => handleTemplateClick(template)}
              onKeyDown={(e) => handleKeyDown(e, template)}
              disabled={selectedId !== null}
              aria-busy={isSelected && isLoading}
              className={`
                glass-card p-5 text-left transition-all duration-300 group relative card-glow-hover
                will-change-transform
                ${
                  isSelected
                    ? "border-accent-emerald/70 bg-accent-emerald/10"
                    : "hover:border-primary-500/50"
                }
                ${selectedId !== null && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${FOCUS_VISIBLE_RING_CARD}
              `}
              whileHover={selectedId === null ? { scale: 1.02, y: -2 } : undefined}
              whileTap={selectedId === null ? { scale: 0.98 } : undefined}
            >
              {/* Selected state overlay elements animated via conditional mount */}
              {isSelected && (
                <>
                  {/* Checkmark badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-accent-emerald rounded-full flex items-center justify-center z-10"
                  >
                    <svg
                      className={`${ICON.MD} text-white`}
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
                  </motion.div>

                  {/* Pulsing border using opacity animation (composited, no forced reflow) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 rounded-lg border-2 border-accent-emerald/50 pointer-events-none"
                  />
                </>
              )}

              {/* Loading overlay - separate from selected state for animation control */}
              {isSelected && isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-dark-950/30 backdrop-blur-[1px] rounded-lg z-20"
                >
                  <motion.div
                    className={SPINNER.OVERLAY}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}

              <div className="flex items-start gap-4 relative z-10">
                <motion.div
                  className="text-3xl"
                  aria-hidden="true"
                  animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {template.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`
                    font-semibold transition-colors
                    ${isSelected ? "text-accent-emerald" : "text-white group-hover:text-primary-300"}
                  `}
                  >
                    {template.name}
                  </h3>
                  <p className="text-sm text-dark-400 mt-1 line-clamp-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.techStack.slice(0, 3).map((tech) => (
                      <motion.span
                        key={tech.name}
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                        className={`
                          px-2 py-0.5 text-xs rounded transition-shadow duration-200
                          ${
                            isSelected
                              ? "bg-accent-emerald/20 text-accent-emerald"
                              : "bg-dark-800 text-dark-300 group-hover:shadow-[0_0_8px_rgb(99_102_241/0.3)]"
                          }
                        `}
                      >
                        {tech.name}
                      </motion.span>
                    ))}
                    {template.techStack.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-dark-800 rounded text-dark-300">
                        +{template.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export const TemplateGrid = memo(TemplateGridComponent);
