import { Server, ArrowUp, ArrowDown } from 'lucide-react';
import { ServerStatus } from '@/types/monitoring';

interface ServerStatusCardProps {
  status: ServerStatus;
}

const ServerStatusCard = ({ status }: ServerStatusCardProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Servers */}
      <div className="glass-card p-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Server className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Total Servers</span>
        </div>
        <div className="font-display text-4xl font-bold text-foreground">
          {status.total}
        </div>
      </div>

      {/* Servers Up */}
      <div className="glass-card p-4 flex flex-col items-center justify-center border-primary/30 neon-border-green">
        <div className="flex items-center gap-2 text-primary mb-2">
          <ArrowUp className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Up</span>
        </div>
        <div className="font-display text-4xl font-bold text-primary neon-text-green">
          {status.up}
        </div>
        <div className="w-2 h-2 rounded-full bg-primary mt-2 pulse-green" />
      </div>

      {/* Servers Down */}
      <div className="glass-card p-4 flex flex-col items-center justify-center border-destructive/30 neon-border-red">
        <div className="flex items-center gap-2 text-destructive mb-2">
          <ArrowDown className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Down</span>
        </div>
        <div className="font-display text-4xl font-bold text-destructive neon-text-red">
          {status.down}
        </div>
        {status.down > 0 && (
          <div className="w-2 h-2 rounded-full bg-destructive mt-2 pulse-red" />
        )}
      </div>
    </div>
  );
};

export default ServerStatusCard;
