'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: number // -1 to 1, where 1 is positive trend
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ title, value, trend, subtitle, icon, className }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null
    if (trend > 0.1) return <TrendingUp className="w-3 h-3 text-slime" />
    if (trend < -0.1) return <TrendingDown className="w-3 h-3 text-haunt" />
    return <Minus className="w-3 h-3 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (trend === undefined) return 'text-muted-foreground'
    if (trend > 0.1) return 'text-slime'
    if (trend < -0.1) return 'text-haunt'
    return 'text-muted-foreground'
  }

  return (
    <motion.div
      className={cn(
        'ghost-card p-4 hover:shadow-lg transition-all duration-200',
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl font-bold text-foreground">
          {value}
        </span>
        {getTrendIcon()}
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      )}

      {trend !== undefined && (
        <div className={cn('text-xs font-medium', getTrendColor())}>
          {trend > 0.1 && '+'}
          {Math.round(trend * 100)}% vs last week
        </div>
      )}
    </motion.div>
  )
}
