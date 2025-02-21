import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Palette, Bell, Shield } from 'lucide-react';
import { clsx } from 'clsx';

const settingsLinks = [
  {
    to: '/settings/profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your personal information'
  },
  {
    to: '/settings/security',
    label: 'Security',
    icon: Shield,
    description: 'Update password and security settings'
  },
  {
    to: '/settings/appearance',
    label: 'Appearance',
    icon: Palette,
    description: 'Customize your interface'
  },
  {
    to: '/settings/notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Configure your notifications'
  }
];

export function SettingsNav() {
  return (
    <nav className="space-y-1">
      {settingsLinks.map(({ to, label, icon: Icon, description }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex items-center px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )
          }
        >
          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {description}
            </div>
          </div>
        </NavLink>
      ))}
    </nav>
  );
} 