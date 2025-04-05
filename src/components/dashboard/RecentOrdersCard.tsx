import { useMemo } from "react";
import { BrokerCard } from "./BrokerCard";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { formatCurrency } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RecentOrdersCardProps {
  accountId: string;
}

export function RecentOrdersCard({ accountId }: RecentOrdersCardProps) {
  const { orders, error } = useBrokerDataStore();
  const accountOrders = orders[accountId] || [];

  // Sort orders by date (most recent first) and take the top 5
  const recentOrders = useMemo(() => {
    return [...accountOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [accountOrders]);

  // Get badge color based on order status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "FILLED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Get badge color based on order action
  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "BUY":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "SELL":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <BrokerCard
      title="Recent Orders"
      description={`${accountOrders.length} total orders`}
      accountId={accountId}
      error={error}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Action</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-left">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.symbol}</TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getActionBadgeColor(order.action)}>
                      {order.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </BrokerCard>
  );
} 