import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield } from 'lucide-react';

interface SecurityChartProps {
  data: Array<{
    hour: string;
    bruteforce: number;
    ddos: number;
    authFailure: number;
  }>;
}

const SecurityChart = ({ data }: SecurityChartProps) => {
  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold uppercase tracking-wider">
          Security Events (24h)
        </h3>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="hour" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
            <Bar 
              dataKey="bruteforce" 
              name="Brute Force" 
              fill="hsl(var(--destructive))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="ddos" 
              name="DDoS" 
              fill="hsl(var(--neon-purple))" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="authFailure" 
              name="Auth Failure" 
              fill="hsl(var(--warning))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SecurityChart;
