"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  runMonitorSearch, getLatestMonitorData, deleteAllMonitorData, MonitorData,
  getHistoricalMonitorData, runHistoricalMonitorSearch, HistoricalMonitorData 
} from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlayCircle, Info, Trash2, History, AlertTriangle } from 'lucide-react';
import { toast } from "react-hot-toast";
import { format, isValid } from 'date-fns';

// --- Subcomponente: Exibir Resultados (Relevante) ---

interface ResultsDisplayProps {
  data: MonitorData | undefined;
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Carregando dados...</span></div>;
  }

  if (!data) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Nenhuma Coleta Encontrada</AlertTitle>
        <AlertDescription>
          Ainda não foi realizada nenhuma coleta de dados para este grupo. Clique em "Coleta do Agora" para buscar os dados mais recentes.
        </AlertDescription>
      </Alert>
    );
  }

  const { run_metadata, results } = data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Coleta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold">Data da Coleta</p>
            <p>{format(new Date(run_metadata.collected_at), "dd/MM/yyyy 'às' HH:mm")}</p>
          </div>
          <div>
            <p className="font-semibold">Resultados Encontrados</p>
            <p>{run_metadata.total_results_found}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold">Query Utilizada</p>
            <Badge variant="outline" className="whitespace-normal break-all">{run_metadata.search_terms_query}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>Lista de links e snippets encontrados durante a coleta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>Snippet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">Nenhum resultado retornado pela busca.</TableCell>
                </TableRow>
              ) : (
                results.map((item, index) => (
                  <TableRow key={`${item.link}-${index}`}>
                    <TableCell>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {item.displayLink}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div dangerouslySetInnerHTML={{ __html: item.htmlSnippet }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Subcomponente: Exibir Resultados (Histórico) ---

interface HistoricalDisplayProps {
  data: MonitorData[] | undefined;
  isLoading: boolean;
  groupName: string;
}

const HistoricalDisplay: React.FC<HistoricalDisplayProps> = ({ data, isLoading, groupName }) => {
  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Carregando histórico...</span></div>;
  }

  if (!data || data.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Nenhum Dado Histórico</AlertTitle>
        <AlertDescription>
          {`Nenhuma coleta histórica foi realizada para '${groupName}'. Insira uma data de início e inicie a coleta.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((runData) => (
        <Card key={runData.run_metadata.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Resultados de {runData.run_metadata.range_start ? format(new Date(runData.run_metadata.range_start), 'dd/MM/yyyy') : 'Data Desconhecida'}
            </CardTitle>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span>Resultados: <Badge variant="secondary">{runData.run_metadata.total_results_found}</Badge></span>
              {runData.run_metadata.last_interruption_date && (
                 <span className="text-amber-600">Interrompido em: <Badge variant="destructive">{format(new Date(runData.run_metadata.last_interruption_date), 'dd/MM/yyyy')}</Badge></span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Snippet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runData.results.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center">Nenhum resultado encontrado para esta data.</TableCell></TableRow>
                ) : (
                  runData.results.map((item, index) => (
                    <TableRow key={`${item.link}-${index}`}>
                      <TableCell className="max-w-xs">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {item.displayLink}
                        </a>
                      </TableCell>
                      <TableCell><div dangerouslySetInnerHTML={{ __html: item.htmlSnippet }} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Subcomponente: Conteúdo da Aba Histórico ---

const HistoricalTabContent = () => {
  const [startDate, setStartDate] = useState('');
  const queryClient = useQueryClient();

  const { data: historicalData, isLoading: isQueryLoading, isError } = useQuery({
    queryKey: ['historicalMonitorData'],
    queryFn: getHistoricalMonitorData,
  });

  const mutation = useMutation({
    mutationFn: runHistoricalMonitorSearch,
    onSuccess: (data) => {
      toast.success(data.message || "Coleta histórica iniciada!");
      queryClient.invalidateQueries({ queryKey: ['historicalMonitorData'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Falha ao iniciar coleta histórica.");
    },
  });

  const handleRunHistorical = () => {
    if (!startDate) {
      toast.error("Por favor, selecione uma data de início.");
      return;
    }
    const dateObj = new Date(startDate);
    if (!isValid(dateObj)) {
      toast.error("Data inválida. Use o formato AAAA-MM-DD.");
      return;
    }
    mutation.mutate({ start_date: startDate });
  };

  const hasExistingData = !!(historicalData?.brand?.length || historicalData?.competitors?.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Iniciar Coleta Histórica</CardTitle>
          <CardDescription>
            Selecione uma data de início para buscar dados históricos. O processo pode levar tempo e consumirá sua cota diária de requisições.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="start-date">Data de Início</Label>
            <Input 
              type="date" 
              id="start-date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={mutation.isPending || hasExistingData}
              max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]} // Ontem
            />
          </div>
          <Button onClick={handleRunHistorical} disabled={mutation.isPending || hasExistingData}>
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
            {mutation.isPending ? 'Coletando...' : 'Iniciar Coleta Histórica'}
          </Button>
        </CardContent>
        {hasExistingData && (
             <CardContent>
                <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Coleta Histórica já Realizada</AlertTitle>
                    <AlertDescription>
                        Já existem dados históricos. Para realizar uma nova coleta, todos os dados (relevantes e históricos) devem ser limpos na aba "Dados do Agora".
                    </AlertDescription>
                </Alert>
            </CardContent>
        )}
      </Card>

      <Tabs defaultValue="brand">
        <TabsList>
          <TabsTrigger value="brand">Marca</TabsTrigger>
          <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
        </TabsList>
        <TabsContent value="brand" className="mt-4">
          <HistoricalDisplay data={historicalData?.brand} isLoading={isQueryLoading} groupName="Marca" />
        </TabsContent>
        <TabsContent value="competitors" className="mt-4">
          <HistoricalDisplay data={historicalData?.competitors} isLoading={isQueryLoading} groupName="Concorrentes" />
        </TabsContent>
      </Tabs>
    </div>
  );
};


// --- Componente Principal da Página ---

const MonitorPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: latestData, isLoading: isQueryLoading, isError } = useQuery({
    queryKey: ['latestMonitorData'],
    queryFn: getLatestMonitorData,
    enabled: !!user,
  });
  
  const { data: historicalData } = useQuery({
    queryKey: ['historicalMonitorData'],
    queryFn: getHistoricalMonitorData,
    enabled: !!user,
  });

  const runMutation = useMutation({
    mutationFn: runMonitorSearch,
    onSuccess: () => {
      toast.success("Coleta de dados concluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['latestMonitorData'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Falha ao iniciar a coleta.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAllMonitorData,
    onSuccess: () => {
      toast.success("Todos os dados de monitoramento foram limpos!");
      queryClient.invalidateQueries({ queryKey: ['latestMonitorData'] });
      queryClient.invalidateQueries({ queryKey: ['historicalMonitorData'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Falha ao limpar os dados.");
    },
  });

  const handleRunMonitoring = () => runMutation.mutate();
  const handleDeleteData = () => {
    if (window.confirm("ATENÇÃO: Esta ação é irreversível e excluirá TODOS os dados de monitoramento, incluindo o histórico completo. Deseja continuar?")) {
      deleteMutation.mutate();
    }
  };

  const hasRelevantData = !!(latestData?.brand || latestData?.competitors);
  const hasHistoricalData = !!(historicalData?.brand?.length || historicalData?.competitors?.length);
  const hasAnyData = hasRelevantData || hasHistoricalData;
  const isMutating = runMutation.isPending || deleteMutation.isPending;

  if (authLoading || (isQueryLoading && !latestData)) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen text-red-500">Erro ao carregar os dados de monitoramento.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Monitoramento de Termos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe os resultados relevantes (agora) e históricos (passado) para sua marca e concorrentes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRunMonitoring} disabled={isMutating || hasRelevantData}>
            {runMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
            {runMutation.isPending ? 'Coletando...' : 'Coleta do Agora'}
          </Button>
          {user?.role === 'ADM' && hasAnyData && (
            <Button variant="destructive" onClick={handleDeleteData} disabled={isMutating}>
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deleteMutation.isPending ? 'Limpando...' : 'Limpar Todos os Dados'}
            </Button>
          )}
        </div>
      </div>

      {hasRelevantData && (
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>Coleta "do Agora" já Realizada</AlertTitle>
          <AlertDescription>
            Os dados abaixo são da última coleta de dados relevantes. Para realizar uma nova busca, é preciso limpar todos os dados existentes.
          </AlertDescription>
        </Alert>
      )}
      
      {!hasAnyData && !isQueryLoading && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Banco de Dados Vazio</AlertTitle>
          <AlertDescription>
            Nenhum dado de monitoramento encontrado. Inicie uma "Coleta do Agora" ou uma "Coleta Histórica" para começar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="relevant">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="relevant">Dados do Agora (Relevante)</TabsTrigger>
          <TabsTrigger value="historical">Dados do Passado (Histórico)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="relevant">
          <Tabs defaultValue="brand">
            <TabsList>
              <TabsTrigger value="brand">Marca</TabsTrigger>
              <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
            </TabsList>
            <TabsContent value="brand" className="mt-4">
              <ResultsDisplay data={latestData?.brand} isLoading={isQueryLoading || isMutating} />
            </TabsContent>
            <TabsContent value="competitors" className="mt-4">
              <ResultsDisplay data={latestData?.competitors} isLoading={isQueryLoading || isMutating} />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="historical">
          <HistoricalTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitorPage;
