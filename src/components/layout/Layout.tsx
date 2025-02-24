import { Outlet } from "react-router-dom";
import { useState } from "@/lib/react";
import { MainNav } from "../navigation/MainNav";
import { ErrorBoundary } from "../ErrorBoundary";
import { Sidebar } from "./Sidebar";
import clsx from "clsx";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
