import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const categories = Object.entries(TECH_STACK_OPTIONS);
    const canProceed = techStack.length >= 1;
    const isSelected = (name) => techStack.some((t) => t.name === name);
    const toggleTech = (tech) => {
        if (isSelected(tech.name)) {
            removeTechStack(tech.name);
        }
        else {
            addTechStack({ name: tech.name, category: tech.category });
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Choose your tech stack" }), _jsx("p", { className: "text-dark-400", children: "Select the technologies you plan to use. This helps generate accurate architecture." })] }), _jsxs("div", { className: "glass-card p-6 space-y-6", role: "group", "aria-label": "Tech Stack Selection", children: [categories.map(([category, options]) => (_jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-medium text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2", id: `category-${category}`, children: [_jsxs("span", { "aria-hidden": "true", children: [category === 'frontend' && '🎨', category === 'backend' && '⚙️', category === 'database' && '🗄️', category === 'hosting' && '☁️', category === 'styling' && '🖌️'] }), category] }), _jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-labelledby": `category-${category}`, children: options.map((tech) => (_jsxs("button", { onClick: () => toggleTech(tech), "aria-pressed": isSelected(tech.name), className: clsx('tech-chip', isSelected(tech.name) && 'selected'), children: [isSelected(tech.name) && (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })), tech.name] }, tech.name))) })] }, category))), techStack.length > 0 && (_jsxs("div", { className: "pt-4 border-t border-dark-700", children: [_jsxs("p", { className: "text-sm text-dark-400 mb-2", id: "selected-tech-label", children: ["Selected (", techStack.length, "):"] }), _jsx("ul", { className: "flex flex-wrap gap-2", "aria-labelledby": "selected-tech-label", children: techStack.map((tech) => (_jsxs("li", { className: "inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300", children: [tech.name, _jsx("button", { onClick: () => removeTechStack(tech.name), className: "hover:text-accent-pink transition-colors", "aria-label": `Remove ${tech.name}`, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, tech.name))) })] }))] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("button", { onClick: prevStep, className: "btn-secondary", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back"] }), _jsxs("button", { onClick: nextStep, disabled: !canProceed, className: "btn-primary flex items-center gap-2", children: ["Next: Add Features", _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] })] }));
}
