"use client";

import { useQuery } from '@tanstack/react-query';
import { getSentimentDistribution, getSentimentOverTime } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';

interface TabProps {
  searchGroup: string;
  days: number;
}

// Componente de Carregamento
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-40">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Componente de Erro
const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Erro</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

// Gráfico de Distribuição de Sentimento (Donut)
const SentimentDistributionChart = ({ searchGroup, days }: TabProps) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sentimentDistribution', searchGroup, days],
        queryFn: () => getSentimentDistribution(searchGroup, days),
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorAlert message={error.message} />;

    const chartData = data?.distribution.map(item => ({
        name: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
        value: item.count,
    }));

    const COLORS = {
        'Positivo': '#22c55e', // green-500
        'Negativo': '#ef4444', // red-500
        'Neutro': '#a1a1aa',   // zinc-400
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribuição de Sentimento</CardTitle>
                <CardDescription>Proporção de menções Positivas, Negativas e Neutras.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
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

// Gráfico de Evolução do Sentimento
const SentimentEvolutionChart = ({ searchGroup, days }: TabProps) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sentimentOverTime', searchGroup, days],
        queryFn: () => getSentimentOverTime(searchGroup, days),
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorAlert message={error.message} />;

    const chartData = data?.over_time_data.map(item => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Positivo: item.sentiments.positive,
        Negativo: item.sentiments.negative,
        Neutro: item.sentiments.neutral,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Evolução do Sentimento no Tempo</CardTitle>
                <CardDescription>Volume diário de menções por tipo de sentimento.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Positivo" stackId="1" stroke="#22c55e" fill="#22c55e" />
                        <Area type="monotone" dataKey="Negativo" stackId="1" stroke="#ef4444" fill="#ef4444" />
                        <Area type="monotone" dataKey="Neutro" stackId="1" stroke="#a1a1aa" fill="#a1a1aa" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};


export default function TabAnaliseSentimento({ searchGroup, days }: TabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <SentimentDistributionChart searchGroup={searchGroup} days={days} />
      <SentimentEvolutionChart searchGroup={searchGroup} days={days} />
    </div>
  );
}
