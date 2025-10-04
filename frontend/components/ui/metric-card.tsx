'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number; // Positive = up, negative = down, 0 = neutral
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, subtitle, icon, className }: MetricCardProps) {
  const getTrendIcon = (trend?: number) => {
    if (trend === undefined || trend === 0) return <Minus className="w-3 h-3" />;
    return trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = (trend?: number) => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground';
    return trend > 0 ? 'text-red-400' : 'text-green-400';
  };

  return (
    <motion.div
      className={cn('ghost-card p-4', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold">{value}</span>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1', getTrendColor(trend))}>
            {getTrendIcon(trend)}
            <span className="text-xs font-medium">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}
