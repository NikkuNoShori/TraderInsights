import { useAuthStore } from "@/stores/authStore";
import { useNavStore } from "@/stores/navStore";
import { Link } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import { clsx } from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "../ui/dropdown-menu";

export function UserMenu() {
  const { user, signOut } = useAuthStore();
  const { isCollapsed } = useNavStore();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={clsx(
        "flex items-center w-full p-2 rounded-lg",
        "hover:bg-primary-50 dark:hover:bg-primary-900/10",
        "transition-all duration-200 ease-in-out",
        "group"
      )}>
        <div
          className={clsx(
            "w-8 h-8 rounded-full",
            "bg-gradient-to-br from-primary/20 to-primary/10",
            "flex items-center justify-center",
            "ring-1 ring-primary/20",
            "transition-all duration-200 ease-in-out",
            "group-hover:scale-105",
            "group-hover:ring-primary/30",
            "group-hover:from-primary/30 group-hover:to-primary/20",
          )}
        >
          <User
            className={clsx(
              "h-4 w-4 text-primary-600 dark:text-primary-400",
              "transition-transform duration-200 ease-in-out",
              "group-hover:scale-110",
            )}
          />
        </div>
        {!isCollapsed && (
          <div className="ml-3 text-left">
            <p className={clsx(
              "text-sm font-medium",
              "text-foreground dark:text-dark-text",
              "transition-colors duration-200",
              "group-hover:text-primary-700 dark:group-hover:text-primary-300",
            )}>
              Hey, {user.email?.split("@")[0] || "there"}
            </p>
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          className="w-56 z-[calc(var(--z-nav)+20)]"
          sideOffset={8}
          alignOffset={-4}
          style={{
            transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)'
          }}
        >
          <div className="px-2 py-1.5 mb-1">
            <div className="text-sm font-medium text-foreground dark:text-dark-text">
              {user.email}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/app/settings/profile" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={signOut}
            className="text-destructive dark:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
