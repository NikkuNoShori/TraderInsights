import { AuthLogo } from './AuthLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AuthLogo />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}