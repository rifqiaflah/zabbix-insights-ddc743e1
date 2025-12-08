import DashboardHeader from '@/components/monitoring/DashboardHeader';
import RealtimeClock from '@/components/monitoring/RealtimeClock';
import ServerStatusCard from '@/components/monitoring/ServerStatusCard';
import UptimeBar from '@/components/monitoring/UptimeBar';
import ZabbixProblemsPanel from '@/components/monitoring/ZabbixProblemsPanel';
import ElasticLogsPanel from '@/components/monitoring/ElasticLogsPanel';
import SecurityChart from '@/components/monitoring/SecurityChart';
import SecurityStatsCards from '@/components/monitoring/SecurityStatsCards';
import HostTable from '@/components/monitoring/HostTable';
import {
  mockServerStatus,
  mockZabbixHosts,
  mockZabbixProblems,
  mockElasticLogs,
  mockSecurityStats,
  mockHourlySecurityData,
} from '@/data/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1800px] mx-auto">
        <DashboardHeader />

        {/* Top Row: Clock + Server Status + Uptime */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <RealtimeClock />
          </div>
          <div className="lg:col-span-2">
            <ServerStatusCard status={mockServerStatus} />
          </div>
          <div className="lg:col-span-1">
            <UptimeBar percentage={mockServerStatus.uptimePercentage} />
          </div>
        </div>

        {/* Security Stats */}
        <div className="mb-6">
          <SecurityStatsCards stats={mockSecurityStats} />
        </div>

        {/* Middle Row: Problems + Logs + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="h-[350px]">
            <ZabbixProblemsPanel problems={mockZabbixProblems} />
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
          <HostTable hosts={mockZabbixHosts} />
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
