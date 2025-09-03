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
import { AreaChart, BarChart, ScatterChart } from "@tremor/react";
import {
  getEngagementEvolution,
  getPerformanceByContentType,
  getPostsRanking,
  getTopCommenters,
  getCommentersInfluence,
  getSentimentByPost,
} from "@/services/instagramDashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

// ... (interfaces existentes)

interface SentimentByPost {
    post: string;
    Positivo: number;
    Negativo: number;
    Neutro: number;
}

export default function PerformanceTab() {
  // TODO: O perfil do usuário deve vir de um contexto ou seletor na UI
  const PROFILE_USERNAME = "nome_parlamentar"; 

  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [contentTypeData, setContentTypeData] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topSupporters, setTopSupporters] = useState<any[]>([]);
  const [topCritics, setTopCritics] = useState<any[]>([]);
  const [commentersInfluence, setCommentersInfluence] = useState<any[]>([]);
  const [sentimentByPost, setSentimentByPost] = useState<SentimentByPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      const promises = [
        getEngagementEvolution(PROFILE_USERNAME, 30),
        getPerformanceByContentType(PROFILE_USERNAME),
        getPostsRanking(PROFILE_USERNAME, 'likes_count', 5),
        getTopCommenters(PROFILE_USERNAME, 'supporter', 3),
        getTopCommenters(PROFILE_USERNAME, 'critic', 3),
        getCommentersInfluence(PROFILE_USERNAME, 50),
        getSentimentByPost(PROFILE_USERNAME, 10),
      ];
      const promiseNames = [
        'Engagement Evolution',
        'Performance By Content Type',
        'Posts Ranking',
        'Top Supporters',
        'Top Critics',
        'Commenters Influence',
        'Sentiment By Post',
      ];

      const results = await Promise.allSettled(promises);
      let hadError = false;

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Falha ao carregar ${promiseNames[index]}:`, result.reason);
          setError(`Falha ao carregar dados de: ${promiseNames[index]}. Verifique o console para mais detalhes.`);
          hadError = true;
        }
      });

      if (!hadError) {
        const [
          engagementRes,
          performanceRes,
          rankingRes,
          supportersRes,
          criticsRes,
          influenceRes,
          sentimentPostRes,
        ] = results.map(r => (r as PromiseFulfilledResult<any>).value);

        // Formatar dados para os gráficos
        const formattedEngagement = engagementRes.labels.map((label: string, index: number) => ({
          date: new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          Likes: engagementRes.likes_series[index],
          Comentários: engagementRes.comments_series[index],
        }));
        setEngagementData(formattedEngagement);

        const formattedPerformance = Object.entries(performanceRes).map(([type, data]: [string, any]) => ({
            type: type,
            "Média de Likes": data.avg_likes,
            "Média de Comentários": data.avg_comments,
        }));
        setContentTypeData(formattedPerformance);

        setTopPosts(rankingRes);
        setTopSupporters(supportersRes);
        setTopCritics(criticsRes);
        setCommentersInfluence(influenceRes);
        setSentimentByPost(sentimentPostRes);
      }

      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Evolução do Engajamento */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Evolução do Engajamento (Últimos 30 Dias)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-72 w-full" /> : (
            <AreaChart
              data={engagementData}
              index="date"
              categories={["Likes", "Comentários"]}
              colors={["blue", "green"]}
              yAxisWidth={60}
            />
          )}
        </CardContent>
      </Card>

      {/* Performance por Tipo de Conteúdo */}
      <Card>
        <CardHeader><CardTitle>Performance por Tipo de Conteúdo</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-72 w-full" /> : (
            <BarChart
              data={contentTypeData}
              index="type"
              categories={["Média de Likes", "Média de Comentários"]}
              colors={["blue", "green"]}
              layout="vertical"
              yAxisWidth={100}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Mapa de Influência dos Comentaristas */}
      <Card>
        <CardHeader><CardTitle>Mapa de Influência dos Comentaristas</CardTitle></CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-72 w-full" /> : (
                <ScatterChart
                    data={commentersInfluence}
                    category="user"
                    x="comments"
                    y="followers"
                    size="followers"
                    showLegend={false}
                    yAxisLabel="Seguidores (Média)"
                    xAxisLabel="Nº de Comentários"
                />
            )}
        </CardContent>
      </Card>

      {/* Análise de Sentimento dos Comentários */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Análise de Sentimento por Post</CardTitle></CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-72 w-full" /> : (
                <BarChart
                    data={sentimentByPost}
                    index="post"
                    categories={["Positivo", "Negativo", "Neutro"]}
                    colors={["green", "red", "blue"]}
                    stack={true}
                    yAxisWidth={100}
                />
            )}
        </CardContent>
      </Card>

      {/* Ranking de Posts */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Ranking de Posts (Top 5)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-60 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comentários</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium truncate max-w-xs">{post.data.caption || post.id}</TableCell>
                    <TableCell className="text-right">{post.data.likes_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{post.data.comments_count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Apoiadores */}
      <Card>
        <CardHeader><CardTitle>Top 3 Apoiadores</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Comentários</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSupporters.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-right">{user.comment_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Críticos */}
      <Card>
        <CardHeader><CardTitle>Top 3 Críticos</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Comentários</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCritics.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-right">{user.comment_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
