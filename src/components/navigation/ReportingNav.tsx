import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, PieChart, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const reportLinks = [
  {
    to: '/reports/performance',
    label: 'Performance',
    icon: TrendingUp,
    description: 'Track your trading performance'
  },
  {
    to: '/reports/allocation',
    label: 'Allocation',
    icon: PieChart,
    description: 'View portfolio allocation'
  },
  {
    to: '/reports/calendar',
    label: 'Calendar',
    icon: Calendar,
    description: 'Trading activity calendar'
  }
];

export function ReportingNav() {
  return (
    <div className="bg-white dark:bg-dark-paper border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 -mb-px">
          {reportLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'group inline-flex items-center px-1 py-4 border-b-2 text-sm font-medium',
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
} 