import { Logo } from './Logo';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="animate-pulse">
        <Logo />
      </div>
      <div className="mt-4 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    </div>
  );
} 