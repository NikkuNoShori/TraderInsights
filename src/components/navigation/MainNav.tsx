import { useEffect, useCallback, useState, useRef } from "@/lib/hooks";
import type { MouseEvent as ReactMouseEvent } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  List,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  BarChart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Tooltip } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useNavStore } from "@/stores/navStore";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";

type NavCategory = {
  label: string;
  items: {
    label: string;
    icon: typeof LayoutDashboard;
    href: string;
    badge?: string;
    isNew?: boolean;
    isBeta?: boolean;
    isComingSoon?: boolean;
  }[];
};

const navCategories: NavCategory[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/app/dashboard",
      },
      {
        label: "Journal",
        icon: BookOpen,
        href: "/app/journal",
      },
      {
        label: "Performance",
        icon: LineChart,
        href: "/app/performance",
      },
      {
        label: "Broker Dashboard",
        icon: Wallet,
        href: "/app/broker-dashboard",
      },
    ],
  },
  {
    label: "Market",
    items: [
      {
        label: "Stocks",
        icon: BarChart,
        href: "/app/stocks",
        isComingSoon: true,
      },
      {
        label: "Market Data",
        icon: TrendingUp,
        href: "/app/market",
        isComingSoon: true,
      },
    ],
  },
  {
    label: "Future Features",
    items: [
      {
        label: "Playbook",
        icon: BookOpen,
        href: "/app/playbook",
        isComingSoon: true,
      },
      {
        label: "Watchlist",
        icon: List,
        href: "/app/watchlist",
        isComingSoon: true,
      },
      {
        label: "Portfolios",
        icon: Briefcase,
        href: "/app/portfolios",
        isComingSoon: true,
      },
    ],
  },
];

export function MainNav() {
  const { isCollapsed, toggleCollapsed } = useNavStore();
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("nav-open-categories");
    return saved ? JSON.parse(saved) : [];
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        // Menu closes automatically with CSS
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    // Menu closes automatically with CSS
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("nav-open-categories", JSON.stringify(openCategories));
  }, [openCategories]);

  useEffect(() => {
    console.log("MainNav mounted");
    return () => console.log("MainNav unmounted");
  }, []);

  const toggleCategory = useCallback((category: string, e: ReactMouseEvent) => {
    e.preventDefault();
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  const handleSettingsClick = () => {
    navigate("/app/settings/profile");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  return (
    <div 
      className="fixed left-0 top-0 bottom-0" 
      style={{ zIndex: 'var(--z-nav)' } as React.CSSProperties}
    >
      <motion.nav
        className={clsx(
          "relative h-full border-r border-border transition-all duration-300 ease-in-out",
          "bg-card dark:bg-dark-paper",
          isCollapsed ? "w-[80px]" : "w-[250px]",
        )}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 border-b border-border dark:border-dark-border bg-card dark:bg-dark-paper">
          <div className="flex items-center space-x-2">
            <LineChart className="h-6 w-6 text-primary" />
            {!isCollapsed && (
              <div className="flex items-center">
                <span className="font-semibold text-foreground dark:text-dark-text">
                  Trading Insights
                </span>
                <Badge
                  type="beta"
                  tooltipContent="Trading Insights is currently in beta. We're actively adding new features!"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main content - scrollable area */}
        <div className="h-full pt-[72px] pb-[72px] overflow-y-auto">
          <div className="p-4 space-y-4">
            {navCategories.map((category) => (
              <div key={category.label} className="relative">
                {!isCollapsed && (
                  <div
                    onClick={(e) =>
                      toggleCategory(category.label, e as ReactMouseEvent)
                    }
                    className="flex items-center justify-between w-full text-sm font-semibold 
                             text-muted-foreground dark:text-gray-300 
                             hover:text-foreground dark:hover:text-white 
                             transition-colors cursor-pointer mb-2"
                  >
                    {category.label}
                    <ChevronLeft
                      className={clsx(
                        "h-4 w-4 text-muted-foreground dark:text-gray-300 transition-transform",
                        openCategories.includes(category.label) && "-rotate-90",
                      )}
                    />
                  </div>
                )}

                <motion.div
                  className={clsx(
                    "space-y-1 overflow-hidden",
                    !isCollapsed && "ml-3",
                  )}
                  initial={false}
                  animate={{
                    height:
                      isCollapsed || openCategories.includes(category.label)
                        ? "auto"
                        : 0,
                    opacity:
                      isCollapsed || openCategories.includes(category.label)
                        ? 1
                        : 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                  }}
                >
                  {category.items.map(
                    ({ label, icon: Icon, href, isComingSoon, isBeta }) => (
                      <Tooltip
                        key={href}
                        content={isCollapsed ? label : null}
                        side="right"
                        delayDuration={0}
                      >
                        <NavLink
                          to={href}
                          className={({ isActive }) =>
                            clsx(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                              "hover:scale-105",
                              "cursor-pointer",
                              isCollapsed ? "justify-center" : "justify-start",
                              isActive
                                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-gray-300 dark:hover:text-white",
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon
                                className={clsx(
                                  "h-5 w-5 transition-all duration-200",
                                  !isCollapsed && "mr-3",
                                  "hover:scale-110",
                                  isActive
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-muted-foreground dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400",
                                )}
                              />
                              {!isCollapsed && (
                                <div className="flex items-center justify-between flex-1">
                                  <span
                                    className={
                                      isActive
                                        ? "text-primary-600 dark:text-primary-400"
                                        : "text-muted-foreground dark:text-gray-300"
                                    }
                                  >
                                    {label}
                                  </span>
                                  {isComingSoon && (
                                    <Badge
                                      type="soon"
                                      tooltipContent="This feature is currently under development and will be available soon!"
                                    />
                                  )}
                                  {isBeta && (
                                    <Badge
                                      type="beta"
                                      tooltipContent="This feature is in beta testing. Your feedback is welcome!"
                                    />
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </NavLink>
                      </Tooltip>
                    ),
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with user menu */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 border-t border-border dark:border-dark-border bg-card dark:bg-dark-paper">
          <UserMenu />
        </div>
      </motion.nav>

      <div
        className={clsx(
          "absolute top-1/2 -translate-y-1/2",
          isCollapsed ? "left-[68px]" : "left-[238px]",
          "transition-all duration-300 ease-in-out",
          "z-20"
        )}
      >
        <button
          onClick={toggleCollapsed}
          className={clsx(
            "w-8 h-8 rounded-full border border-border",
            "flex items-center justify-center",
            "bg-background text-muted-foreground hover:text-foreground",
            "transition-colors duration-200",
            "shadow-sm hover:shadow-md",
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
