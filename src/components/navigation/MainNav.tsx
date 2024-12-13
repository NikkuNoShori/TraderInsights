import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  BookOpen, 
  List,
  Briefcase,
  ChevronLeft,
  BarChart2,
  ChevronRight,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Tooltip } from '../ui/Tooltip';
import { useSupabase } from '../../contexts/SupabaseContext';
import { DarkModeToggle } from '../DarkModeToggle';
import { Badge } from '../ui/Badge';

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
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard'
      }
    ]
  },
  {
    label: 'Trading',
    items: [
      {
        label: 'Journal',
        icon: BookOpen,
        href: '/journal'
      },
      {
        label: 'Watchlist',
        icon: List,
        href: '/watchlist',
        isComingSoon: true
      },
      {
        label: 'Portfolios',
        icon: Briefcase,
        href: '/portfolios',
        isComingSoon: true
      }
    ]
  },
  {
    label: 'Analysis',
    items: [
      {
        label: 'Performance',
        icon: LineChart,
        href: '/analysis/performance'
      }
    ]
  }
];

interface MainNavProps {
  defaultCollapsed?: boolean;
}

export function MainNav({ defaultCollapsed = true }: MainNavProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('nav-collapsed');
    return saved ? JSON.parse(saved) : true;
  });

  const [openCategories, setOpenCategories] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('nav-open-categories');
    return saved ? JSON.parse(saved) : [];
  });

  const { user, supabase } = useSupabase();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('nav-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  React.useEffect(() => {
    localStorage.setItem('nav-open-categories', JSON.stringify(openCategories));
  }, [openCategories]);

  React.useEffect(() => {
    console.log('MainNav mounted');
    return () => console.log('MainNav unmounted');
  }, []);
  const toggleCollapse = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  const toggleCategory = React.useCallback((category: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isCollapsed) {
      setOpenCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  }, [isCollapsed]);

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 bottom-0 h-full">
      <motion.nav
        className={clsx(
          "h-full border-r border-border transition-all duration-300 ease-in-out",
          "bg-card dark:bg-dark-paper",
          isCollapsed ? "w-[80px]" : "w-[250px]"
        )}
      >
        <div className="p-4 border-b border-border dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <LineChart className="h-6 w-6 text-primary" />
            {!isCollapsed && (
              <div className="flex items-center">
                <span className="font-semibold text-foreground dark:text-dark-text">
                  Trading Journal
                </span>
                <Badge 
                  type="beta" 
                  tooltipContent="Trading Journal is currently in beta. We're actively adding new features!"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 p-4">
          {navCategories.map((category) => (
            <div key={category.label} className="relative">
              {!isCollapsed && (
                <div
                  onClick={(e) => toggleCategory(category.label, e)}
                  className="flex items-center justify-between w-full text-sm font-semibold 
                           text-muted-foreground dark:text-gray-300 
                           hover:text-foreground dark:hover:text-white 
                           transition-colors cursor-pointer mb-2"
                >
                  {category.label}
                  <ChevronLeft 
                    className={clsx(
                      "h-4 w-4 text-muted-foreground dark:text-gray-300 transition-transform",
                      openCategories.includes(category.label) && "-rotate-90"
                    )} 
                  />
                </div>
              )}

              <motion.div
                className={clsx(
                  "space-y-1 overflow-hidden",
                  !isCollapsed && "ml-3"
                )}
                initial={false}
                animate={{
                  height: isCollapsed || openCategories.includes(category.label) ? "auto" : 0,
                  opacity: isCollapsed || openCategories.includes(category.label) ? 1 : 0
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut"
                }}
              >
                {category.items.map(({ label, icon: Icon, href, isComingSoon, isBeta }) => (
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
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isCollapsed ? 'justify-center' : 'justify-start',
                          isActive 
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-gray-300 dark:hover:text-white'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={clsx(
                            "h-5 w-5", 
                            !isCollapsed && "mr-3",
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-muted-foreground dark:text-gray-300"
                          )} />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between flex-1">
                              <span className={isActive 
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-muted-foreground dark:text-gray-300"
                              }>
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
                ))}
              </motion.div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="relative group" ref={userMenuRef}>
            <button
              className={clsx(
                "flex items-center space-x-3 w-full p-2 rounded-lg",
                "hover:bg-primary-50 dark:hover:bg-primary-900/10",
                "transition-all duration-200 ease-in-out",
                "group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10"
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-full",
                "bg-gradient-to-br from-primary/20 to-primary/10",
                "flex items-center justify-center",
                "ring-1 ring-primary/20",
                "transition-all duration-200 ease-in-out",
                "group-hover:scale-105",
                "group-hover:ring-primary/30",
                "group-hover:from-primary/30 group-hover:to-primary/20"
              )}>
                <User className={clsx(
                  "h-4 w-4 text-primary-600 dark:text-primary-400",
                  "transition-transform duration-200 ease-in-out",
                  "group-hover:scale-110"
                )} />
              </div>
              {!isCollapsed && (
                <span className={clsx(
                  "text-sm font-medium text-foreground dark:text-dark-text",
                  "transition-colors duration-200",
                  "group-hover:text-primary-700 dark:group-hover:text-primary-300"
                )}>
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profile'}
                </span>
              )}
            </button>

            <motion.div
              initial={false}
              animate={{ 
                opacity: 1,
                height: "auto",
                y: 0,
                scale: 1,
              }}
              transition={{ 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className={clsx(
                "absolute bottom-full mb-2 w-full",
                "bg-card dark:bg-dark-paper rounded-lg",
                "border border-border dark:border-dark-border",
                "shadow-lg shadow-black/10 dark:shadow-black/20",
                "backdrop-blur-sm",
                "overflow-hidden origin-bottom",
                "opacity-0 scale-95 -translate-y-2",
                "transition-all duration-200 ease-in-out",
                "group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0",
                "invisible group-hover:visible"
              )}
            >
              <div className="p-1.5 space-y-0.5">
                {/* Profile section */}
                <div className="px-2 py-1.5 mb-1">
                  <div className="text-sm font-medium text-foreground dark:text-dark-text">
                    {user?.email}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground dark:text-dark-muted">
                      Advanced Trader
                    </span>
                    <span className={clsx(
                      "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                      "bg-primary-50 dark:bg-primary-900/20",
                      "text-primary-700 dark:text-primary-300"
                    )}>
                      Level 3
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-border dark:bg-dark-border my-1" />

                {/* Menu items */}
                <button
                  onClick={handleSettingsClick}
                  className="flex items-center space-x-2 w-full p-2 text-sm rounded-md
                             text-muted-foreground hover:text-foreground
                             hover:bg-primary-50 dark:hover:bg-primary-900/10 
                             transition-colors duration-150"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                
                <DarkModeToggle 
                  showLabel
                  className="w-full justify-start hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-md"
                />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full p-2 text-sm rounded-md
                             text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-900/10 
                             hover:text-red-700 dark:hover:text-red-300
                             transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <div 
        className={clsx(
          "fixed top-1/2 transform -translate-y-1/2",
          isCollapsed ? "left-[68px]" : "left-[238px]",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <button
          onClick={toggleCollapse}
          className={clsx(
            "w-8 h-8 rounded-full border border-border",
            "flex items-center justify-center",
            "bg-background text-muted-foreground hover:text-foreground",
            "transition-colors duration-200",
            "shadow-sm hover:shadow-md z-50"
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