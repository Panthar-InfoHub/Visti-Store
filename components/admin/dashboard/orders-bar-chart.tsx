"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ordersData = [
  { day: "Mon", orders: 45 },
  { day: "Tue", orders: 52 },
  { day: "Wed", orders: 38 },
  { day: "Thu", orders: 65 },
  { day: "Fri", orders: 72 },
  { day: "Sat", orders: 58 },
  { day: "Sun", orders: 43 },
]

export function OrdersBarChart() {
  const totalOrders = ordersData.reduce((sum, item) => sum + item.orders, 0)
  const avgOrders = (totalOrders / ordersData.length).toFixed(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Orders</CardTitle>
        <CardDescription>
          {totalOrders} orders this week • Avg {avgOrders}/day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
