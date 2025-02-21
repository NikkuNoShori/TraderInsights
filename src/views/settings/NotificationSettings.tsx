import React from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { clsx } from 'clsx';

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

const notificationSettings: NotificationSetting[] = [
  {
    id: 'trade_alerts',
    label: 'Trade Alerts',
    description: 'Get notified when your trade orders are executed',
    defaultEnabled: true,
  },
  {
    id: 'price_alerts',
    label: 'Price Alerts',
    description: 'Receive alerts when prices hit your targets',
    defaultEnabled: true,
  },
  {
    id: 'news_alerts',
    label: 'News Alerts',
    description: 'Stay informed about market news and events',
    defaultEnabled: false,
  },
  {
    id: 'portfolio_updates',
    label: 'Portfolio Updates',
    description: 'Daily summary of your portfolio performance',
    defaultEnabled: true,
  },
];

export function NotificationSettings() {
  const { user } = useSupabase();
  const [settings, setSettings] = React.useState<Record<string, boolean>>(() => {
    const savedSettings = localStorage.getItem(`notification_settings_${user?.id}`);
    return savedSettings ? JSON.parse(savedSettings) : 
      notificationSettings.reduce((acc, setting) => ({
        ...acc,
        [setting.id]: setting.defaultEnabled
      }), {});
  });

  const toggleSetting = (id: string) => {
    setSettings(prev => {
      const newSettings = { ...prev, [id]: !prev[id] };
      localStorage.setItem(`notification_settings_${user?.id}`, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Notification Preferences
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Choose what updates you want to receive
      </p>

      <div className="mt-6">
        <div className="space-y-6">
          {notificationSettings.map(({ id, label, description }) => (
            <div key={id} className="flex items-start">
              <div className="flex items-center h-6">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings[id]}
                  onClick={() => toggleSetting(id)}
                  className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    settings[id] ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <span className="sr-only">{label}</span>
                  <span
                    className={clsx(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      settings[id] ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 