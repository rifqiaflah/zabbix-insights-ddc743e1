import { Activity, Database, Zap } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <header className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold uppercase tracking-wider">
                Server Monitor
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time Infrastructure Monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="w-4 h-4 text-accent" />
            <span>Elasticsearch</span>
            <div className="w-2 h-2 rounded-full bg-primary pulse-green" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-4 h-4 text-warning" />
            <span>Zabbix API</span>
            <div className="w-2 h-2 rounded-full bg-primary pulse-green" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
