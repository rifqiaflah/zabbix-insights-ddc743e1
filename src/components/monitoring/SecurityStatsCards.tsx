import { Skull, Shield, Lock, AlertTriangle } from 'lucide-react';
import { SecurityStats } from '@/types/monitoring';

interface SecurityStatsCardsProps {
  stats: SecurityStats;
}

const SecurityStatsCards = ({ stats }: SecurityStatsCardsProps) => {
  const cards = [
    {
      label: 'Brute Force',
      value: stats.bruteforce,
      icon: Skull,
      bgClass: 'bg-destructive/10',
      textClass: 'text-destructive',
      borderClass: 'border-destructive/30',
    },
    {
      label: 'DDoS Attacks',
      value: stats.ddos,
      icon: Shield,
      bgClass: 'bg-neon-purple/10',
      textClass: 'text-neon-purple',
      borderClass: 'border-neon-purple/30',
    },
    {
      label: 'Auth Failures',
      value: stats.authFailure,
      icon: Lock,
      bgClass: 'bg-warning/10',
      textClass: 'text-warning',
      borderClass: 'border-warning/30',
    },
    {
      label: 'Total Events',
      value: stats.total,
      icon: AlertTriangle,
      bgClass: 'bg-accent/10',
      textClass: 'text-accent',
      borderClass: 'border-accent/30',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.label}
            className={`glass-card p-4 ${card.bgClass} border ${card.borderClass} flex flex-col items-center justify-center animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Icon className={`w-6 h-6 ${card.textClass} mb-2`} />
            <div className={`font-display text-2xl font-bold ${card.textClass}`}>
              {card.value}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SecurityStatsCards;
