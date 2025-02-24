import React, { useEffect, useState } from "react";
import { Card, Title, BarChart, DonutChart } from "@tremor/react";
import {
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import { ErrorTrackingService } from "../../lib/services/errorTracking";
import { format } from "date-fns";

interface ErrorStats {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface ErrorLog {
  id: string;
  message: string;
  component_name: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

const ErrorMonitoring: React.FC = () => {
  const [errorStats, setErrorStats] = useState<ErrorStats>({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  });
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchErrorData = async () => {
      try {
        const errorService = new ErrorTrackingService();
        const stats = await errorService.getErrorStats();
        const logs = await errorService.getRecentErrors();

        setErrorStats(stats);
        setRecentErrors(logs);
      } catch (error) {
        console.error("Failed to fetch error data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchErrorData();
    const interval = setInterval(fetchErrorData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: "Critical", value: errorStats.critical },
    { name: "High", value: errorStats.high },
    { name: "Medium", value: errorStats.medium },
    { name: "Low", value: errorStats.low },
  ];

  const severityColors = {
    critical: "rose",
    high: "orange",
    medium: "yellow",
    low: "green",
  } as const;

  return (
    <div className="space-y-6 p-4">
      <Title>Error Monitoring Dashboard</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Error Distribution by Severity</Title>
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            valueFormatter={(value: number) => value.toString()}
            colors={["rose", "orange", "yellow", "green"]}
          />
        </Card>

        <Card>
          <Title>Error Trend (Last 24 Hours)</Title>
          <BarChart
            data={chartData}
            index="name"
            categories={["value"]}
            colors={["blue"]}
          />
        </Card>
      </div>

      <Card>
        <Title>Recent Errors</Title>
        <Table>
          <TableHead>
            <TableHeaderCell>Time</TableHeaderCell>
            <TableHeaderCell>Severity</TableHeaderCell>
            <TableHeaderCell>Component</TableHeaderCell>
            <TableHeaderCell>Message</TableHeaderCell>
          </TableHead>
          <TableBody>
            {recentErrors.map((error) => (
              <TableRow key={error.id}>
                <TableCell>
                  {format(new Date(error.timestamp), "MMM d, HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${severityColors[error.severity]}-100 text-${severityColors[error.severity]}-800`}
                  >
                    {error.severity.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{error.component_name}</TableCell>
                <TableCell>{error.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ErrorMonitoring;
