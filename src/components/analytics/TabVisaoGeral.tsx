"use client";

import { useQuery } from '@tanstack/react-query';
import { getKpis, getCombinedView, getEntitiesCloud, getMentions } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

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

// Componente para os KPIs
const KpiCards = ({ searchGroup, days }: TabProps) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kpis', searchGroup, days],
    queryFn: () => getKpis(searchGroup, days),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorAlert message={error.message} />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Volume Total de Menções</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{data?.total_mentions.toLocaleString('pt-BR')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sentimento Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{data?.average_sentiment.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para o Gráfico de Correlação
const CorrelationChart = ({ searchGroup, days }: TabProps) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['combinedView', searchGroup, days],
        queryFn: () => getCombinedView(searchGroup, days),
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorAlert message={error.message} />;

    const chartData = data?.mentions_over_time.map(mention => {
        const trendPoint = data.trends_over_time.find(t => t.date === mention.date);
        return {
            date: new Date(mention.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            Menções: mention.value,
            'Interesse de Busca': trendPoint?.value || 0,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gráfico de Correlação: Menções & Interesse de Busca</CardTitle>
                <CardDescription>
                    Analise a correlação entre o que é dito nas redes e o que é buscado no Google.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="Menções" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="Interesse de Busca" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};


export default function TabVisaoGeral({ searchGroup, days }: TabProps) {
  return (
    <div className="space-y-6">
      <KpiCards searchGroup={searchGroup} days={days} />
      <CorrelationChart searchGroup={searchGroup} days={days} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Nuvem de Entidades Principais</CardTitle>
                <CardDescription>Visualize os temas e termos mais associados.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Placeholder para a Nuvem de Palavras */}
                <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                    <p className="text-muted-foreground">Componente de Nuvem de Palavras a ser implementado.</p>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Menções Relevantes</CardTitle>
                <CardDescription>Mergulhe nas conversas individuais.</CardDescription>
            </CardHeader>
            <CardContent>
                 {/* Placeholder para a Tabela de Menções */}
                 <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
                    <p className="text-muted-foreground">Componente de Tabela de Menções a ser implementado.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
