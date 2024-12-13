import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProfileSettings } from './ProfileSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { NotificationSettings } from './NotificationSettings';
import clsx from 'clsx';

export function Settings() {
  const location = useLocation();
  const path = location.pathname.split('/').pop();

  const renderContent = () => {
    switch (path) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  
  return (
    <div className="flex-grow p-6 bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Settings"
          subtitle="Manage your account and preferences"
          className="mb-6"
        />
        
        <div className="flex gap-8">
          {/* Left sidebar with nav */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <NavLink 
                to="/settings/profile" 
                className={({ isActive }) => clsx(
                  "block px-4 py-2 text-sm rounded",
                  "transition-colors duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary dark:bg-primary-900/20 dark:text-primary-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Profile
              </NavLink>
              <NavLink 
                to="/settings/appearance" 
                className={({ isActive }) => clsx(
                  "block px-4 py-2 text-sm rounded",
                  "transition-colors duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary dark:bg-primary-900/20 dark:text-primary-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Appearance
              </NavLink>
              <NavLink 
                to="/settings/notifications" 
                className={({ isActive }) => clsx(
                  "block px-4 py-2 text-sm rounded",
                  "transition-colors duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary dark:bg-primary-900/20 dark:text-primary-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Notifications
              </NavLink>
            </nav>
          </div>

          {/* Right content area */}
          <div className="flex-1">
            <div className="bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 