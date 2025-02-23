import { useState, useEffect } from '@/lib/react';
import { PageHeader } from '../components/ui/PageHeader';
import { Construction } from 'lucide-react';
import { PageLoading } from '../components/ui/PageLoading';
import { PagePlaceholder } from '../components/ui/PagePlaceholder';

export default function Portfolios() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoading title="Portfolios" subtitle="Manage your trading portfolios" />;
  }

  return (
    <div className="flex-grow p-6">
      <PageHeader 
        title="Portfolios"
        subtitle="Manage your trading portfolios"
      />
      <PagePlaceholder 
        title="Coming Soon"
        description="Portfolio management features are currently under development. Check back soon!"
        icon={Construction}
      />
    </div>
  );
} 