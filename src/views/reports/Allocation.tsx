import { PageHeader } from "../../components/ui/PageHeader";
import { ReportingNav } from "../../components/navigation/ReportingNav";

export default function Allocation() {
  return (
    <div className="flex-grow p-4">
      <PageHeader
        title="Portfolio Allocation"
        subtitle="View your portfolio distribution"
      />
      <ReportingNav />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Asset Allocation</h2>
          {/* Asset allocation chart will go here */}
        </div>
        <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Sector Distribution</h2>
          {/* Sector distribution chart will go here */}
        </div>
      </div>
    </div>
  );
}
