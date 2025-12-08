import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react';
import { ZabbixProblem } from '@/types/monitoring';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ZabbixProblemsPanelProps {
  problems: ZabbixProblem[];
}

const ZabbixProblemsPanel = ({ problems }: ZabbixProblemsPanelProps) => {
  const getSeverityConfig = (severity: ZabbixProblem['severity']) => {
    switch (severity) {
      case 'disaster':
        return { 
          icon: XCircle, 
          bgClass: 'bg-destructive/20', 
          textClass: 'text-destructive',
          borderClass: 'border-l-destructive',
          label: 'DISASTER'
        };
      case 'high':
        return { 
          icon: AlertTriangle, 
          bgClass: 'bg-warning/20', 
          textClass: 'text-warning',
          borderClass: 'border-l-warning',
          label: 'HIGH'
        };
      case 'average':
        return { 
          icon: AlertCircle, 
          bgClass: 'bg-neon-orange/20', 
          textClass: 'text-neon-orange',
          borderClass: 'border-l-neon-orange',
          label: 'AVERAGE'
        };
      case 'warning':
        return { 
          icon: AlertCircle, 
          bgClass: 'bg-accent/20', 
          textClass: 'text-accent',
          borderClass: 'border-l-accent',
          label: 'WARNING'
        };
      default:
        return { 
          icon: Info, 
          bgClass: 'bg-muted', 
          textClass: 'text-muted-foreground',
          borderClass: 'border-l-muted-foreground',
          label: 'INFO'
        };
    }
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <h3 className="font-display text-lg font-semibold uppercase tracking-wider">
          Zabbix Problems
        </h3>
        <span className="ml-auto bg-destructive/20 text-destructive text-xs px-2 py-1 rounded-full font-semibold">
          {problems.filter(p => p.severity === 'disaster' || p.severity === 'high').length} Critical
        </span>
      </div>

      <ScrollArea className="flex-1 scrollbar-custom">
        <div className="space-y-2 pr-2">
          {problems.map((problem, index) => {
            const config = getSeverityConfig(problem.severity);
            const Icon = config.icon;

            return (
              <div
                key={problem.id}
                className={`${config.bgClass} border-l-4 ${config.borderClass} rounded-r-lg p-3 animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 ${config.textClass} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${config.textClass}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {problem.timestamp}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">
                      {problem.host}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {problem.message}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ZabbixProblemsPanel;
