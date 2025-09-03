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
} from "@/services/instagramDashboardApi";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para os dados da API
interface EngagementData {
  labels: string[];
  likes_series: number[];
  comments_series: number[];
}

interface ContentTypePerformance {
  [key: string]: {
    avg_likes: number;
    avg_comments: number;
    post_count: number;
  };
}

interface PostRanking {
  id: string;
  data: {
    caption: string;
    likes_count: number;
    comments_count: number;
  };
}

interface TopCommenter {
  username: string;
  comment_count: number;
}

// Mock Data para o gráfico de influência (TODO: Criar endpoint para isso)
const commentersInfluence = [
    { user: 'Militante 1', comments: 50, followers: 150 },
    { user: 'Militante 2', comments: 45, followers: 200 },
    { user: 'Cidadão Comum', comments: 5, followers: 300 },
    { user: 'Influenciador Local', comments: 3, followers: 15000 },
    { user: 'Jornalista', comments: 2, followers: 8000 },
];

// TODO: O perfil do usuário deve vir de um contexto ou seletor na UI
const PROFILE_USERNAME = "nome_parlamentar"; 

export default function PerformanceTab() {
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [contentTypeData, setContentTypeData] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<PostRanking[]>([]);
  const [topSupporters, setTopSupporters] = useState<TopCommenter[]>([]);
  const [topCritics, setTopCritics] = useState<TopCommenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          engagementRes,
          performanceRes,
          rankingRes,
          supportersRes,
          criticsRes,
        ] = await Promise.all([
          getEngagementEvolution(PROFILE_USERNAME, 30),
          getPerformanceByContentType(PROFILE_USERNAME),
          getPostsRanking(PROFILE_USERNAME, 'likes_count', 5),
          getTopCommenters(PROFILE_USERNAME, 'supporter', 3),
          getTopCommenters(PROFILE_USERNAME, 'critic', 3),
        ]);

        // Formatar dados para os gráficos
        const formattedEngagement = engagementRes.labels.map((label: string, index: number) => ({
          date: new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          Likes: engagementRes.likes_series[index],
          Comentários: engagementRes.comments_series[index],
        }));
        setEngagementData(formattedEngagement);

        const formattedPerformance = Object.entries(performanceRes).map(([type, data]) => ({
            type: type,
            "Média de Likes": data.avg_likes,
            "Média de Comentários": data.avg_comments,
        }));
        setContentTypeData(formattedPerformance);

        setTopPosts(rankingRes);
        setTopSupporters(supportersRes);
        setTopCritics(criticsRes);

      } catch (err) {
        setError("Falha ao carregar os dados de performance. Tente novamente mais tarde.");
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
        <CardHeader><CardTitle>Mapa de Influência dos Comentaristas (Exemplo)</CardTitle></CardHeader>
        <CardContent>
            <ScatterChart
                data={commentersInfluence}
                category="user"
                x="comments"
                y="followers"
                size="followers"
                showLegend={false}
                yAxisLabel="Seguidores"
                xAxisLabel="Nº de Comentários"
            />
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
