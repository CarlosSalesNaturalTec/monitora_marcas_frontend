// src/components/analytics/SentimentOverTimeChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SentimentOverTime } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: SentimentOverTime[];
  isLoading: boolean;
  isError: boolean;
}

const SentimentOverTimeChart = ({ data, isLoading, isError }: Props) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading data.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentimento ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="positive" stroke="#10B981" name="Positivo" />
            <Line type="monotone" dataKey="negative" stroke="#EF4444" name="Negativo" />
            <Line type="monotone" dataKey="neutral" stroke="#6B7280" name="Neutro" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentOverTimeChart;
