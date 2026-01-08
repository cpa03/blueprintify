import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useWizardStore } from '../../store';
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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (canProceed) {
            nextStep();
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Tell us about your project" }), _jsx("p", { className: "text-dark-400", children: "We'll use this information to generate a tailored architecture blueprint." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "glass-card p-6 space-y-5", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "projectName", className: "label", children: ["Project Name ", _jsx("span", { className: "text-accent-pink", "aria-hidden": "true", children: "*" })] }), _jsx("input", { id: "projectName", name: "projectName", type: "text", value: projectName, onChange: (e) => setProjectName(e.target.value), placeholder: "my-awesome-project", className: "input-field", maxLength: 100, required: true, "aria-required": "true" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "description", className: "label", children: ["Project Description ", _jsx("span", { className: "text-accent-pink", "aria-hidden": "true", children: "*" }), _jsxs("span", { className: "text-dark-500 ml-2", children: ["(", description.length, "/2000)"] })] }), _jsx("textarea", { id: "description", name: "description", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Describe what your project does, its main purpose, and key functionality...", className: `textarea-field h-32 ${isDescriptionInvalid ? 'border-accent-pink' : ''}`, maxLength: 2000, required: true, "aria-required": "true", "aria-invalid": isDescriptionInvalid, "aria-describedby": isDescriptionInvalid ? "description-error" : undefined }), isDescriptionInvalid && (_jsx("p", { id: "description-error", role: "alert", className: "text-xs text-accent-pink mt-1", children: "Description must be at least 10 characters" }))] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "targetAudience", className: "label", children: ["Target Audience ", _jsx("span", { className: "text-dark-500", children: "(optional)" })] }), _jsx("input", { id: "targetAudience", name: "targetAudience", type: "text", value: targetAudience, onChange: (e) => setTargetAudience(e.target.value), placeholder: "e.g., Developers, Small businesses, Enterprise teams", className: "input-field" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "constraints", className: "label", children: ["Constraints or Requirements ", _jsx("span", { className: "text-dark-500", children: "(optional)" })] }), _jsx("textarea", { id: "constraints", name: "constraints", value: constraints, onChange: (e) => setConstraints(e.target.value), placeholder: "e.g., Must be serverless, needs to support 10k concurrent users, budget limitations...", className: "textarea-field h-24" })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsxs("button", { type: "submit", disabled: !canProceed, className: "btn-primary flex items-center gap-2", children: ["Next: Choose Tech Stack", _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }) })] })] }));
}
