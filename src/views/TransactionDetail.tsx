import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui";
import type { Transaction } from "@/types/transaction";

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: transaction, isLoading } = useQuery<Transaction>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Transaction Details"
        subtitle={`Transaction ID: ${transaction.id}`}
      />

      <div className="mt-6 bg-card p-6 rounded-lg border border-border">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Symbol
            </dt>
            <dd className="mt-1 text-lg">{transaction.symbol}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Type</dt>
            <dd className="mt-1 text-lg">{transaction.type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Side</dt>
            <dd className="mt-1 text-lg">{transaction.side}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1 text-lg">{transaction.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
