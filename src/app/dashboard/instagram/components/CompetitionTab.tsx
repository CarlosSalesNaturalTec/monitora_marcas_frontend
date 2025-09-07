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
import { AreaChart, BarChart } from "@tremor/react";
import ReactWordcloud from "react-wordcloud";
import {
  getHeadToHeadEngagement,
  getContentStrategyComparison,
  getVulnerabilityIdentification,
  getTopTermsByProfile,
} from "@/services/instagramDashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para os dados da API
interface HeadToHeadData {
  labels: string[];
  series: {
    [profile: string]: number[];
  };
}

interface ContentStrategyData {
    [profile: string]: {
        [type: string]: number;
    };
}

interface VulnerabilityData {
    profile: string;
    post_id: string;
    avg_sentiment: number;
    comments_count: number;
    caption: string;
}

interface WordCloudData {
    text: string;
    value: number;
}

const wordcloudOptions = {
    rotations: 0,
    fontSizes: [14, 50] as [number, number],
};

// TODO: Perfis devem vir de um seletor na UI
const MAIN_PROFILE = "nome_parlamentar";
const COMPETITOR_PROFILES = ["concorrente_a", "concorrente_b"];
const ALL_PROFILES = [MAIN_PROFILE, ...COMPETITOR_PROFILES];

export default function CompetitionTab() {
  const [headToHeadData, setHeadToHeadData] = useState<any[]>([]);
  const [profileCategories, setProfileCategories] = useState<string[]>([]);
  const [contentStrategyData, setContentStrategyData] = useState<any[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityData[]>([]);
  const [wordCloudData, setWordCloudData] = useState<{ [profile: string]: WordCloudData[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [engagementRes, strategyRes, vulnerabilityRes, wordCloudRes] = await Promise.all([
          getHeadToHeadEngagement(ALL_PROFILES, 7),
          getContentStrategyComparison(ALL_PROFILES),
          getVulnerabilityIdentification(COMPETITOR_PROFILES),
          getTopTermsByProfile(ALL_PROFILES, 7),
        ]);

        // Formatar dados de engajamento
        const profileNames = Object.keys(engagementRes.series);
        setProfileCategories(profileNames);
        const formattedEngagement = engagementRes.labels.map((label: string, index: number) => {
            const entry: { [key: string]: any } = { date: new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
            profileNames.forEach(profile => {
                entry[profile] = engagementRes.series[profile][index];
            });
            return entry;
        });
        setHeadToHeadData(formattedEngagement);

        // Formatar dados de estratégia de conteúdo
        const formattedStrategy = Object.entries(strategyRes).map(([profile, types]) => ({
            name: profile,
            ...(types || {}) // Garante que types seja um objeto antes do spread
        }));
        setContentStrategyData(formattedStrategy);

        setVulnerabilities(vulnerabilityRes);
        setWordCloudData(wordCloudRes);

      } catch (err) {
        setError("Falha ao carregar os dados de competição. Tente novamente mais tarde.");
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Head-to-Head de Engajamento */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Head-to-Head de Engajamento (Likes + Comentários)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-72 w-full" /> : (
            <AreaChart
              data={headToHeadData}
              index="date"
              categories={profileCategories}
              colors={["blue", "red", "yellow", "green"]}
              yAxisWidth={60}
            />
          )}
        </CardContent>
      </Card>

      {/* Comparativo de Estratégia de Conteúdo */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Comparativo de Estratégia de Conteúdo (% por Tipo)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <BarChart
                data={contentStrategyData}
                index="name"
                categories={['GraphImage', 'GraphVideo', 'GraphSidecar']} // Nomes dos tipos do Instaloader
                colors={['cyan', 'blue', 'indigo']}
                layout="vertical"
                stack={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Nuvem de Palavras Comparativa */}
      <Card>
        <CardHeader><CardTitle>Suas Pautas</CardTitle></CardHeader>
        <CardContent className="h-64">
          {loading ? <Skeleton className="h-full w-full" /> : (
            <ReactWordcloud words={wordCloudData[MAIN_PROFILE] || []} options={wordcloudOptions} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Pautas do Principal Concorrente</CardTitle></CardHeader>
        <CardContent className="h-64">
          {loading ? <Skeleton className="h-full w-full" /> : (
            <ReactWordcloud words={wordCloudData[COMPETITOR_PROFILES[0]] || []} options={wordcloudOptions} />
          )}
        </CardContent>
      </Card>

      {/* Identificação de Vulnerabilidades */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Identificação de Vulnerabilidades e Oportunidades</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post do Concorrente</TableHead>
                  <TableHead>Vulnerabilidade Detectada</TableHead>
                  <TableHead>Sentimento Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vulnerabilities.length > 0 ? vulnerabilities.map((item) => (
                  <TableRow key={item.post_id}>
                    <TableCell className="font-medium">{item.profile}: "{item.caption}..."</TableCell>
                    <TableCell>Alto volume de comentários ({item.comments_count}) com tom negativo.</TableCell>
                    <TableCell className="text-red-600 font-bold text-right">{item.avg_sentiment.toFixed(2)}</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">Nenhuma vulnerabilidade detectada.</TableCell>
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
