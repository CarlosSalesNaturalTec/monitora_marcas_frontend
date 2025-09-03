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
import { AreaChart, BarChart } from "@tremor/react";
import ReactWordcloud from "react-wordcloud";

// Mock Data
const headToHeadData = [
  { date: "01/08", "Seu Perfil": 3370, "Concorrente A": 2980, "Concorrente B": 2540 },
  { date: "02/08", "Seu Perfil": 3266, "Concorrente A": 3150, "Concorrente B": 2680 },
  { date: "03/08", "Seu Perfil": 4012, "Concorrente A": 3540, "Concorrente B": 2890 },
  { date: "04/08", "Seu Perfil": 4060, "Concorrente A": 3890, "Concorrente B": 2780 },
  { date: "05/08", "Seu Perfil": 4195, "Concorrente A": 3950, "Concorrente B": 3010 },
  { date: "06/08", "Seu Perfil": 3779, "Concorrente A": 4100, "Concorrente B": 3250 },
  { date: "07/08", "Seu Perfil": 4300, "Concorrente A": 4250, "Concorrente B": 3100 },
];

const contentStrategyData = [
    { name: 'Seu Perfil', Imagem: 40, 'Vídeo (Reels)': 50, Carrossel: 10 },
    { name: 'Concorrente A', Imagem: 60, 'Vídeo (Reels)': 25, Carrossel: 15 },
    { name: 'Concorrente B', Imagem: 75, 'Vídeo (Reels)': 15, Carrossel: 10 },
];

const yourWords = [
    { text: 'futuro', value: 40 }, { text: 'trabalho', value: 35 },
    { text: 'cidade', value: 38 }, { text: 'oportunidade', value: 30 },
    { text: 'desenvolvimento', value: 28 }, { text: 'esperança', value: 25 },
];

const competitorWords = [
    { text: 'problemas', value: 45 }, { text: 'crise', value: 38 },
    { text: 'segurança', value: 42 }, { text: 'abandono', value: 30 },
    { text: 'denúncia', value: 25 }, { text: 'caos', value: 22 },
];

const vulnerabilitiesData = [
    { post: 'Concorrente A: "Proposta para o trânsito"', issue: 'Alta rejeição nos comentários, sentimento médio de -0.75', opportunity: 'Apresentar nossa proposta focando nos pontos criticados.' },
    { post: 'Concorrente B: "Balanço da saúde"', issue: 'Muitos comentários citando falta de medicamentos.', opportunity: 'Criar conteúdo sobre nossas ações para a saúde básica.' },
];

const wordcloudOptions = {
    rotations: 0,
    fontSizes: [14, 50],
  };

export default function CompetitionTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Head-to-Head de Engajamento */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Head-to-Head de Engajamento (Likes + Comentários)</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={headToHeadData}
            index="date"
            categories={["Seu Perfil", "Concorrente A", "Concorrente B"]}
            colors={["blue", "red", "yellow"]}
            yAxisWidth={60}
          />
        </CardContent>
      </Card>

      {/* Comparativo de Estratégia de Conteúdo */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Comparativo de Estratégia de Conteúdo (% por Tipo)</CardTitle>
        </CardHeader>
        <CardContent>
            <BarChart
                data={contentStrategyData}
                index="name"
                categories={['Imagem', 'Vídeo (Reels)', 'Carrossel']}
                colors={['cyan', 'blue', 'indigo']}
                layout="vertical"
                stack={true}
            />
        </CardContent>
      </Card>

      {/* Nuvem de Palavras Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Pautas</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
            <ReactWordcloud words={yourWords} options={wordcloudOptions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pautas do Concorrente A</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
            <ReactWordcloud words={competitorWords} options={wordcloudOptions} />
        </CardContent>
      </Card>

      {/* Identificação de Vulnerabilidades */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Identificação de Vulnerabilidades e Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post do Concorrente</TableHead>
                <TableHead>Vulnerabilidade Detectada</TableHead>
                <TableHead>Oportunidade para Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vulnerabilitiesData.map((item) => (
                <TableRow key={item.post}>
                  <TableCell className="font-medium">{item.post}</TableCell>
                  <TableCell>{item.issue}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{item.opportunity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}