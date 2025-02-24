import { X } from "lucide-react";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: "added" | "changed" | "fixed" | "removed";
    description: string;
  }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0-beta",
    date: "2024-03-20",
    changes: [
      { type: "added", description: "Initial beta release" },
      { type: "added", description: "Stock and options trading support" },
      { type: "added", description: "Dark mode support" },
      { type: "added", description: "Trading analytics dashboard" },
    ],
  },
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getTypeColor = (type: ChangelogEntry["changes"][0]["type"]) => {
    switch (type) {
      case "added":
        return "text-green-600 dark:text-green-400";
      case "changed":
        return "text-blue-600 dark:text-blue-400";
      case "fixed":
        return "text-yellow-600 dark:text-yellow-400";
      case "removed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-paper rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Changelog
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="mb-8 last:mb-0">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Version {entry.version}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {entry.date}
                </span>
              </div>
              <ul className="space-y-3">
                {entry.changes.map((change, index) => (
                  <li key={index} className="flex items-start">
                    <span
                      className={`font-medium capitalize mr-2 ${getTypeColor(change.type)}`}
                    >
                      {change.type}:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {change.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
