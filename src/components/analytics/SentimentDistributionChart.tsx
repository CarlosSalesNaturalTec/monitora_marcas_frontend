// src/components/analytics/SentimentDistributionChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SentimentDistribution } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: SentimentDistribution[];
  isLoading: boolean;
  isError: boolean;
}

const COLORS: { [key: string]: string } = {
  positive: '#10B981', // Green-500
  negative: '#EF4444', // Red-500
  neutral: '#6B7280',  // Gray-500
};

const SentimentDistributionChart = ({ data, isLoading, isError }: Props) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data.</div>;
  }

  const chartData = data.map(item => ({
    name: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
    value: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Sentimento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                if (midAngle === undefined || percent === undefined || cx === undefined || cy === undefined || innerRadius === undefined || outerRadius === undefined) {
                  return null;
                }
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
