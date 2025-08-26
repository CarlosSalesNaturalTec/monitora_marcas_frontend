"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  runMonitorSearch, deleteAllMonitorData,
  getMonitorSummary, getAllMonitorResults, UnifiedMonitorResult,
  getHistoricalStatus, updateHistoricalStartDate, getMonitorRunDetails, MonitorRunDetails,
  getSystemStatus // Importar a nova função
} from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Loader2, PlayCircle, Info, Trash2, AlertTriangle, FileText, BarChart, Edit, Power } from 'lucide-react';
import { toast } from "react-hot-toast";
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Subcomponente: Conteúdo da Aba de Dados Unificados ---

const AllDataTabContent = () => {
  const { data, isLoading, isError } = useQuery<UnifiedMonitorResult[]>({
    queryKey: ['allMonitorResults'],
    queryFn: getAllMonitorResults,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Carregando todos os dados...</span></div>;
  }

  if (isError) {
    return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar os dados.</AlertDescription></Alert>;
  }
  
  if (!data || data.length === 0) {
    return <Alert><Info className="h-4 w-4" /><AlertTitle>Nenhum Dado Encontrado</AlertTitle><AlertDescription>Ainda não há dados de monitoramento. Vá para a aba "Coletas" para iniciar uma busca.</AlertDescription></Alert>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Resultados</CardTitle>
        <CardDescription>Lista consolidada dos últimos 200 resultados de coletas relevantes, históricas e contínuas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Run ID</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data da Coleta</TableHead>
              <TableHead>Snippet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={`${item.link}-${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="max-w-xs">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {item.displayLink}
                  </a>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span title={item.run_id}>{item.run_id.substring(0, 8)}...</span>
                </TableCell>
                <TableCell>
                  <Badge variant={item.search_group === 'brand' ? 'default' : 'outline'}>
                    {item.search_group === 'brand' ? 'Marca' : 'Concorrente'}
                  </Badge>
                </TableCell>
                <TableCell><Badge variant="secondary">{item.search_type}</Badge></TableCell>
                <TableCell>
                  {format(new Date(item.range_start || item.collected_at), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell><div dangerouslySetInnerHTML={{ __html: item.htmlSnippet }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- Subcomponente: Conteúdo da Aba Resumo e Logs ---

const SummaryTabContent = () => {
  const [selectedRun, setSelectedRun] = useState<MonitorRunDetails | null>(null);
  const [isRunLoading, setIsRunLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['monitorSummary'],
    queryFn: getMonitorSummary,
  });

  const handleLogRowClick = async (runId: string) => {
    if (!runId) return;
    setIsRunLoading(true);
    setSelectedRun({ id: runId } as MonitorRunDetails); 
    try {
      const runDetails = await getMonitorRunDetails(runId);
      setSelectedRun(runDetails);
    } catch (error) {
      toast.error("Não foi possível carregar os detalhes da execução.");
      setSelectedRun(null);
    } finally {
      setIsRunLoading(false);
    }
  };


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
    runs_by_type, results_by_group, latest_logs,
    brand_search_query, competitors_search_query
  } = data;

  return (
    <>
      <Dialog open={!!selectedRun} onOpenChange={(isOpen) => !isOpen && setSelectedRun(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Execução</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a execução de monitoramento selecionada.
            </DialogDescription>
          </DialogHeader>
          {isRunLoading || !selectedRun?.search_type ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="text-sm space-y-2 break-words">
              <p><strong>ID:</strong> <span className="font-mono text-xs">{selectedRun.id}</span></p>
              <p><strong>Tipo:</strong> <Badge variant="outline">{selectedRun.search_type}</Badge></p>
              <p><strong>Grupo:</strong> <Badge variant={selectedRun.search_group === 'brand' ? 'default' : 'secondary'}>{selectedRun.search_group === 'brand' ? 'Marca' : 'Concorrente'}</Badge></p>
              <p><strong>Data:</strong> {format(new Date(selectedRun.collected_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
              <p><strong>Resultados Encontrados:</strong> {selectedRun.total_results_found}</p>
              {selectedRun.range_start && <p><strong>Período da Busca:</strong> {format(new Date(selectedRun.range_start), "dd/MM/yyyy", { locale: ptBR })}</p>}
              <div>
                <p className="font-semibold">Query:</p>
                <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-md break-all block">{selectedRun.search_terms_query}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Termos de Busca Utilizados</CardTitle>
            <CardDescription>As queries de busca mais recentes utilizadas para marca e concorrentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-4">
                {brand_search_query ? (
                    <div>
                        <p className="font-semibold">Termos de busca para "Marca":</p>
                        <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-md break-all">{brand_search_query}</p>
                    </div>
                ) : <p>Nenhuma busca para "Marca" foi executada ainda.</p>}
                {competitors_search_query ? (
                    <div>
                        <p className="font-semibold">Termos de busca para "Concorrentes":</p>
                        <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-md break-all">{competitors_search_query}</p>
                    </div>
                ) : <p>Nenhuma busca para "Concorrentes" foi executada ainda.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs de Requisições Recentes</CardTitle>
            <CardDescription>Os 100 logs de requisição mais recentes. Clique em uma linha para ver os detalhes da execução.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Resultados</TableHead>
                  <TableHead>Tipo de Execução</TableHead>
                  <TableHead>Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latest_logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Nenhum log encontrado.</TableCell>
                  </TableRow>
                ) : (
                  latest_logs.map((log, index) => (
                    <TableRow key={`${log.run_id}-${log.page}-${index}`} onClick={() => handleLogRowClick(log.run_id)} className="cursor-pointer">
                      <TableCell>{format(new Date(log.timestamp), "dd/MM/yy HH:mm:ss", { locale: ptBR })}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]"><span title={log.run_id}>{log.run_id}</span></TableCell>
                      <TableCell>{log.search_group === 'brand' ? 'Marca' : 'Concorrente'}</TableCell>
                      <TableCell>{log.page}</TableCell>
                      <TableCell>{log.results_count}</TableCell>
                      <TableCell><Badge variant="outline">{log.search_type}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{log.origin}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// --- Subcomponente: Conteúdo da Aba Coletas ---

const CollectionsTabContent = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState('');
    const [newStartDate, setNewStartDate] = useState('');

    const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['monitorSummary'],
        queryFn: getMonitorSummary,
    });

    const { data: historicalStatus, isLoading: isStatusLoading } = useQuery({
        queryKey: ['historicalStatus'],
        queryFn: getHistoricalStatus,
        enabled: !!summaryData && summaryData.total_runs > 0,
    });

    const { data: systemStatus, isLoading: isSystemStatusLoading } = useQuery({
        queryKey: ['systemStatus'],
        queryFn: getSystemStatus,
        refetchInterval: (query) => {
            const data = query.state.data as { is_monitoring_running: boolean } | undefined;
            return data?.is_monitoring_running ? 5000 : false;
        },
    });

    useEffect(() => {
        if (historicalStatus?.original_start_date) {
            setNewStartDate(historicalStatus.original_start_date);
        }
    }, [historicalStatus]);

    const initialCollectionMutation = useMutation({
        mutationFn: runMonitorSearch,
        onSuccess: (data) => {
            toast.success(data.message || "Coleta iniciada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Ocorreu um erro ao iniciar a coleta.");
        },
    });

    const updateDateMutation = useMutation({
        mutationFn: updateHistoricalStartDate,
        onSuccess: (data) => {
            toast.success(data.message || "Data de início atualizada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['historicalStatus'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Ocorreu um erro ao atualizar a data.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAllMonitorData,
        onSuccess: () => {
            toast.success("Todos os dados de monitoramento foram limpos!");
            queryClient.invalidateQueries(); // Invalida todas as queries
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Falha ao limpar os dados.");
        },
    });

    const handleRunInitialCollection = () => {
        if (!startDate) {
            toast.error("Por favor, selecione uma data de início.");
            return;
        }
        const dateObj = new Date(startDate);
        if (!isValid(dateObj)) {
            toast.error("Data inválida. Use o formato AAAA-MM-DD.");
            return;
        }
        initialCollectionMutation.mutate({ start_date: startDate });
    };

    const handleUpdateStartDate = () => {
        if (!newStartDate) {
            toast.error("Por favor, selecione uma nova data de início.");
            return;
        }
        const dateObj = new Date(newStartDate);
        if (!isValid(dateObj)) {
            toast.error("Data inválida. Use o formato AAAA-MM-DD.");
            return;
        }
        updateDateMutation.mutate({ new_start_date: newStartDate });
    };

    const handleDeleteData = () => {
        if (window.confirm("ATENÇÃO: Esta ação é irreversível e excluirá TODOS os dados de monitoramento. Deseja continuar?")) {
            deleteMutation.mutate();
        }
    };

    const isLoading = isSummaryLoading || isStatusLoading || isSystemStatusLoading;
    const hasAnyData = summaryData ? summaryData.total_runs > 0 : false;
    const isTaskRunning = systemStatus?.is_monitoring_running ?? false;
    const isMutating = initialCollectionMutation.isPending || deleteMutation.isPending || updateDateMutation.isPending;

    if (isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Carregando status da coleta...</span></div>;
    }

    return (
        <div className="space-y-6">
            {isTaskRunning && (
                <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertTitle>
                        {systemStatus?.current_task || "Tarefa em Andamento"}
                    </AlertTitle>
                    <AlertDescription>
                        {systemStatus?.message || "O sistema está processando uma tarefa de coleta de dados. As ações nesta página estão desabilitadas até a conclusão."}
                    </AlertDescription>
                </Alert>
            )}

            {!hasAnyData ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Iniciar Primeira Coleta de Dados</CardTitle>
                        <CardDescription>
                            Este processo único buscará os dados mais recentes e iniciará a busca por dados históricos a partir da data fornecida. A continuação será automática e diária via agendamento no servidor.
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
                                    disabled={isMutating || isTaskRunning}
                                    max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]}
                                />
                            </div>
                            <Button onClick={handleRunInitialCollection} disabled={isMutating || isTaskRunning}>
                                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                {isMutating ? 'Iniciando...' : 'Iniciar Coleta'}
                            </Button>
                        </div>
                        {initialCollectionMutation.isError && (
                             <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Erro</AlertTitle>
                                <AlertDescription>{(initialCollectionMutation.error as any).response?.data?.detail || initialCollectionMutation.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Status da Coleta de Dados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                            <Power className="h-4 w-4 text-green-600" />
                            <AlertTitle>
                                {historicalStatus?.is_running ? "Busca Histórica em Andamento" : "Sistema Ativo"}
                            </AlertTitle>
                            <AlertDescription>
                                <p>A coleta de dados novos (últimas 24h) é executada automaticamente todos os dias.</p>
                                {historicalStatus?.original_start_date && (
                                    <p className="mt-2">
                                        A busca por dados passados foi configurada para ir até{' '}
                                        <strong>
                                            {format(new Date(historicalStatus.original_start_date.replace(/-/g, '/')), 'dd/MM/yyyy', { locale: ptBR })}
                                        </strong>.
                                    </p>
                                )}
                                <p className="mt-2 font-semibold">{historicalStatus?.message || "Carregando status da busca histórica..."}</p>
                            </AlertDescription>
                        </Alert>

                        {user?.role === 'ADM' && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2 text-base">Alterar Data de Início Histórica</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Selecione uma nova data para reiniciar a busca histórica. Isso fará com que o sistema busque novamente os dados a partir da data escolhida, respeitando os limites diários.
                                </p>
                                <div className="flex flex-col sm:flex-row items-end gap-4">
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="new-start-date">Nova Data de Início</Label>
                                        <Input
                                            type="date"
                                            id="new-start-date"
                                            value={newStartDate}
                                            onChange={(e) => setNewStartDate(e.target.value)}
                                            disabled={isMutating || isTaskRunning}
                                            max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]}
                                        />
                                    </div>
                                    <Button onClick={handleUpdateStartDate} disabled={isMutating || isTaskRunning} variant="secondary">
                                        {updateDateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
                                        {updateDateMutation.isPending ? 'Atualizando...' : 'Atualizar Data'}
                                    </Button>
                                </div>
                                {updateDateMutation.isError && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertTitle>Erro</AlertTitle>
                                        <AlertDescription>{(updateDateMutation.error as any).response?.data?.detail || updateDateMutation.error.message}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {user?.role === 'ADM' && (
                 <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle>Gerenciamento de Dados</CardTitle>
                        <CardDescription>
                            Ação perigosa que afeta todos os dados de monitoramento. Use com extremo cuidado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button variant="destructive" onClick={handleDeleteData} disabled={isMutating || isTaskRunning || !hasAnyData}>
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
  const { loading: authLoading } = useAuth();
  
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
    queryKey: ['monitorSummary'],
    queryFn: getMonitorSummary,
  });

  const hasAnyData = summaryData ? summaryData.total_runs > 0 : false;

  if (authLoading || isSummaryLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (isSummaryError) {
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
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-4">
          <TabsTrigger value="summary">Resumo e Logs</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="collections">Coletas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <SummaryTabContent />
        </TabsContent>

        <TabsContent value="data">
          <AllDataTabContent />
        </TabsContent>
        
        <TabsContent value="collections">
          <CollectionsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitorPage;