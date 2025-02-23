import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/card';
import { StatsCard } from '../dashboard/StatsCard';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuthAttempt {
  id: string;
  ip_address: string;
  success: boolean;
  timestamp: string;
  created_at: string;
}

interface AuthStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  lockedOutIPs: number;
}

export function AuthMonitoring() {
  const { data: attempts = [], isLoading } = useQuery<AuthAttempt[]>({
    queryKey: ['auth-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auth_attempts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const stats: AuthStats = React.useMemo(() => {
    const now = new Date();
    const recentAttempts = attempts.filter(
      attempt => new Date(attempt.timestamp) > new Date(now.getTime() - 60 * 60 * 1000)
    );

    const ipAttempts = recentAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.ip_address]) {
        acc[attempt.ip_address] = [];
      }
      acc[attempt.ip_address].push(attempt);
      return acc;
    }, {} as Record<string, AuthAttempt[]>);

    const lockedOutIPs = Object.values(ipAttempts).filter(
      attempts => attempts.filter(a => !a.success).length >= 5
    ).length;

    return {
      totalAttempts: recentAttempts.length,
      successfulAttempts: recentAttempts.filter(a => a.success).length,
      failedAttempts: recentAttempts.filter(a => !a.success).length,
      lockedOutIPs
    };
  }, [attempts]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Attempts"
          value={stats.totalAttempts.toString()}
          icon={Activity}
        />
        <StatsCard
          title="Successful Logins"
          value={stats.successfulAttempts.toString()}
          icon={CheckCircle}
          trend="up"
        />
        <StatsCard
          title="Failed Attempts"
          value={stats.failedAttempts.toString()}
          icon={XCircle}
          trend="down"
        />
        <StatsCard
          title="Locked IPs"
          value={stats.lockedOutIPs.toString()}
          icon={AlertTriangle}
          trend={stats.lockedOutIPs > 0 ? "down" : "up"}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Login Attempts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">IP Address</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(attempt => (
                <tr key={attempt.id} className="border-b">
                  <td className="py-2">
                    {formatDistanceToNow(new Date(attempt.timestamp), { addSuffix: true })}
                  </td>
                  <td className="py-2">{attempt.ip_address}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      attempt.success 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {attempt.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 