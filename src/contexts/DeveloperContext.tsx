import { useLocalStorage } from '../hooks/useLocalStorage';

interface DeveloperContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
}

const DeveloperContext = createContext<DeveloperContextType>({} as DeveloperContextType);

export function DeveloperProvider({ children }: { children: React.ReactNode }) {
  const [isDeveloperMode, setIsDeveloperMode] = useLocalStorage('developer-mode', false);

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
  };

  return (
    <DeveloperContext.Provider value={{ isDeveloperMode, toggleDeveloperMode }}>
      {children}
    </DeveloperContext.Provider>
  );
}

export const useDeveloperMode = () => {
  const context = useContext(DeveloperContext);
  if (!context) {
    throw new Error('useDeveloperMode must be used within a DeveloperProvider');
  }
  return context;
};