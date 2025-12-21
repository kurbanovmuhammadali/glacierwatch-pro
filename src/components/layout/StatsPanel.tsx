import React from 'react';
import { TrendingDown, Thermometer, Droplets, AlertTriangle } from 'lucide-react';
import { tajikistanGlaciers } from '@/data/glaciers';

const StatsPanel: React.FC = () => {
  const totalArea = tajikistanGlaciers.reduce((sum, g) => sum + g.area, 0);
  const totalVolume = tajikistanGlaciers.reduce((sum, g) => sum + g.volume, 0);
  const criticalCount = tajikistanGlaciers.filter(g => g.status === 'critical').length;
  const avgMeltRate = tajikistanGlaciers.reduce((sum, g) => sum + g.meltRate, 0) / tajikistanGlaciers.length;

  const stats = [
    {
      label: 'Общая площадь',
      value: `${totalArea.toLocaleString()}`,
      unit: 'км²',
      icon: TrendingDown,
      color: 'text-primary',
    },
    {
      label: 'Объём льда',
      value: `${totalVolume.toFixed(1)}`,
      unit: 'км³',
      icon: Droplets,
      color: 'text-glacier-melt',
    },
    {
      label: 'Ср. таяние',
      value: `${avgMeltRate.toFixed(1)}`,
      unit: 'м/год',
      icon: Thermometer,
      color: 'text-warning',
    },
    {
      label: 'Критических',
      value: `${criticalCount}`,
      unit: 'ледников',
      icon: AlertTriangle,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center">
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap justify-center gap-4 md:gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-xl font-bold text-foreground data-readout">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.unit}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsPanel;
