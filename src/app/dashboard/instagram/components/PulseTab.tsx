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
import ReactWordcloud from "react-wordcloud";
import { BarChart, DonutChart } from "@tremor/react";

// Mock Data - Replace with actual data fetching
const kpis = [
  { title: "Novos Posts", value: "12" },
  { title: "Total de Likes", value: "5,432" },
  { title: "Total de Comentários", value: "876" },
  { title: "Novos Seguidores", value: "157" },
];

const sentimentData = [
  { name: "Positivo", value: 450 },
  { name: "Negativo", value: 120 },
  { name: "Neutro", value: 306 },
];

const crisisAlerts = [
  {
    post: "Post sobre a nova lei de zoneamento",
    reason: "Alto volume de comentários negativos.",
    sentiment: -0.8,
    link: "#",
  },
  {
    post: "Vídeo da visita à escola",
    reason: "Viralizou positivamente, engajamento 3x acima da média.",
    sentiment: 0.9,
    link: "#",
  },
];

const words = [
  { text: "segurança", value: 64 },
  { text: "saúde", value: 45 },
  { text: "educação", value: 32 },
  { text: "transporte", value: 28 },
  { text: "reforma", value: 18 },
  { text: "impostos", value: 15 },
  { text: "vereador", value: 22 },
  { text: "prefeito", value: 19 },
];

const options = {
  rotations: 2,
  rotationAngles: [-90, 0],
  fontSizes: [12, 60],
};

export default function PulseTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {/* KPIs */}
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader>
            <CardTitle className="text-base">{kpi.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}

      {/* Stories Recentes */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Stories Recentes (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-gray-500">[Componente Carrossel de Stories]</p>
          </div>
        </CardContent>
      </Card>

      {/* Balanço de Sentimento */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Balanço de Sentimento (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={sentimentData}
            category="value"
            index="name"
            colors={["green", "red", "blue"]}
          />
        </CardContent>
      </Card>

      {/* Principais Termos do Dia */}
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Principais Termos do Dia</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ReactWordcloud words={words} options={options} />
        </CardContent>
      </Card>

      {/* Alerta de Crise / Oportunidade */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Alerta de Crise / Oportunidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Sentimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crisisAlerts.map((alert) => (
                <TableRow key={alert.post}>
                  <TableCell className="font-medium">{alert.post}</TableCell>
                  <TableCell>{alert.reason}</TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      alert.sentiment > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {alert.sentiment}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
