import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function PlaybookCard(): JSX.Element {
  return (
    <div className="space-y-2">
      {["Gap & Go", "Breakout", "VWAP Reversal"].map((strategy) => (
        <motion.div
          key={strategy}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 dark:hover:bg-gray-800/50 cursor-pointer"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-base font-medium text-foreground dark:text-gray-200">
              {strategy}
            </span>
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              75% Win Rate
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
        </motion.div>
      ))}
    </div>
  );
}
