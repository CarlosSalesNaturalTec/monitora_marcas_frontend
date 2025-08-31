"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEntitiesCloud, getMentions } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

interface TabProps {
  searchGroup: string;
  days: number;
}

// Componente de Carregamento
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-40">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Componente de Erro
const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Erro</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

// Tabela de Menções
const MentionsTable = ({ searchGroup, days, entity, page, setPage }: TabProps & { entity: string | null, page: number, setPage: (page: number) => void }) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['mentions', searchGroup, days, page, entity],
        queryFn: () => getMentions(searchGroup, days, page, entity),
        keepPreviousData: true,
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorAlert message={error.message} />;

    const sentimentVariant = (sentiment: string) => {
        switch (sentiment) {
            case 'positivo': return 'success';
            case 'negativo': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Menção</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Sentimento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.mentions.map((mention, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <a href={mention.link} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                                        {mention.title}
                                    </a>
                                    <p className="text-sm text-muted-foreground truncate">{mention.snippet}</p>
                                </TableCell>
                                <TableCell>{new Date(mention.publish_date).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>
                                    <Badge variant={sentimentVariant(mention.sentiment)}>
                                        {mention.sentiment} ({mention.sentiment_score.toFixed(2)})
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data?.total_pages}
                >
                    Próxima
                </Button>
            </div>
        </div>
    );
};


export default function TabAnalisePautas({ searchGroup, days }: TabProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleEntityClick = (entity: string) => {
    setSelectedEntity(entity);
    setPage(1); // Reset page when entity changes
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Nuvem de Entidades Principais</CardTitle>
          <CardDescription>Clique em uma entidade para filtrar as menções.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder para a Nuvem de Palavras */}
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
            <p className="text-muted-foreground text-center p-4">
                Componente de Nuvem de Palavras a ser implementado.
                <br/><br/>
                <Button onClick={() => handleEntityClick('Exemplo')}>Filtrar por "Exemplo"</Button>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tabela de Menções Relevantes</CardTitle>
          <CardDescription>
            {selectedEntity ? `Mostrando menções para a entidade: "${selectedEntity}"` : 'Mostrando todas as menções.'}
            {selectedEntity && <Button variant="link" onClick={() => setSelectedEntity(null)}>Limpar filtro</Button>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MentionsTable searchGroup={searchGroup} days={days} entity={selectedEntity} page={page} setPage={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
