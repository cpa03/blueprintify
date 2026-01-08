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
        return <StepInfo key="info" />;
      case 'stack':
        return <StepStack key="stack" />;
      case 'features':
        return <StepFeatures key="features" />;
      case 'review':
        return <StepReview key="review" />;
      case 'generating':
        return <StepGenerating key="generating" />;
      default:
        return <StepInfo key="default" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
