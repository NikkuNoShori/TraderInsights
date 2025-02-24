import { Eye, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cardHoverEffect } from "@/lib/styles";
import { clsx } from "clsx";

export function WatchlistCard() {
  return (
    <motion.div
      className={clsx(
        "bg-white dark:bg-dark-paper rounded-lg p-6",
        cardHoverEffect,
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Watchlist
        </h2>
        <Eye className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        <motion.div
          className="group flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                AAPL
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Apple Inc.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div
              className="flex items-center text-green-500"
              whileHover={{ scale: 1.1 }}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">2.4%</span>
            </motion.div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </motion.div>

        <motion.div
          className="group flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                MSFT
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Microsoft Corp.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div
              className="flex items-center text-red-500"
              whileHover={{ scale: 1.1 }}
            >
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">1.2%</span>
            </motion.div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
