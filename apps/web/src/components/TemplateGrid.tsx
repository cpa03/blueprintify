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
 * Performance: Uses CSS animations instead of framer-motion. This component
 * is shown on the initial page render (when templates are visible), so keeping
 * framer-motion out of its import tree prevents the 45 KiB animation chunk
 * from loading before user interaction.
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

import { useState, memo, useCallback, useRef, useMemo } from "react";
import { STARTER_TEMPLATES } from "@blueprint/shared";
import { useWizardStore, useToast } from "../store";
import { ANIMATION, TOAST_MESSAGES, ACCESSIBILITY_LABELS } from "../config/constants";
import { FORM, FOCUS_VISIBLE_RING_CARD, ICON, SPINNER } from "../config/styles";
import { TEMPLATE_GLOW_SHADOW } from "../config/theme";

function TemplateGridComponent({ onSelect }: { onSelect?: () => void }): JSX.Element {
  const loadTemplate = useWizardStore((s) => s.loadTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState<number>(-1);

  // Estimate grid columns based on viewport — used for ArrowUp/ArrowDown navigation.
  // Defaults to 1 for mobile, detects 2 at md breakpoint (768px), 3 at lg (1024px).
  const gridColumns = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }, []);

  const handleTemplateClick = useCallback(
    (template: (typeof STARTER_TEMPLATES)[0]) => {
      if (selectedId !== null) return;

      onSelect?.();
      setSelectedId(template.id);
      setIsLoading(true);

      setTimeout(() => {
        loadTemplate(template);
        toast.success(TOAST_MESSAGES.TEMPLATE_LOADED(template.name));
        setIsLoading(false);
      }, ANIMATION.FAST);
    },
    [selectedId, loadTemplate, toast, onSelect]
  );

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, template: (typeof STARTER_TEMPLATES)[0], index: number) => {
      // Enter/Space to select the template
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (selectedId === null) {
          handleTemplateClick(template);
        }
        return;
      }

      // Arrow key navigation between template cards
      const totalCards = STARTER_TEMPLATES.length;
      let nextIndex = -1;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          nextIndex = Math.min(totalCards - 1, index + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = Math.max(0, index - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          nextIndex = Math.min(totalCards - 1, index + gridColumns);
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = Math.max(0, index - gridColumns);
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = totalCards - 1;
          break;
        default:
          return;
      }

      if (nextIndex >= 0 && nextIndex < totalCards && nextIndex !== index) {
        setFocusIndex(nextIndex);
        cardRefs.current[nextIndex]?.focus();
      }
    },
    [selectedId, handleTemplateClick, gridColumns]
  );

  return (
    <section className="mb-12">
      <h2 className={FORM.SECTION_TITLE}>Quick Start Templates</h2>
      <p className={FORM.SECTION_SUBTITLE}>
        Choose a template to pre-fill your project configuration
      </p>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="listbox"
        aria-label={ACCESSIBILITY_LABELS.TEMPLATES.QUICK_START}
        aria-orientation="horizontal"
      >
        {STARTER_TEMPLATES.map((template, index) => {
          const isSelected = selectedId === template.id;

          return (
            <button
              key={template.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              onClick={() => handleTemplateClick(template)}
              onKeyDown={(e) => handleCardKeyDown(e, template, index)}
              disabled={selectedId !== null}
              aria-busy={isSelected && isLoading}
              aria-selected={isSelected}
              role="option"
              tabIndex={focusIndex >= 0 ? (focusIndex === index ? 0 : -1) : 0}
              style={
                {
                  animationDelay: `${index * ANIMATION.CARD_ENTRANCE_DELAY}s`,
                  animationDuration: `${ANIMATION.CARD_ENTRANCE_DURATION}s`,
                  "--tech-glow": TEMPLATE_GLOW_SHADOW,
                } as React.CSSProperties
              }
              className={`
                glass-card p-5 text-left relative group card-glow-hover
                will-change-transform
                animate-fade-in
                motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out
                motion-safe:hover:scale-[1.02] motion-safe:hover:-translate-y-0.5
                motion-safe:active:scale-[0.98]
                ${
                  isSelected
                    ? "border-accent-emerald/70 bg-accent-emerald/10 scale-[0.98]"
                    : "hover:border-primary-500/50 cursor-pointer"
                }
                ${selectedId !== null && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${FOCUS_VISIBLE_RING_CARD}
              `}
            >
              {/* Selected state overlay elements animated via conditional mount */}
              {isSelected && (
                <>
                  {/* Checkmark badge */}
                  <div
                    className="absolute top-3 right-3 w-6 h-6 bg-accent-emerald rounded-full flex items-center justify-center z-10 animate-fade-in"
                    style={{ animationDuration: `${ANIMATION.CHECKMARK_OVERLAY_S}s` }}
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
                  </div>

                  {/* Pulsing border using CSS animation (composited, no forced reflow) */}
                  <div
                    className="absolute inset-0 rounded-lg border-2 border-accent-emerald/50 pointer-events-none animate-glow"
                    aria-hidden="true"
                  />
                </>
              )}

              {/* Loading overlay */}
              {isSelected && isLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-dark-950/30 backdrop-blur-[1px] rounded-lg z-20 animate-fade-in"
                  style={{ animationDuration: `${ANIMATION.LOADING_OVERLAY_S}s` }}
                >
                  <div className={SPINNER.OVERLAY} />
                </div>
              )}

              <div className="flex items-start gap-4 relative z-10">
                <div
                  className={`text-3xl motion-safe:transition-transform motion-safe:duration-200 ${
                    isSelected ? "scale-110" : ""
                  }`}
                  aria-hidden="true"
                >
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`
                    font-semibold transition-colors duration-200
                    ${isSelected ? "text-accent-emerald" : "text-white group-hover:text-primary-300"}
                  `}
                  >
                    {template.name}
                  </h3>
                  <p className="text-sm text-dark-400 mt-1 line-clamp-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech.name}
                        className={`
                          px-2 py-0.5 text-xs rounded motion-safe:transition-all motion-safe:duration-150
                          motion-safe:hover:scale-105
                          ${
                            isSelected
                              ? "bg-accent-emerald/20 text-accent-emerald"
                              : "bg-dark-800 text-dark-300 group-hover:[box-shadow:var(--tech-glow)]"
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
            </button>
          );
        })}
      </div>
    </section>
  );
}

export const TemplateGrid = memo(TemplateGridComponent);
