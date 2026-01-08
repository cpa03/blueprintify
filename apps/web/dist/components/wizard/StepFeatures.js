import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddFeature();
        }
    };
    const isInFeatures = (feature) => features.some((f) => f.toLowerCase() === feature.toLowerCase());
    const suggestedNotAdded = SUGGESTED_FEATURES.filter((f) => !isInFeatures(f));
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Add key features" }), _jsx("p", { className: "text-dark-400", children: "List the main features your project should have. This helps prioritize tasks." })] }), _jsxs("div", { className: "glass-card p-6 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "feature-input", className: "label", children: "Add a feature" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { id: "feature-input", type: "text", value: newFeature, onChange: (e) => setNewFeature(e.target.value), onKeyDown: handleKeyDown, placeholder: "e.g., Real-time notifications", className: "input-field flex-1", "aria-label": "New feature name" }), _jsx("button", { onClick: handleAddFeature, disabled: !newFeature.trim(), className: "btn-primary px-4", "aria-label": "Add feature", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) })] })] }), features.length > 0 && (_jsxs("div", { children: [_jsxs("label", { className: "label", id: "added-features-label", children: ["Your features (", features.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-2", role: "list", "aria-labelledby": "added-features-label", children: features.map((feature, index) => (_jsxs(motion.span, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, className: "inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-lg text-sm text-primary-300", role: "listitem", children: [_jsx("span", { className: "text-accent-emerald", "aria-hidden": "true", children: "\u2713" }), feature, _jsx("button", { onClick: () => removeFeature(index), className: "hover:text-accent-pink transition-colors", "aria-label": `Remove ${feature}`, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, index))) })] })), suggestedNotAdded.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "label", id: "suggestions-label", children: "Quick add suggestions" }), _jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-labelledby": "suggestions-label", children: suggestedNotAdded.map((feature) => (_jsxs("button", { onClick: () => addFeature(feature), className: "tech-chip hover:border-accent-emerald/50", "aria-label": `Add suggestion: ${feature}`, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), feature] }, feature))) })] }))] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("button", { onClick: prevStep, className: "btn-secondary", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back"] }), _jsxs("button", { onClick: nextStep, className: "btn-primary flex items-center gap-2", children: ["Next: Review", _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] })] }));
}
