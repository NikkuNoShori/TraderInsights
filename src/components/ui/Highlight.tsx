import { motion } from "framer-motion";

interface HighlightProps {
  children: React.ReactNode;
  active?: boolean;
}

export function Highlight({ children, active = false }: HighlightProps) {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          layoutId="highlight"
          className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
