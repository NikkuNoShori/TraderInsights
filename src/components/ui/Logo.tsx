import { Link, useNavigate } from 'react-router-dom';
import { LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChangelogModal } from '../changelog/ChangelogModal';
import { useState } from '@/lib/hooks';

const VERSION = '1.0.0-beta';

export function Logo() {
  const navigate = useNavigate();
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          to="/dashboard"
          className="flex items-center w-full no-underline hover:no-underline
                     text-inherit hover:text-inherit cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          <LineChart className="h-5 w-5 text-primary-500 flex-shrink-0 
                               group-hover:text-primary-600 transition-colors duration-200" />
          <div className="flex items-center justify-between ml-2 flex-1 min-w-0">
            <span className="text-base font-semibold text-gray-900 dark:text-white truncate
                           group-hover:text-primary-500 dark:group-hover:text-primary-400
                           transition-colors duration-200">
              Trading Insights
            </span>
            <span className="ml-1.5 px-1 py-0.5 text-[9px] leading-none font-medium
                           bg-primary-100 text-primary-700
                           dark:bg-primary-900/30 dark:text-primary-300
                           rounded flex-shrink-0">
              {VERSION}
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Version Tooltip with Changelog Link */}
      <div className="absolute -bottom-8 left-0 w-full opacity-0 group-hover:opacity-100
                      transition-opacity duration-200">
        <button
          onClick={() => setShowChangelog(true)}
          className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-paper
                     px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700
                     hover:text-primary-500 dark:hover:text-primary-400
                     transition-colors duration-200"
        >
          View Changelog
        </button>
      </div>

      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </div>
  );
}
