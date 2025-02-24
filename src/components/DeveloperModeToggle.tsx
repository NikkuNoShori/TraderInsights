import { Terminal } from "lucide-react";
import { useDeveloperMode } from "../contexts/DeveloperContext";
import { clsx } from "clsx";

export function DeveloperModeToggle() {
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode();

  const handleKeyPress = (e: KeyboardEvent) => {
    // Toggle developer mode when pressing Ctrl + Shift + D
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      toggleDeveloperMode();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <button
      onClick={toggleDeveloperMode}
      className={clsx(
        "fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200",
        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
        isDeveloperMode
          ? "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500"
          : "bg-gray-100 hover:bg-gray-200 text-gray-600 focus:ring-gray-500",
      )}
      title={`${isDeveloperMode ? "Disable" : "Enable"} Developer Mode (Ctrl + Shift + D)`}
    >
      <Terminal className="h-5 w-5" />
    </button>
  );
}
