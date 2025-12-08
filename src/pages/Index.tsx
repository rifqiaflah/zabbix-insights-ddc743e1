import DashboardHeader from '@/components/monitoring/DashboardHeader';
import RealtimeClock from '@/components/monitoring/RealtimeClock';
import ServerStatusCard from '@/components/monitoring/ServerStatusCard';
import UptimeBar from '@/components/monitoring/UptimeBar';
import ZabbixProblemsPanel from '@/components/monitoring/ZabbixProblemsPanel';
import ElasticLogsPanel from '@/components/monitoring/ElasticLogsPanel';
import SecurityChart from '@/components/monitoring/SecurityChart';
import SecurityStatsCards from '@/components/monitoring/SecurityStatsCards';
import HostTable from '@/components/monitoring/HostTable';
import { useZabbixHosts, useZabbixProblems, useServerStatus } from '@/hooks/useZabbixData';
import { useSecurityLogs, useSecurityStats, useHourlySecurityData } from '@/hooks/useElasticsearchData';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: hosts, isLoading: hostsLoading, error: hostsError } = useZabbixHosts();
  const { data: problems, isLoading: problemsLoading } = useZabbixProblems();
  const { data: serverStatus, isLoading: statusLoading } = useServerStatus();
  const { data: securityLogs, isLoading: logsLoading } = useSecurityLogs();
  const { data: securityStats, isLoading: statsLoading } = useSecurityStats();
  const { data: hourlyData, isLoading: hourlyLoading } = useHourlySecurityData();

  const defaultServerStatus = { total: 0, up: 0, down: 0, uptimePercentage: 0 };
  const defaultSecurityStats = { bruteforce: 0, ddos: 0, authFailure: 0, total: 0 };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1800px] mx-auto">
        <DashboardHeader />

        {/* Connection Error Banner */}
        {hostsError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            ⚠️ Gagal terhubung ke Zabbix API: {hostsError.message}
          </div>
        )}

        {/* Top Row: Clock + Server Status + Uptime */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <RealtimeClock />
          </div>
          <div className="lg:col-span-2">
            {statusLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ServerStatusCard status={serverStatus || defaultServerStatus} />
            )}
          </div>
          <div className="lg:col-span-1">
            <UptimeBar percentage={serverStatus?.uptimePercentage || 0} />
          </div>
        </div>

        {/* Security Stats */}
        <div className="mb-6">
          {statsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <SecurityStatsCards stats={securityStats || defaultSecurityStats} />
          )}
        </div>

        {/* Middle Row: Problems + Logs + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="h-[350px]">
            {problemsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ZabbixProblemsPanel problems={problems || []} />
            )}
          </div>
          <div className="h-[350px]">
            {logsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ElasticLogsPanel logs={securityLogs || []} />
            )}
          </div>
          <div className="h-[350px]">
            {hourlyLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <SecurityChart data={hourlyData || []} />
            )}
          </div>
        </div>

        {/* Bottom Row: Host Table */}
        <div>
          {hostsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <HostTable hosts={hosts || []} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-muted-foreground">
          <p>Server Monitor Dashboard • Live Data from Zabbix API & Elasticsearch</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
