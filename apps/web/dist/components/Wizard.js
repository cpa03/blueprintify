import { jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence } from 'framer-motion';
import { useWizardStore } from '../store';
import { StepInfo } from './wizard/StepInfo';
import { StepStack } from './wizard/StepStack';
import { StepFeatures } from './wizard/StepFeatures';
import { StepReview } from './wizard/StepReview';
import { StepGenerating } from './wizard/StepGenerating';
export function Wizard() {
    const currentStep = useWizardStore((s) => s.currentStep);
    const renderStep = () => {
        switch (currentStep) {
            case 'info':
                return _jsx(StepInfo, {}, "info");
            case 'stack':
                return _jsx(StepStack, {}, "stack");
            case 'features':
                return _jsx(StepFeatures, {}, "features");
            case 'review':
                return _jsx(StepReview, {}, "review");
            case 'generating':
                return _jsx(StepGenerating, {}, "generating");
            default:
                return _jsx(StepInfo, {}, "default");
        }
    };
    return (_jsx("div", { className: "flex-1 overflow-y-auto p-6", children: _jsx(AnimatePresence, { mode: "wait", children: renderStep() }) }));
}
