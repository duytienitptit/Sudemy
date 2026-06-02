import { useTheme } from '@/contexts/ThemeContext'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const strokeColor = isDark ? '#4ade80' : '#16a34a' // Green variations
  const gridColor = isDark ? '#334155' : '#e2e8f0' // Slate 700 / Slate 200
  const textColor = isDark ? '#94a3b8' : '#64748b' // Slate 400 / Slate 500

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
              if (value >= 1_000) return `${Math.round(value / 1_000)}K`
              return `${value}`
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '8px',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}
            itemStyle={{ color: strokeColor }}
            formatter={(value: number) => [
              new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
              'Doanh thu',
            ]}
            labelStyle={{ color: textColor, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke={strokeColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
