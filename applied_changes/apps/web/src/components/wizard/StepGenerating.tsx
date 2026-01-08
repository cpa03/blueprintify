import { motion } from 'framer-motion';
import { useEditorStore } from '../../store';

export function StepGenerating() {
  const progress = useEditorStore((s) => s.generationProgress);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);

  const blueprintLines = blueprintContent.split('\n').length;
  const tasksLines = tasksContent.split('\n').length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Animated loader */}
      <div className="relative mb-8">
        <motion.div
          className="w-24 h-24 rounded-full border-4 border-dark-700"
          style={{ borderTopColor: 'rgb(99 102 241)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl"
          >
            🚀
          </motion.div>
        </div>
      </div>

      {/* Progress text */}
      <h2 className="text-xl font-bold text-white mb-2">Generating Your Blueprint</h2>
      <p className="text-dark-400 mb-6">{progress || 'Starting...'}</p>

      {/* Live stats */}
      <div className="flex gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient">{blueprintLines}</div>
          <div className="text-sm text-dark-400">Blueprint Lines</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card px-6 py-4"
        >
          <div className="text-2xl font-bold text-gradient">{tasksLines}</div>
          <div className="text-sm text-dark-400">Task Lines</div>
        </motion.div>
      </div>

      {/* Live preview hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-dark-500 mt-8"
      >
        💡 Content streams in real-time. View the editor panel to see progress.
      </motion.p>
    </motion.div>
  );
}
