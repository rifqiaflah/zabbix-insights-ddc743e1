import DashboardHeader from '@/components/monitoring/DashboardHeader';
import RealtimeClock from '@/components/monitoring/RealtimeClock';
import ServerStatusCard from '@/components/monitoring/ServerStatusCard';
import UptimeBar from '@/components/monitoring/UptimeBar';
import ZabbixProblemsPanel from '@/components/monitoring/ZabbixProblemsPanel';
import ElasticLogsPanel from '@/components/monitoring/ElasticLogsPanel';
import SecurityChart from '@/components/monitoring/SecurityChart';
import SecurityStatsCards from '@/components/monitoring/SecurityStatsCards';
import HostTable from '@/components/monitoring/HostTable';
import { useZabbixData } from '@/hooks/useZabbixData';
import {
  mockServerStatus,
  mockZabbixHosts,
  mockZabbixProblems,
  mockElasticLogs,
  mockSecurityStats,
  mockHourlySecurityData,
} from '@/data/mockData';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { 
    serverStatus, 
    hosts, 
    problems, 
    loading, 
    error, 
    lastUpdate,
    refetch 
  } = useZabbixData(30000);

  // Use real data if available, fallback to mock data
  const displayServerStatus = serverStatus || mockServerStatus;
  const displayHosts = hosts.length > 0 ? hosts : mockZabbixHosts;
  const displayProblems = problems.length > 0 ? problems : mockZabbixProblems;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1800px] mx-auto">
        <DashboardHeader />

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Zabbix Error: {error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        )}

        {/* Last Update Info */}
        {lastUpdate && !error && (
          <div className="mb-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Last update: {new Date(lastUpdate).toLocaleTimeString()}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refetch}
              disabled={loading}
              className="h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {/* Top Row: Clock + Server Status + Uptime */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <RealtimeClock />
          </div>
          <div className="lg:col-span-2">
            <ServerStatusCard status={displayServerStatus} />
          </div>
          <div className="lg:col-span-1">
            <UptimeBar percentage={displayServerStatus.uptimePercentage} />
          </div>
        </div>

        {/* Security Stats */}
        <div className="mb-6">
          <SecurityStatsCards stats={mockSecurityStats} />
        </div>

        {/* Middle Row: Problems + Logs + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="h-[350px]">
            <ZabbixProblemsPanel problems={displayProblems} />
          </div>
          <div className="h-[350px]">
            <ElasticLogsPanel logs={mockElasticLogs} />
          </div>
          <div className="h-[350px]">
            <SecurityChart data={mockHourlySecurityData} />
          </div>
        </div>

        {/* Bottom Row: Host Table */}
        <div>
          <HostTable hosts={displayHosts} />
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-muted-foreground">
          <p>Server Monitor Dashboard • Data from Zabbix API & Elasticsearch</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
