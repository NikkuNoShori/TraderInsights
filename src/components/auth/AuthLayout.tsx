import { type ReactNode } from "@/lib/react";
import { Logo } from "@/components/ui";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <Logo className="h-12 w-auto" />
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
      </div>

      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}
