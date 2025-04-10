import { MainNav } from "../navigation/MainNav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("h-full", className)}>
      <MainNav />
    </div>
  );
}
