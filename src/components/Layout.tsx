import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  // Define navigation items
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/webull-test', label: 'WebUll Test' },
    { href: '/snaptrade', label: 'SnapTrade' },
    { href: '/snaptrade-test', label: 'SnapTrade Test' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Trader Insights
              </Link>
            </div>
            
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} Trader Insights. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 