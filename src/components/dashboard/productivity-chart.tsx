// ═══════════════════════════════════════════════════════════
// Productivity Chart Component
// Visualizing tasks created vs. completed using Recharts
// ═══════════════════════════════════════════════════════════

"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyProductivity } from "@/actions/dashboard.actions";

interface ProductivityChartProps {
  data: DailyProductivity[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <Card className="border-border/40 bg-card/45 backdrop-blur-md">
      <CardHeader className="flex flex-col items-start justify-between gap-2 space-y-0 pb-6 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
            Productivity Velocity
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80 font-medium mt-1">
            Weekly velocity of tasks created vs. resolved in this workspace
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: -15,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              
              <XAxis
                dataKey="date"
                stroke="currentColor"
                className="text-[10px] text-muted-foreground/60 font-semibold"
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              
              <YAxis
                stroke="currentColor"
                className="text-[10px] text-muted-foreground/60 font-semibold"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                dx={-10}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
              />
              
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "11px",
                  fontWeight: "600",
                  paddingBottom: "10px",
                }}
              />
              
              <Area
                name="Tasks Completed"
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCompleted)"
              />
              
              <Area
                name="Tasks Created"
                type="monotone"
                dataKey="created"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCreated)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
