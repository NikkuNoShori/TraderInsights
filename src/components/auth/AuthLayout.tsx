import { Outlet } from "react-router-dom";
import { Logo } from "@/components/ui";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
}

export function AuthLayout({ title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background dark:bg-dark-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground dark:text-dark-text">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground dark:text-dark-muted">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card dark:bg-dark-paper py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
