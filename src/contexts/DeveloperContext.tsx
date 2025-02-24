import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "@/lib/react";
import { useCreateContext } from "@/lib/utils/contextRegistry";

interface DeveloperContextType {
  isDeveloperMode: boolean;
  setDeveloperMode: (enabled: boolean) => void;
}

const DeveloperContext = createContext<DeveloperContextType>({
  isDeveloperMode: false,
  setDeveloperMode: () => {},
});

export function useDeveloperMode() {
  return useContext(DeveloperContext);
}

export function DeveloperProvider({ children }: { children: ReactNode }) {
  // Register the context
  useCreateContext("DeveloperContext");

  const [isDeveloperMode, setDeveloperMode] = useState(() => {
    const saved = localStorage.getItem("developerMode");
    return saved === "true";
  });

  const handleSetDeveloperMode = (enabled: boolean) => {
    setDeveloperMode(enabled);
    localStorage.setItem("developerMode", enabled.toString());
  };

  return (
    <DeveloperContext.Provider
      value={{
        isDeveloperMode,
        setDeveloperMode: handleSetDeveloperMode,
      }}
    >
      {children}
    </DeveloperContext.Provider>
  );
}
