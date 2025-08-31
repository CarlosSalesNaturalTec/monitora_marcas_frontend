"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrendTerms, addTrendTerm, deleteTrendTerm } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TrendTerm {
  id: string;
  term: string;
  is_active: boolean;
}

export default function TrendsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newTerm, setNewTerm] = useState("");

  const { data: terms, isLoading, isError } = useQuery<TrendTerm[]>({
    queryKey: ["trendTerms"],
    queryFn: getTrendTerms,
  });

  const addMutation = useMutation({
    mutationFn: () => addTrendTerm({ term: newTerm, is_active: true }),
    onSuccess: () => {
      toast.success("Termo adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trendTerms"] });
      setNewTerm("");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || "Erro ao adicionar o termo.";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (termId: string) => deleteTrendTerm(termId),
    onSuccess: () => {
      toast.success("Termo removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trendTerms"] });
    },
    onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || "Erro ao remover o termo.";
        toast.error(errorMessage);
    },
  });

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTerm.trim()) {
      addMutation.mutate();
    }
  };
  
  const isAdmin = user?.role === 'ADM';

  return (
    <div className="space-y-6">
      {isAdmin && (
        <form onSubmit={handleAddTerm} className="flex items-center gap-2">
          <Input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Novo termo-chave"
            className="max-w-xs"
            disabled={addMutation.isPending}
          />
          <Button type="submit" disabled={addMutation.isPending || !newTerm.trim()}>
            {addMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Adicionar
          </Button>
        </form>
      )}

      {isLoading && <p>Carregando termos...</p>}
      {isError && <p className="text-red-500">Erro ao carregar os termos.</p>}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Termo</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms && terms.length > 0 ? (
              terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">{term.term}</TableCell>
                  <TableCell>{term.is_active ? "Ativo" : "Inativo"}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={deleteMutation.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso removerá permanentemente o termo
                              <span className="font-bold"> &quot;{term.term}&quot; </span>
                              do monitoramento.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(term.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar Remoção
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 3 : 2} className="h-24 text-center">
                  Nenhum termo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
