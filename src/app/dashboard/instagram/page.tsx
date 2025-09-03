"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PulseTab from "./components/PulseTab";
import PerformanceTab from "./components/PerformanceTab";
import CompetitionTab from "./components/CompetitionTab";
import HashtagsTab from "./components/HashtagsTab";

export default function InstagramDashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard do Instagram</h1>
      <Tabs defaultValue="pulse">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="pulse">Pulso do Dia</TabsTrigger>
          <TabsTrigger value="performance">Análise de Desempenho</TabsTrigger>
          <TabsTrigger value="competition">Inteligência Competitiva</TabsTrigger>
          <TabsTrigger value="hashtags">Radar de Pautas</TabsTrigger>
        </TabsList>
        <TabsContent value="pulse">
          <PulseTab />
        </TabsContent>
        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>
        <TabsContent value="competition">
          <CompetitionTab />
        </TabsContent>
        <TabsContent value="hashtags">
          <HashtagsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
