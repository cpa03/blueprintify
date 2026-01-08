import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useWizardStore } from '../store';
const STEPS = [
    { key: 'info', label: 'Project Info', icon: '📝' },
    { key: 'stack', label: 'Tech Stack', icon: '⚙️' },
    { key: 'features', label: 'Features', icon: '✨' },
    { key: 'review', label: 'Review', icon: '👀' },
    { key: 'generating', label: 'Generate', icon: '🚀' }
];
export function StepIndicator() {
    const currentStep = useWizardStore((s) => s.currentStep);
    const setStep = useWizardStore((s) => s.setStep);
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    const canNavigateTo = (stepKey) => {
        const targetIndex = STEPS.findIndex((s) => s.key === stepKey);
        // Can go back, but not forward beyond current
        return targetIndex <= currentIndex && stepKey !== 'generating';
    };
    return (_jsx("div", { className: "flex items-center justify-center gap-2 mb-8", children: STEPS.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = index < currentIndex;
            const isClickable = canNavigateTo(step.key);
            return (_jsxs("div", { className: "flex items-center", children: [_jsxs(motion.button, { onClick: () => isClickable && setStep(step.key), disabled: !isClickable, className: `
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${isActive
                            ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                            : isCompleted
                                ? 'bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald'
                                : 'bg-dark-800/50 border border-dark-700 text-dark-400'}
                ${isClickable ? 'cursor-pointer hover:bg-dark-700' : 'cursor-default'}
              `, whileHover: isClickable ? { scale: 1.02 } : undefined, whileTap: isClickable ? { scale: 0.98 } : undefined, children: [_jsx("span", { children: step.icon }), _jsx("span", { className: "text-sm font-medium hidden sm:inline", children: step.label })] }), index < STEPS.length - 1 && (_jsx("div", { className: `w-8 h-0.5 mx-2 ${isCompleted ? 'bg-accent-emerald' : 'bg-dark-700'}` }))] }, step.key));
        }) }));
}
