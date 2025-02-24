import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { useTrade } from "../hooks/useTrade";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export function TradeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trade, isLoading } = useTrade(id);

  if (isLoading) return <LoadingSpinner />;
  if (!trade) return <div>Trade not found</div>;

  return (
    <div className="p-6">
      <PageHeader
        title={`${trade.symbol} Trade Details`}
        subtitle={`${trade.side} trade on ${formatDate(trade.date)}`}
        actions={
          <button
            onClick={() => navigate("/journal")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </button>
        }
      />

      {/* Add detailed trade information here */}
    </div>
  );
}
