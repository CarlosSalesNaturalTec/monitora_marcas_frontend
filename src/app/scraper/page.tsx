"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMonitorResultsByStatus, UnifiedMonitorResult } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ScraperPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');

  const { data, isLoading, isError, isFetching } = useQuery<UnifiedMonitorResult[]>({
    queryKey: ['monitorResultsByStatus', selectedStatus],
    queryFn: () => getMonitorResultsByStatus(selectedStatus),
    enabled: !!selectedStatus, // Only run query if a status is selected
  });

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'reprocess', label: 'Reprocessar' },
    { value: 'scraper_failed', label: 'Falha no Scraper' },
    { value: 'scraper_skipped', label: 'Scraper Ignorado' },
    { value: 'relevance_failed', label: 'Falha de Relevância' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Scraper</h1>
          <p className="text-muted-foreground mt-1">
            Filtre e visualize os resultados do monitoramento por status do scraper.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultados por Status</CardTitle>
          <CardDescription>Selecione um status para ver a lista de URLs correspondentes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="status-select" className="font-medium">Status:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status-select" className="w-[250px]">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFetching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando dados...</span>
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>Não foi possível carregar os dados para o status selecionado.</AlertDescription>
            </Alert>
          ) : !data || data.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nenhum Resultado Encontrado</AlertTitle>
              <AlertDescription>Não há URLs com o status "{statusOptions.find(s => s.value === selectedStatus)?.label}" no momento.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">{item.status}</Badge>
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
                    <TableCell className="max-w-sm">
                      <div
                        className="truncate"
                        dangerouslySetInnerHTML={{ __html: item.htmlSnippet }}
                        title={item.snippet}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScraperPage;
