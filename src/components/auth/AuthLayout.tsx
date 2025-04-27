import { type ReactNode } from "@/lib/react";
import { Logo } from "@/components/ui";
import { useThemeStore } from "@/stores/themeStore";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { isDark } = useThemeStore();

  return (
    <div className="min-h-screen bg-default flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Logo className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-default text-center">{title}</h1>
          <p className="text-muted text-center">{subtitle}</p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
