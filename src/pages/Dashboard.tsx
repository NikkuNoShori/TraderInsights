import React from 'react';
import type { Trade } from '../types/trade';
import { PageHeader } from '../components/ui/PageHeader';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { PlaybookCard } from '../components/dashboard/PlaybookCard';
import { RecentTradesCard } from '../components/dashboard/RecentTradesCard';
import { useSupabase } from '../contexts/SupabaseContext';
import { useTrades } from '../hooks/useTrades';
import { Spinner } from '../components/ui/Spinner';

interface DashboardError extends Error {
  message: string;
}

export default function Dashboard() {
  const { user } = useSupabase();
  const { data: trades = [], isLoading, error } = useTrades(user?.id);  

  if (isLoading) {
    return (
      <div className="flex-grow bg-background dark:bg-dark-bg">
        <WelcomeSection />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">       
            <Spinner size="lg" className="text-primary dark:text-primary-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="flex-grow bg-background dark:bg-dark-bg">
        <WelcomeSection />
        <div className="container mx-auto px-6 py-8">
          <div className="mt-6 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-background dark:bg-dark-bg">
      <WelcomeSection />
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          <section className="grid gap-6">
            <DashboardCards trades={trades} />
          </section>
        </div>
      </div>
    </div>
  );
}