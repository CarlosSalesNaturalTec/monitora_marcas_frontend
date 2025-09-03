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
import { LineChart } from "@tremor/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

// Mock Data
const sentimentOverTimeData = [
  { date: "25/07", "Sentimento Médio": 0.2 },
  { date: "26/07", "Sentimento Médio": 0.1 },
  { date: "27/07", "Sentimento Médio": -0.3 },
  { date: "28/07", "Sentimento Médio": -0.4 },
  { date: "29/07", "Sentimento Médio": 0.0 },
  { date: "30/07", "Sentimento Médio": 0.5 },
  { date: "31/07", "Sentimento Médio": 0.6 },
];

const topInfluencersData = [
    { user: '@jornal_da_cidade', followers: 25000, totalLikes: 12000, avgSentiment: 0.1 },
    { user: '@reporter_local', followers: 18000, totalLikes: 9500, avgSentiment: -0.2 },
    { user: '@ativista_bairro', followers: 5000, totalLikes: 8000, avgSentiment: -0.8 },
    { user: '@prefeitura_news', followers: 45000, totalLikes: 7500, avgSentiment: 0.7 },
];

export default function HashtagsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Análise da Pauta</CardTitle>
                    <div className="w-64">
                    <Select defaultValue="seguranca">
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a pauta/hashtag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="seguranca">#SegurançaEmMinhaCidade</SelectItem>
                            <SelectItem value="saude">#SaudeParaTodos</SelectItem>
                            <SelectItem value="educacao">#EducaçãoDeQualidade</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
            </CardHeader>
        </Card>

      {/* Feed da Hashtag */}
      <Card className="lg:col-span-1 h-[600px]">
        <CardHeader>
          <CardTitle>Feed da Hashtag</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-gray-500">[Feed Visual de Posts]</p>
            </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Sentimento da Pauta ao Longo do Tempo */}
        <Card>
            <CardHeader>
            <CardTitle>Sentimento da Pauta ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
            <LineChart
                data={sentimentOverTimeData}
                index="date"
                categories={["Sentimento Médio"]}
                colors={["blue"]}
                yAxisWidth={40}
            />
            </CardContent>
        </Card>

        {/* Principais Influenciadores da Pauta */}
        <Card>
            <CardHeader>
            <CardTitle>Principais Influenciadores da Pauta</CardTitle>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Seguidores</TableHead>
                    <TableHead className="text-right">Likes na Pauta</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {topInfluencersData.map((user) => (
                    <TableRow key={user.user}>
                    <TableCell className="font-medium">{user.user}</TableCell>
                    <TableCell className="text-right">{user.followers.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">{user.totalLikes.toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}