import { type ReactNode } from "@/lib/react";
import { MainNav } from "@/components/navigation/MainNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import clsx from "clsx";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex">
      <MainNav />

      <main
        className={clsx(
          "flex-1 transition-all duration-300",
          "ml-[80px] lg:ml-[250px]", // Adjust margin based on nav width
        )}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
