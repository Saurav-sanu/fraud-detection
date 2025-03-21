"use client"

import { useMemo } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/char"

export function FraudDistributionChart() {
  // Generate mock data for the pie chart
  const data = useMemo(() => {
    return [
      { name: "Legitimate", value: 9832, color: "#10b981" },
      { name: "Suspicious", value: 1893, color: "#eab308" },
      { name: "Confirmed Fraud", value: 818, color: "#ef4444" },
    ]
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-muted-foreground">
                      {payload[0].name}: {payload[0].value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% of
                      total
                    </span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => {
            return <span className="text-xs">{value}</span>
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

