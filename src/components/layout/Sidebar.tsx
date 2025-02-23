import { Logo } from '../ui/Logo';
import { MainNav } from '../navigation/MainNav';
import { UserMenu } from './UserMenu';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-white dark:bg-dark-paper shadow-lg flex flex-col">
      {/* Header */}
      <div className="h-16 px-4 border-b dark:border-gray-700 flex items-center justify-between">
        <Logo />
        <button 
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <MainNav isCollapsed={false} />
      </div>

      {/* User Menu */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <UserMenu />
      </div>
    </aside>
  );
} 