"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRisingQueries, getTrendsComparison } from '@/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

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

// Tabela de Buscas em Ascensão
const RisingQueriesTable = ({ searchGroup }: { searchGroup: string }) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['risingQueries', searchGroup],
        queryFn: () => getRisingQueries(searchGroup),
    });

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorAlert message={error.message} />;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Buscas em Ascensão (Rising Queries)</CardTitle>
                <CardDescription>Termos de busca com crescimento súbito e significativo.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Busca</TableHead>
                            <TableHead>Crescimento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.queries.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.query}</TableCell>
                                <TableCell>{item.formatted_value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

// Gráfico de Análise Comparativa
const ComparisonChart = ({ days }: { days: number }) => {
    const [terms, setTerms] = useState<string[]>(['Parlamentar A', 'Concorrente B']);
    const [inputValue, setInputValue] = useState('');

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['trendsComparison', terms, days],
        queryFn: () => getTrendsComparison(terms, days),
        enabled: false, // Don't fetch on mount
    });

    const handleCompare = () => {
        if (terms.length > 0) {
            refetch();
        }
    };

    const addTerm = () => {
        if (inputValue && !terms.includes(inputValue)) {
            setTerms([...terms, inputValue]);
            setInputValue('');
        }
    };
    
    const removeTerm = (termToRemove: string) => {
        setTerms(terms.filter(term => term !== termToRemove));
    };

    // Process data for Recharts
    const chartData = data?.comparison_data[0]?.data.map((point, index) => {
        const entry: { [key: string]: any } = {
            date: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        };
        data.comparison_data.forEach(series => {
            entry[series.term] = series.data[index]?.value || 0;
        });
        return entry;
    });

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análise Comparativa de Interesse</CardTitle>
                <CardDescription>Compare o interesse de busca entre diferentes termos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Input 
                        placeholder="Adicionar termo" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={addTerm}>Adicionar</Button>
                    <Button onClick={handleCompare} disabled={isLoading}>Comparar</Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {terms.map(term => (
                        <div key={term} className="flex items-center gap-1 bg-secondary p-1 rounded">
                            <span>{term}</span>
                            <Button variant="ghost" size="sm" onClick={() => removeTerm(term)}>x</Button>
                        </div>
                    ))}
                </div>

                {isLoading && <LoadingSpinner />}
                {isError && <ErrorAlert message={(error as Error).message} />}
                {data && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {data.comparison_data.map((series, i) => (
                                <Line key={series.term} type="monotone" dataKey={series.term} stroke={colors[i % colors.length]} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};


export default function TabInteligenciaTrends({ searchGroup, days }: TabProps) {
  return (
    <div className="space-y-6">
      <RisingQueriesTable searchGroup={searchGroup} />
      <ComparisonChart days={days} />
    </div>
  );
}
