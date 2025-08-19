"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runMonitorSearch, getLatestMonitorData, deleteLatestMonitorData, MonitorData } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle, Info, Trash2 } from 'lucide-react';
import { toast } from "react-hot-toast";
import { format } from 'date-fns';

// --- Subcomponente para Exibir os Resultados ---

interface ResultsDisplayProps {
  data: MonitorData | undefined;
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <p>Carregando dados...</p>;
  }

  if (!data) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Nenhuma Coleta Encontrada</AlertTitle>
        <AlertDescription>
          Ainda não foi realizada nenhuma coleta de dados para este grupo. Clique em "Iniciar Nova Coleta" para buscar os dados mais recentes.
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


// --- Componente Principal da Página ---

const MonitorPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar os dados da última coleta
  const { data: latestData, isLoading: isQueryLoading, isError } = useQuery({
    queryKey: ['latestMonitorData'],
    queryFn: getLatestMonitorData,
    enabled: !!user, // Só executa se o usuário estiver logado
  });

  // Mutation para iniciar uma nova coleta
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

  // Mutation para excluir a coleta existente
  const deleteMutation = useMutation({
    mutationFn: deleteLatestMonitorData,
    onSuccess: () => {
      toast.success("Dados da coleta anterior foram limpos!");
      queryClient.invalidateQueries({ queryKey: ['latestMonitorData'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Falha ao limpar os dados.");
    },
  });

  const handleRunMonitoring = () => {
    runMutation.mutate();
  };

  const handleDeleteData = () => {
    if (window.confirm("Tem certeza de que deseja excluir os dados da última coleta? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate();
    }
  };

  // Verifica se já existe alguma coleta para desabilitar o botão
  const hasExistingData = !!(latestData?.brand || latestData?.competitors);
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
            Acompanhe os resultados relevantes para sua marca e concorrentes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRunMonitoring} 
            disabled={isMutating || hasExistingData}
          >
            {runMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {runMutation.isPending ? 'Coletando...' : 'Iniciar Nova Coleta'}
          </Button>
          {hasExistingData && (
            <Button 
              variant="destructive"
              onClick={handleDeleteData} 
              disabled={isMutating}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleteMutation.isPending ? 'Limpando...' : 'Limpar Coleta'}
            </Button>
          )}
        </div>
      </div>

      {hasExistingData && (
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle>Coleta já Realizada</AlertTitle>
          <AlertDescription>
            Os dados abaixo são da última coleta. Para realizar uma nova busca, clique em "Limpar Coleta".
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="relevant">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="relevant">Dados do Agora (Relevante)</TabsTrigger>
          <TabsTrigger value="historical" disabled>Dados do Passado (Histórico)</TabsTrigger>
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
          {/* Conteúdo para a Etapa 02 será adicionado aqui */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitorPage;