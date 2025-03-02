import { type ReactNode } from "@/lib/react";
import { MainNav } from "@/components/navigation/MainNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNavStore } from "@/stores/navStore";
import clsx from "clsx";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isCollapsed } = useNavStore();

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex">
      <MainNav />

      <div
        className={clsx(
          "flex-1 transition-all duration-300 ease-in-out",
          "px-6", // Add horizontal padding on both sides
          isCollapsed ? "ml-[80px]" : "ml-[250px]", // Adjust margin based on nav width
        )}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
