"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  runMonitorSearch, getLatestMonitorData, deleteAllMonitorData, MonitorData,
  getHistoricalMonitorData, runHistoricalMonitorSearch, HistoricalMonitorData,
  getMonitorSummary
} from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlayCircle, Info, Trash2, History, AlertTriangle, FileText, BarChart } from 'lucide-react';
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
          {`Nenhuma coleta histórica foi realizada para '${groupName}'. Vá para a aba 'Coletas' para iniciar uma.`}
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
  const { data: historicalData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['historicalMonitorData'],
    queryFn: getHistoricalMonitorData,
  });

  return (
    <div className="space-y-6">
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

// --- Subcomponente: Conteúdo da Aba Resumo e Logs ---

const SummaryTabContent = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['monitorSummary'],
    queryFn: getMonitorSummary,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Carregando resumo...</span></div>;
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Resumo</AlertTitle>
        <AlertDescription>
          Não foi possível buscar os dados de resumo e logs. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  const {
    total_runs, total_requests, total_results_saved,
    runs_by_type, results_by_group, latest_runs, latest_logs
  } = data;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_runs}</div>
            <p className="text-xs text-muted-foreground">
              {runs_by_type.relevante || 0} Relevante, {runs_by_type.historico || 0} Histórico, {runs_by_type.continuo || 0} Contínuo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_requests}</div>
            <p className="text-xs text-muted-foreground">Requisições à API do Google</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultados Salvos</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_results_saved}</div>
            <p className="text-xs text-muted-foreground">
              {results_by_group.brand || 0} Marca, {results_by_group.competitors || 0} Concorrentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Execuções</CardTitle>
          <CardDescription>As 50 execuções de monitoramento mais recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Query</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latest_runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhuma execução encontrada.</TableCell>
                </TableRow>
              ) : (
                latest_runs.map(run => (
                  <TableRow key={run.id}>
                    <TableCell>{format(new Date(run.collected_at), "dd/MM/yy HH:mm")}</TableCell>
                    <TableCell><Badge variant="outline">{run.search_type}</Badge></TableCell>
                    <TableCell>{run.search_group}</TableCell>
                    <TableCell>{run.total_results_found}</TableCell>
                    <TableCell className="max-w-xs truncate"><span title={run.search_terms_query}>{run.search_terms_query}</span></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Latest Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Requisições Recentes</CardTitle>
          <CardDescription>Os 100 logs de requisição mais recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Run ID</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Resultados na Página</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {latest_logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhum log encontrado.</TableCell>
                </TableRow>
              ) : (
                latest_logs.map((log, index) => (
                  <TableRow key={`${log.run_id}-${log.page}-${index}`}>
                    <TableCell>{format(new Date(log.timestamp), "dd/MM/yy HH:mm:ss")}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[100px]"><span title={log.run_id}>{log.run_id}</span></TableCell>
                    <TableCell>{log.search_group}</TableCell>
                    <TableCell>{log.page}</TableCell>
                    <TableCell>{log.results_count}</TableCell>
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

// --- Subcomponente: Conteúdo da Aba Coletas ---

const CollectionsTabContent = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState('');
    const [collectionStatus, setCollectionStatus] = useState('idle'); // idle, collecting, done, error
    const [statusMessage, setStatusMessage] = useState('');

    const { data: summaryData } = useQuery({
        queryKey: ['monitorSummary'],
        queryFn: getMonitorSummary,
    });

    const collectionMutation = useMutation({
        mutationFn: runMonitorSearch,
        onSuccess: (data) => {
            const message = (data as { message: string }).message || "Coleta concluída com sucesso!";
            setStatusMessage(message);
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['latestMonitorData'] });
            queryClient.invalidateQueries({ queryKey: ['historicalMonitorData'] });
            queryClient.invalidateQueries({ queryKey: ['monitorSummary'] });
            setCollectionStatus('done');
        },
        onError: (error: any) => {
            const detail = error.response?.data?.detail || "Ocorreu um erro durante a coleta.";
            setCollectionStatus('error');
            setStatusMessage(`Erro na coleta: ${detail}`);
            toast.error(`Erro na coleta: ${detail}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAllMonitorData,
        onSuccess: () => {
            toast.success("Todos os dados de monitoramento foram limpos!");
            queryClient.invalidateQueries({ queryKey: ['latestMonitorData'] });
            queryClient.invalidateQueries({ queryKey: ['historicalMonitorData'] });
            queryClient.invalidateQueries({ queryKey: ['monitorSummary'] });
            setCollectionStatus('idle');
            setStatusMessage('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Falha ao limpar os dados.");
        },
    });

    const handleRunCollection = () => {
        if (!startDate) {
            toast.error("Por favor, selecione uma data de início.");
            return;
        }
        const dateObj = new Date(startDate);
        if (!isValid(dateObj)) {
            toast.error("Data inválida. Use o formato AAAA-MM-DD.");
            return;
        }
        setCollectionStatus('collecting');
        setStatusMessage('Iniciando coleta... (Isso pode levar vários minutos)');
        collectionMutation.mutate({ start_date: startDate });
    };

    const handleDeleteData = () => {
        if (window.confirm("ATENÇÃO: Esta ação é irreversível e excluirá TODOS os dados de monitoramento. Deseja continuar?")) {
            deleteMutation.mutate();
        }
    };

    const hasAnyData = summaryData ? summaryData.total_runs > 0 : false;
    const isMutating = collectionMutation.isPending || deleteMutation.isPending;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Iniciar Nova Coleta de Dados</CardTitle>
                    <CardDescription>
                        Este processo executa duas etapas: primeiro, busca os dados mais recentes (do agora) e, em seguida, busca os dados históricos a partir da data de início fornecida.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="start-date">Data de Início da Busca Histórica</Label>
                            <Input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isMutating || hasAnyData}
                                max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]}
                            />
                        </div>
                        <Button onClick={handleRunCollection} disabled={isMutating || hasAnyData}>
                            {collectionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                            {collectionMutation.isPending ? 'Coletando...' : 'Iniciar Coleta Completa'}
                        </Button>
                    </div>
                     {collectionStatus !== 'idle' && (
                        <div className="mt-4">
                            <Alert variant={collectionStatus === 'error' ? 'destructive' : 'default'}>
                                <Info className="h-4 w-4" />
                                <AlertTitle>
                                    {collectionStatus === 'collecting' && 'Coleta em Andamento'}
                                    {collectionStatus === 'done' && 'Coleta Concluída'}
                                    {collectionStatus === 'error' && 'Erro na Coleta'}
                                </AlertTitle>
                                <AlertDescription>{statusMessage}</AlertDescription>
                            </Alert>
                        </div>
                     )}
                     {hasAnyData && !isMutating && (
                        <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Coleta de Dados já Realizada</AlertTitle>
                            <AlertDescription>
                                Já existem dados no sistema. Para realizar uma nova coleta completa, todos os dados existentes devem ser limpos primeiro.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {user?.role === 'ADM' && (
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle>Gerenciamento de Dados</CardTitle>
                        <CardDescription>
                            Ação perigosa que afeta todos os dados de monitoramento. Use com extremo cuidado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button variant="destructive" onClick={handleDeleteData} disabled={isMutating || !hasAnyData}>
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            {deleteMutation.isPending ? 'Limpando...' : 'Limpar Todos os Dados'}
                        </Button>
                        {!hasAnyData && (
                             <p className="text-sm text-muted-foreground mt-2">Não há dados para limpar.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};


// --- Componente Principal da Página ---

const MonitorPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: latestData, isLoading: isLatestLoading, isError: isLatestError } = useQuery({
    queryKey: ['latestMonitorData'],
    queryFn: getLatestMonitorData,
    enabled: !!user,
  });
  
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
    queryKey: ['monitorSummary'],
    queryFn: getMonitorSummary,
    enabled: !!user,
  });

  const hasAnyData = summaryData ? summaryData.total_runs > 0 : false;

  if (authLoading || (isSummaryLoading && !summaryData)) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (isLatestError || isSummaryError) {
    return <div className="flex justify-center items-center h-screen text-red-500">Erro ao carregar os dados de monitoramento.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Monitoramento de Termos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe os resultados das coletas de dados para sua marca e concorrentes.
          </p>
        </div>
      </div>
      
      {!hasAnyData && !isSummaryLoading && (
         <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Banco de Dados Vazio</AlertTitle>
          <AlertDescription>
            Nenhum dado de monitoramento encontrado. Vá para a aba "Coletas" para começar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-4 max-w-4xl mb-4">
          <TabsTrigger value="summary">Resumo e Logs</TabsTrigger>
          <TabsTrigger value="relevant">Dados do Agora (Relevante)</TabsTrigger>
          <TabsTrigger value="historical">Dados do Passado (Histórico)</TabsTrigger>
          <TabsTrigger value="collections">Coletas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <SummaryTabContent />
        </TabsContent>

        <TabsContent value="relevant">
          <Tabs defaultValue="brand">
            <TabsList>
              <TabsTrigger value="brand">Marca</TabsTrigger>
              <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
            </TabsList>
            <TabsContent value="brand" className="mt-4">
              <ResultsDisplay data={latestData?.brand} isLoading={isLatestLoading} />
            </TabsContent>
            <TabsContent value="competitors" className="mt-4">
              <ResultsDisplay data={latestData?.competitors} isLoading={isLatestLoading} />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="historical">
          <HistoricalTabContent />
        </TabsContent>

        <TabsContent value="collections">
          <CollectionsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitorPage;
