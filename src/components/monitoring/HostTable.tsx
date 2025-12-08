import { Server, Cpu, MemoryStick, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { ZabbixHost } from '@/types/monitoring';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface HostTableProps {
  hosts: ZabbixHost[];
}

const formatBandwidth = (mbps: number): string => {
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(2)} Gbps`;
  }
  return `${mbps.toFixed(2)} Mbps`;
};

const getProgressColor = (value: number): string => {
  if (value >= 90) return 'bg-destructive';
  if (value >= 75) return 'bg-warning';
  if (value >= 50) return 'bg-accent';
  return 'bg-primary';
};

const HostTable = ({ hosts }: HostTableProps) => {
  return (
    <div className="glass-card p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold uppercase tracking-wider">
          Zabbix Hosts
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {hosts.length} hosts
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/30">
        <div className="grid grid-cols-7 gap-2 p-3 bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2">Host</div>
          <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</div>
          <div className="flex items-center gap-1"><MemoryStick className="w-3 h-3" /> RAM</div>
          <div className="flex items-center gap-1"><ArrowDownToLine className="w-3 h-3" /> BW In</div>
          <div className="flex items-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> BW Out</div>
          <div>Last Check</div>
        </div>

        <ScrollArea className="h-[300px] scrollbar-custom">
          {hosts.map((host, index) => (
            <div 
              key={host.id}
              className={`grid grid-cols-7 gap-2 p-3 text-sm border-b border-border/20 hover:bg-secondary/30 transition-colors animate-fade-in-up ${
                host.status === 'down' ? 'bg-destructive/5' : ''
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Host Name & IP */}
              <div className="col-span-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  host.status === 'up' ? 'bg-primary pulse-green' : 'bg-destructive pulse-red'
                }`} />
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{host.name}</div>
                  <div className="text-xs text-muted-foreground">{host.ip}</div>
                </div>
              </div>

              {/* CPU */}
              <div className="flex flex-col justify-center">
                {host.status === 'up' ? (
                  <>
                    <div className="text-xs text-muted-foreground mb-1">{host.cpu}%</div>
                    <Progress 
                      value={host.cpu} 
                      className="h-1.5"
                      indicatorClassName={getProgressColor(host.cpu)}
                    />
                  </>
                ) : (
                  <span className="text-destructive text-xs">N/A</span>
                )}
              </div>

              {/* RAM */}
              <div className="flex flex-col justify-center">
                {host.status === 'up' ? (
                  <>
                    <div className="text-xs text-muted-foreground mb-1">{host.ram}%</div>
                    <Progress 
                      value={host.ram} 
                      className="h-1.5"
                      indicatorClassName={getProgressColor(host.ram)}
                    />
                  </>
                ) : (
                  <span className="text-destructive text-xs">N/A</span>
                )}
              </div>

              {/* Bandwidth In */}
              <div className="flex items-center">
                {host.status === 'up' ? (
                  <span className="text-accent text-xs font-mono">
                    {formatBandwidth(host.bandwidthIn)}
                  </span>
                ) : (
                  <span className="text-destructive text-xs">N/A</span>
                )}
              </div>

              {/* Bandwidth Out */}
              <div className="flex items-center">
                {host.status === 'up' ? (
                  <span className="text-primary text-xs font-mono">
                    {formatBandwidth(host.bandwidthOut)}
                  </span>
                ) : (
                  <span className="text-destructive text-xs">N/A</span>
                )}
              </div>

              {/* Last Check */}
              <div className="flex items-center text-xs text-muted-foreground">
                {host.lastCheck}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default HostTable;
