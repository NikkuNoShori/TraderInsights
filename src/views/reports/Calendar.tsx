import { PageHeader } from '../../components/ui/PageHeader';
import { ReportingNav } from '../../components/navigation/ReportingNav';

export default function Calendar() {
  return (
    <div className="flex-grow p-4">
      <PageHeader 
        title="Trading Calendar"
        subtitle="View your trading activity over time"
      />
      <ReportingNav />
      <div className="mt-6 bg-white dark:bg-dark-paper rounded-lg shadow p-6">
        <div className="grid gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Activity Calendar</h2>
            {/* Calendar controls will go here */}
          </div>
          {/* Calendar view will go here */}
        </div>
      </div>
    </div>
  );
} 