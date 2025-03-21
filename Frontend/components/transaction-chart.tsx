"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/char"

type TransactionChartProps = {
  timeRange: string
}

export function TransactionChart({ timeRange }: TransactionChartProps) {
  // Generate mock data based on the selected time range
  const data = useMemo(() => {
    const ranges = {
      "24h": 24,
      "7d": 7,
      "30d": 30,
      "90d": 12, // For 90 days, we'll use 12 data points (weeks)
    }

    const count = ranges[timeRange as keyof typeof ranges] || 7
    const format = timeRange === "24h" ? "hour" : timeRange === "90d" ? "week" : "day"

    return Array.from({ length: count }).map((_, i) => {
      const legitimate = Math.floor(Math.random() * 500) + 500
      const suspicious = Math.floor(Math.random() * 50) + 10
      const flagged = Math.floor(Math.random() * 20) + 5

      let label = ""
      if (format === "hour") {
        label = `${i}:00`
      } else if (format === "day") {
        label = `Day ${i + 1}`
      } else {
        label = `Week ${i + 1}`
      }

      return {
        name: label,
        legitimate,
        suspicious,
        flagged,
        total: legitimate + suspicious + flagged,
      }
    })
  }, [timeRange])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].payload.name}</span>
                      <span className="font-bold text-muted-foreground">Total: {payload[0].payload.total}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-[0.70rem] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Legitimate: {payload[0].payload.legitimate}
                      </span>
                      <span className="flex items-center gap-1 text-[0.70rem] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        Suspicious: {payload[0].payload.suspicious}
                      </span>
                      <span className="flex items-center gap-1 text-[0.70rem] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Flagged: {payload[0].payload.flagged}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => {
            return <span className="text-xs capitalize">{value}</span>
          }}
        />
        <Area type="monotone" dataKey="legitimate" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
        <Area type="monotone" dataKey="suspicious" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
        <Area type="monotone" dataKey="flagged" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

