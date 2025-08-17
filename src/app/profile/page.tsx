"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSearchTerms, saveSearchTerms, runSearchPreview, SearchTerms, TermGroup, PreviewResult } from '@/lib/api';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Lightbulb, Search, Loader2 } from 'lucide-react';
import { toast } from "react-hot-toast";


// --- Subcomponente para Gerenciar um Grupo de Termos ---

interface TermManagerProps {
  title: string;
  description: string;
  terms: string[];
  onTermsChange: (newTerms: string[]) => void;
  isReadOnly: boolean;
}

const TermManager: React.FC<TermManagerProps> = ({ title, description, terms, onTermsChange, isReadOnly }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTerm = () => {
    if (inputValue && !terms.includes(inputValue)) {
      onTermsChange([...terms, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveTerm = (termToRemove: string) => {
    onTermsChange(terms.filter(term => term !== termToRemove));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTerm();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isReadOnly && (
          <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Adicionar termo..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isReadOnly}
            />
            <Button type="button" onClick={handleAddTerm} disabled={isReadOnly}>Adicionar</Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {terms.length === 0 && <p className="text-sm text-muted-foreground">Nenhum termo cadastrado.</p>}
          {terms.map((term) => (
            <Badge key={term} variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
              {term}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(term)}
                  className="rounded-full hover:bg-muted-foreground/20 p-0.5 ml-1"
                  aria-label={`Remover ${term}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Subcomponente para a Aba de Preview ---

interface PreviewPaneProps {
  terms: SearchTerms;
  isReadOnly: boolean;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ terms, isReadOnly }) => {
  const [results, setResults] = useState<PreviewResult | null>(null);

  const previewMutation = useMutation({
    mutationFn: runSearchPreview,
    onSuccess: (data) => {
      setResults(data);
      toast.success("Busca de preview concluída!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Falha ao buscar preview.");
    },
  });

  const handleRunPreview = () => {
    if (isReadOnly) {
      toast.error("Você não tem permissão para executar esta ação.");
      return;
    }
    previewMutation.mutate(terms);
  };

  const hasBrandTerms = terms.brand.main_terms.length > 0 || terms.brand.synonyms.length > 0;
  const hasCompetitorTerms = terms.competitors.main_terms.length > 0 || terms.competitors.synonyms.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview dos Resultados da Busca</CardTitle>
        <CardDescription>
          Clique no botão abaixo para iniciar uma busca no Google com os termos
          configurados (incluindo alterações não salvas).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isReadOnly && (
          <Button type="button" onClick={handleRunPreview} disabled={previewMutation.isPending}>
            {previewMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {previewMutation.isPending ? 'Pesquisando...' : 'Iniciar Pesquisa'}
          </Button>
        )}

        {previewMutation.isError && (
            <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                    {previewMutation.error.message || "Ocorreu um problema ao buscar os resultados."}
                </AlertDescription>
            </Alert>
        )}

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resultados da Marca */}
            <div className="space-y-2">
              <h3 className="font-semibold">Resultados para "Marca"</h3>
              {hasBrandTerms ? (
                results.brand_results.length > 0 ? (
                  <ul className="space-y-4">
                    {results.brand_results.map((item, index) => (
                      <li key={`brand-${index}`} className="text-sm">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {item.link}
                        </a>
                        <div
                          className="mt-1 text-xs text-gray-600"
                          dangerouslySetInnerHTML={{ __html: item.htmlSnippet }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum termo de marca configurado para a busca.</p>
              )}
            </div>

            {/* Resultados dos Concorrentes */}
            <div className="space-y-2">
              <h3 className="font-semibold">Resultados para "Concorrentes"</h3>
              {hasCompetitorTerms ? (
                results.competitor_results.length > 0 ? (
                  <ul className="space-y-4">
                    {results.competitor_results.map((item, index) => (
                      <li key={`competitor-${index}`} className="text-sm">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {item.link}
                        </a>
                        <div
                          className="mt-1 text-xs text-gray-600"
                          dangerouslySetInnerHTML={{ __html: item.htmlSnippet }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
                )
              ) : (
                 <p className="text-sm text-muted-foreground">Nenhum termo de concorrente configurado para a busca.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


// --- Componente Principal da Página ---

const PlatformSettingsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    brand: { main_terms: [], synonyms: [], excluded_terms: [] },
    competitors: { main_terms: [], synonyms: [], excluded_terms: [] },
  });

  const isReadOnly = user?.role !== 'ADM';

  const { data: fetchedTerms, isLoading: termsLoading, isError } = useQuery({
    queryKey: ['searchTerms'],
    queryFn: getSearchTerms,
    enabled: !authLoading,
  });

  useEffect(() => {
    if (fetchedTerms) {
      setSearchTerms(fetchedTerms);
    }
  }, [fetchedTerms]);

  const mutation = useMutation({
    mutationFn: saveSearchTerms,
    onSuccess: (data) => {
      queryClient.setQueryData(['searchTerms'], data);
      toast.success("Termos de pesquisa salvos com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar os termos: ${error.message}`);
    },
  });

  const handleTermGroupChange = (section: 'brand' | 'competitors', group: keyof TermGroup, newTerms: string[]) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [group]: newTerms,
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate(searchTerms);
  };

  if (authLoading || termsLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando configurações...</div>;
  }
  
  if (isError) {
      return <div className="flex justify-center items-center h-screen text-red-500">Erro ao carregar os termos.</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold">Configurações da Plataforma</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os termos de pesquisa para o monitoramento.
                {isReadOnly && " (Modo de visualização)"}
              </p>
          </div>
          {!isReadOnly && (
              <Button type="submit" form="terms-form" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
          )}
      </div>

      <Alert className="mb-6">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Estratégia de Refinamento</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Comece amplo: use apenas os termos principais.</li>
            <li>Observe o ruído nos resultados (ex.: notícias sobre homônimos).</li>
            <li>Adicione termos de exclusão aos poucos.</li>
            <li>Inclua apelidos.</li>
            <li>Revise periodicamente os termos, pois a forma como a imprensa ou o público se refere ao parlamentar pode mudar (ex.: em época de eleição).</li>
          </ul>
        </AlertDescription>
      </Alert>

      <form id="terms-form" onSubmit={handleSubmit}>
        <Tabs defaultValue="brand">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-4">
            <TabsTrigger value="brand">Marca</TabsTrigger>
            <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brand">
            <div className="space-y-6">
              <TermManager
                title="Termos Principais"
                description="Nomes, produtos ou serviços principais da sua marca."
                terms={searchTerms.brand.main_terms}
                onTermsChange={(t) => handleTermGroupChange('brand', 'main_terms', t)}
                isReadOnly={isReadOnly}
              />
              <TermManager
                title="Sinônimos e Variações"
                description="Termos alternativos, abreviações ou erros de digitação comuns."
                terms={searchTerms.brand.synonyms}
                onTermsChange={(t) => handleTermGroupChange('brand', 'synonyms', t)}
                isReadOnly={isReadOnly}
              />
              <TermManager
                title="Termos a Excluir"
                description="Palavras que, quando presentes, devem fazer com que a menção seja ignorada."
                terms={searchTerms.brand.excluded_terms}
                onTermsChange={(t) => handleTermGroupChange('brand', 'excluded_terms', t)}
                isReadOnly={isReadOnly}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="competitors">
             <div className="space-y-6">
              <TermManager
                title="Termos Principais dos Concorrentes"
                description="Nomes, produtos ou serviços dos principais concorrentes."
                terms={searchTerms.competitors.main_terms}
                onTermsChange={(t) => handleTermGroupChange('competitors', 'main_terms', t)}
                isReadOnly={isReadOnly}
              />
              <TermManager
                title="Sinônimos e Variações dos Concorrentes"
                description="Termos alternativos ou abreviações para os concorrentes."
                terms={searchTerms.competitors.synonyms}
                onTermsChange={(t) => handleTermGroupChange('competitors', 'synonyms', t)}
                isReadOnly={isReadOnly}
              />
              <TermManager
                title="Termos a Excluir dos Concorrentes"
                description="Palavras para refinar a busca por menções de concorrentes."
                terms={searchTerms.competitors.excluded_terms}
                onTermsChange={(t) => handleTermGroupChange('competitors', 'excluded_terms', t)}
                isReadOnly={isReadOnly}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <PreviewPane terms={searchTerms} isReadOnly={isReadOnly} />
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};

export default PlatformSettingsPage;
