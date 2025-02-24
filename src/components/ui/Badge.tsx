import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Tooltip } from "./Tooltip";

interface BadgeProps {
  type: "soon" | "beta" | "new";
  tooltipContent: string;
}

const badgeVariants = {
  soon: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  beta: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  new: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
};

const badgeLabels = {
  soon: "Soon",
  beta: "Beta",
  new: "New",
};

export function Badge({ type, tooltipContent }: BadgeProps) {
  return (
    <Tooltip content={tooltipContent} side="right">
      <motion.span
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={clsx(
          "ml-2 px-1.5 py-0.5 text-xs font-medium rounded-full",
          "transition-colors duration-150",
          badgeVariants[type],
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {badgeLabels[type]}
      </motion.span>
    </Tooltip>
  );
}
