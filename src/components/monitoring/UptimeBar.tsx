import { TrendingUp } from 'lucide-react';

interface UptimeBarProps {
  percentage: number;
}

const UptimeBar = ({ percentage }: UptimeBarProps) => {
  const getColorClass = (pct: number) => {
    if (pct >= 99) return 'bg-primary';
    if (pct >= 95) return 'bg-neon-blue';
    if (pct >= 90) return 'bg-warning';
    return 'bg-destructive';
  };

  const getTextColorClass = (pct: number) => {
    if (pct >= 99) return 'text-primary neon-text-green';
    if (pct >= 95) return 'text-accent neon-text-blue';
    if (pct >= 90) return 'text-warning';
    return 'text-destructive neon-text-red';
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Uptime Hari Ini</span>
        </div>
        <div className={`font-display text-2xl font-bold ${getTextColorClass(percentage)}`}>
          {percentage.toFixed(2)}%
        </div>
      </div>
      
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full ${getColorClass(percentage)} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>0%</span>
        <span>Target: 99.9%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default UptimeBar;
