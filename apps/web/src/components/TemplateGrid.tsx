import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STARTER_TEMPLATES } from "@blueprint/shared";
import { useWizardStore, useToast } from "../store";
import { ANIMATION } from "../config/constants";

function TemplateGridComponent() {
  const loadTemplate = useWizardStore((s) => s.loadTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const toast = useToast();

  const handleTemplateClick = (template: (typeof STARTER_TEMPLATES)[0]) => {
    setSelectedId(template.id);

    setTimeout(() => {
      loadTemplate(template);
      toast.success(`${template.name} template loaded`);
    }, ANIMATION.FAST);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    template: (typeof STARTER_TEMPLATES)[0],
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectedId === null) {
        handleTemplateClick(template);
      }
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-2">
        Quick Start Templates
      </h2>
      <p className="text-dark-400 mb-6">
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
              className={`
                glass-card p-5 text-left transition-all duration-300 group relative card-glow-hover
                ${
                  isSelected
                    ? "border-accent-emerald/70 bg-accent-emerald/10"
                    : "hover:border-primary-500/50"
                }
                ${selectedId !== null && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950
              `}
              whileHover={
                selectedId === null ? { scale: 1.02, y: -2 } : undefined
              }
              whileTap={selectedId === null ? { scale: 0.98 } : undefined}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-accent-emerald rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-white"
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
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg border-2 border-accent-emerald/50"
                    style={{
                      animation:
                        "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-start gap-4 relative z-10">
                <motion.div
                  className="text-3xl"
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
                  <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech.name}
                        className={`
                          px-2 py-0.5 text-xs rounded
                          ${
                            isSelected
                              ? "bg-accent-emerald/20 text-accent-emerald"
                              : "bg-dark-800 text-dark-300"
                          }
                        `}
                      >
                        {tech.name}
                      </span>
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
