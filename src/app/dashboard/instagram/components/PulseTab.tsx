"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReactWordcloud from "react-wordcloud";
import { DonutChart } from "@tremor/react";
import {
  getKpisLast24h,
  getSentimentBalanceLast24h,
  getTopTermsLast24h,
  getAlertsLast24h,
  getStoriesLast24h,
} from "@/services/instagramDashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para os dados da API
interface KpiData {
  total_posts: number;
  total_likes: number;
  total_comments: number;
}

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

interface TermData {
  text: string;
  value: number;
}

interface AlertData {
  type: 'opportunity' | 'crisis';
  post_id: string;
  message: string;
  details: {
    caption?: string;
  };
}

const wordcloudOptions = {
  rotations: 2,
  rotationAngles: [-90, 0] as [number, number],
  fontSizes: [12, 60] as [number, number],
};

export default function PulseTab() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [topTerms, setTopTerms] = useState<TermData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [kpisRes, sentimentRes, termsRes, alertsRes] = await Promise.all([
          getKpisLast24h(),
          getSentimentBalanceLast24h(),
          getTopTermsLast24h(),
          getAlertsLast24h(),
        ]);
        setKpis(kpisRes);
        setSentimentData(sentimentRes);
        setTopTerms(termsRes);
        setAlerts(alertsRes);
      } catch (err) {
        setError("Falha ao carregar os dados do dashboard. Tente novamente mais tarde.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  const formattedSentimentData = sentimentData
    ? [
        { name: "Positivo", value: sentimentData.positive },
        { name: "Negativo", value: sentimentData.negative },
        { name: "Neutro", value: sentimentData.neutral },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {/* KPIs */}
      <Card>
        <CardHeader><CardTitle className="text-base">Novos Posts</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/2" /> : <p className="text-3xl font-bold">{kpis?.total_posts ?? 0}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Total de Likes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/2" /> : <p className="text-3xl font-bold">{kpis?.total_likes.toLocaleString() ?? 0}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Total de Comentários</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-1/2" /> : <p className="text-3xl font-bold">{kpis?.total_comments.toLocaleString() ?? 0}</p>}
        </CardContent>
      </Card>
       <Card>
        <CardHeader><CardTitle className="text-base">Novos Seguidores</CardTitle></CardHeader>
        <CardContent>
            {/* TODO: Endpoint não disponível ainda */}
            <p className="text-3xl font-bold text-gray-400">N/A</p>
        </CardContent>
      </Card>

      {/* Stories Recentes */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader><CardTitle>Stories Recentes (Últimas 24h)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-gray-500">[Componente Carrossel de Stories - TODO]</p>
          </div>
        </CardContent>
      </Card>

      {/* Balanço de Sentimento */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader><CardTitle>Balanço de Sentimento (Últimas 24h)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <DonutChart
              data={formattedSentimentData}
              category="value"
              index="name"
              colors={["green", "red", "blue"]}
            />
          )}
        </CardContent>
      </Card>

      {/* Principais Termos do Dia */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader><CardTitle>Principais Termos do Dia</CardTitle></CardHeader>
        <CardContent className="h-64">
          {loading ? <Skeleton className="h-full w-full" /> : <ReactWordcloud words={topTerms} options={wordcloudOptions} />}
        </CardContent>
      </Card>

      {/* Alerta de Crise / Oportunidade */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader><CardTitle>Alerta de Crise / Oportunidade</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Post ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length > 0 ? alerts.map((alert) => (
                  <TableRow key={alert.post_id}>
                    <TableCell>
                      <span className={`font-bold ${alert.type === 'opportunity' ? 'text-green-500' : 'text-red-500'}`}>
                        {alert.type === 'opportunity' ? 'Oportunidade' : 'Crise'}
                      </span>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell className="font-mono">{alert.post_id}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Nenhum alerta nas últimas 24 horas.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}