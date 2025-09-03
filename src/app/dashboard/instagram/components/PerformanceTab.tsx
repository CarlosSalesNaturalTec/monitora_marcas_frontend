"use client";

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

// Mock Data
const engagementData = [
  { date: "01/08", Likes: 2890, Comentários: 480 },
  { date: "02/08", Likes: 2756, Comentários: 510 },
  { date: "03/08", Likes: 3322, Comentários: 690 },
  { date: "04/08", Likes: 3470, Comentários: 590 },
  { date: "05/08", Likes: 3475, Comentários: 720 },
  { date: "06/08", Likes: 3129, Comentários: 650 },
  { date: "07/08", Likes: 3490, Comentários: 810 },
];

const contentTypeData = [
  { type: "Imagem", "Média de Likes": 2800, "Média de Comentários": 450 },
  { type: "Vídeo (Reels)", "Média de Likes": 5200, "Média de Comentários": 980 },
  { type: "Carrossel", "Média de Likes": 3500, "Média de Comentários": 620 },
];

const topPostsData = [
  { post: "Inauguração da nova creche", likes: 8900, comments: 1500 },
  { post: "Asfaltamento da Rua Principal", likes: 7500, comments: 1200 },
  { post: "Visita ao hospital regional", likes: 6800, comments: 950 },
  { post: "Reunião com líderes comunitários", likes: 4200, comments: 500 },
  { post: "Prestação de contas semanal", likes: 3100, comments: 350 },
];

const topSupporters = [
  { user: "@maria_silva", comments: 25, sentiment: 0.95 },
  { user: "@joao_costa", comments: 18, sentiment: 0.92 },
  { user: "@ana_pereira", comments: 15, sentiment: 0.88 },
];

const topCritics = [
  { user: "@carlos_santos", comments: 32, sentiment: -0.91 },
  { user: "@pedro_almeida", comments: 21, sentiment: -0.85 },
  { user: "@lucia_fernandes", comments: 19, sentiment: -0.89 },
];

const commentersInfluence = [
    { user: 'Militante 1', comments: 50, followers: 150 },
    { user: 'Militante 2', comments: 45, followers: 200 },
    { user: 'Cidadão Comum', comments: 5, followers: 300 },
    { user: 'Influenciador Local', comments: 3, followers: 15000 },
    { user: 'Jornalista', comments: 2, followers: 8000 },
];


export default function PerformanceTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Evolução do Engajamento */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Evolução do Engajamento (Últimos 7 Dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={engagementData}
            index="date"
            categories={["Likes", "Comentários"]}
            colors={["blue", "green"]}
            yAxisWidth={60}
          />
        </CardContent>
      </Card>

      {/* Performance por Tipo de Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Tipo de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={contentTypeData}
            index="type"
            categories={["Média de Likes", "Média de Comentários"]}
            colors={["blue", "green"]}
            layout="vertical"
            yAxisWidth={100}
          />
        </CardContent>
      </Card>
      
      {/* Mapa de Influência dos Comentaristas */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Influência dos Comentaristas</CardTitle>
        </CardHeader>
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
        <CardHeader>
          <CardTitle>Ranking de Posts (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comentários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPostsData.map((post) => (
                <TableRow key={post.post}>
                  <TableCell className="font-medium">{post.post}</TableCell>
                  <TableCell className="text-right">{post.likes}</TableCell>
                  <TableCell className="text-right">{post.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top 3 Apoiadores */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Apoiadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="text-right">Comentários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSupporters.map((user) => (
                <TableRow key={user.user}>
                  <TableCell className="font-medium">{user.user}</TableCell>
                  <TableCell className="text-right">{user.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top 3 Críticos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Críticos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="text-right">Comentários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCritics.map((user) => (
                <TableRow key={user.user}>
                  <TableCell className="font-medium">{user.user}</TableCell>
                  <TableCell className="text-right">{user.comments}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}