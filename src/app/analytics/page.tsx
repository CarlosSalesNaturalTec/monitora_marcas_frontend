"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';

// Importe os componentes das abas que serão criados
import TabVisaoGeral from '@/components/analytics/TabVisaoGeral';
import TabAnalisePautas from '@/components/analytics/TabAnalisePautas';
import TabInteligenciaTrends from '@/components/analytics/TabInteligenciaTrends';
// Supondo que o componente da Aba 4 já existe
// import TabAnaliseSentimento from '@/components/analytics/TabAnaliseSentimento';


export default function AnalyticsPage() {
  const [searchGroup, setSearchGroup] = useState('brand');
  const [days, setDays] = useState(30);

  const commonProps = { searchGroup, days };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Painel de Analytics</h1>
        <p className="text-muted-foreground">
          Analise a percepção pública, antecipe crises e identifique pautas emergentes.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros Globais</CardTitle>
          <CardDescription>
            Selecione a entidade e o período para analisar os dados em todas as abas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search-group" className="text-sm font-medium mb-2 block">
              Entidade
            </label>
            <Select value={searchGroup} onValueChange={setSearchGroup}>
              <SelectTrigger id="search-group">
                <SelectValue placeholder="Selecione a entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Marca (Parlamentar)</SelectItem>
                <SelectItem value="competitors">Concorrentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-2 block">
              Período
            </label>
            <div className="flex gap-2">
              <Button variant={days === 7 ? 'default' : 'outline'} onClick={() => setDays(7)}>
                7 dias
              </Button>
              <Button variant={days === 30 ? 'default' : 'outline'} onClick={() => setDays(30)}>
                30 dias
              </Button>
              <Button variant={days === 90 ? 'default' : 'outline'} onClick={() => setDays(90)}>
                90 dias
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="analise-pautas">Análise de Pautas</TabsTrigger>
          <TabsTrigger value="inteligencia-trends">Inteligência de Trends</TabsTrigger>
          <TabsTrigger value="analise-sentimento">Análise de Sentimento</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-6">
          <TabVisaoGeral {...commonProps} />
        </TabsContent>
        <TabsContent value="analise-pautas" className="mt-6">
          <TabAnalisePautas {...commonProps} />
        </TabsContent>
        <TabsContent value="inteligencia-trends" className="mt-6">
          <TabInteligenciaTrends {...commonProps} />
        </TabsContent>
        <TabsContent value="analise-sentimento" className="mt-6">
          {/* <TabAnaliseSentimento {...commonProps} /> */}
           <Card>
            <CardHeader>
              <CardTitle>Análise de Sentimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Componente da Aba 4 (Análise de Sentimento) a ser renderizado aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
