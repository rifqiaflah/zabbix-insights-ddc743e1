import { FileText, Shield, Skull, Lock } from 'lucide-react';
import { ElasticLog } from '@/types/monitoring';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ElasticLogsPanelProps {
  logs: ElasticLog[];
}

const ElasticLogsPanel = ({ logs }: ElasticLogsPanelProps) => {
  const getTypeConfig = (type: ElasticLog['type']) => {
    switch (type) {
      case 'bruteforce':
        return { 
          icon: Skull, 
          bgClass: 'bg-destructive/10', 
          textClass: 'text-destructive',
          label: 'BRUTE FORCE'
        };
      case 'ddos':
        return { 
          icon: Shield, 
          bgClass: 'bg-neon-purple/10', 
          textClass: 'text-neon-purple',
          label: 'DDoS'
        };
      case 'auth_failure':
        return { 
          icon: Lock, 
          bgClass: 'bg-warning/10', 
          textClass: 'text-warning',
          label: 'AUTH FAIL'
        };
      default:
        return { 
          icon: FileText, 
          bgClass: 'bg-muted', 
          textClass: 'text-muted-foreground',
          label: 'INFO'
        };
    }
  };

  const getSeverityDot = (severity: ElasticLog['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-destructive pulse-red';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-accent';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-accent" />
        <h3 className="font-display text-lg font-semibold uppercase tracking-wider">
          Elastic Security Logs
        </h3>
        <span className="ml-auto bg-accent/20 text-accent text-xs px-2 py-1 rounded-full font-semibold">
          Live
        </span>
      </div>

      <ScrollArea className="flex-1 scrollbar-custom">
        <div className="space-y-1 pr-2 font-mono text-xs">
          {logs.map((log, index) => {
            const config = getTypeConfig(log.type);
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className={`${config.bgClass} rounded p-2 border border-border/20 animate-fade-in-up hover:bg-secondary/50 transition-colors`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getSeverityDot(log.severity)}`} />
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className={`${config.textClass} font-bold flex items-center gap-1`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <span className="text-accent ml-auto">{log.source}</span>
                </div>
                <div className="text-foreground/80 pl-4 truncate">
                  {log.message}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ElasticLogsPanel;
