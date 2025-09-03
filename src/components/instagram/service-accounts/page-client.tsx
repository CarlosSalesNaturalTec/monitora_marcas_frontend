// /frontend/src/components/instagram/service-accounts/page-client.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getServiceAccounts, 
  deleteServiceAccount,
  addServiceAccount,
  updateServiceAccountSession,
  InstagramServiceAccount
} from "@/services/instagram/serviceAccountService";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function ServiceAccountClientPage() {
  const queryClient = useQueryClient();

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State for selected account
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // State for forms
  const [newUsername, setNewUsername] = useState("");
  const [sessionFile, setSessionFile] = useState<File | null>(null);

  // Fetching data
  const { data: accounts = [], isLoading, isError } = useQuery<InstagramServiceAccount[]>({
    queryKey: ["instagramServiceAccounts"],
    queryFn: getServiceAccounts,
  });

  // Mutation for adding an account
  const addMutation = useMutation({
    mutationFn: () => {
      if (!sessionFile) throw new Error("Arquivo de sessão é obrigatório.");
      return addServiceAccount(newUsername, sessionFile);
    },
    onSuccess: () => {
      toast.success("Nova conta de serviço adicionada.");
      queryClient.invalidateQueries({ queryKey: ["instagramServiceAccounts"] });
      setIsAddDialogOpen(false);
      setNewUsername("");
      setSessionFile(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar conta: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Mutation for updating a session
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!sessionFile || !selectedAccountId) throw new Error("Arquivo de sessão é obrigatório.");
      return updateServiceAccountSession(selectedAccountId, sessionFile);
    },
    onSuccess: () => {
      toast.success("Sessão da conta atualizada.");
      queryClient.invalidateQueries({ queryKey: ["instagramServiceAccounts"] });
      setIsUpdateDialogOpen(false);
      setSelectedAccountId(null);
      setSessionFile(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar sessão: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Mutation for deleting an account
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedAccountId) throw new Error("Nenhuma conta selecionada.");
      return deleteServiceAccount(selectedAccountId);
    },
    onSuccess: () => {
      toast.success("Conta de serviço deletada.");
      queryClient.invalidateQueries({ queryKey: ["instagramServiceAccounts"] });
      setIsDeleteDialogOpen(false);
      setSelectedAccountId(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao deletar conta: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Handlers for column actions
  const handleUpdateSession = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsDeleteDialogOpen(true);
  };

  const columns = useMemo(() => getColumns({ onUpdateSession: handleUpdateSession, onDelete: handleDelete }), []);

  if (isLoading) {
    return <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /> Carregando...</div>;
  }

  if (isError) {
    return <div className="text-red-500">Erro ao carregar os dados. Tente novamente mais tarde.</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddDialogOpen(true)}>Adicionar Nova Conta</Button>
      </div>
      <DataTable columns={columns} data={accounts} />

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Conta de Serviço</DialogTitle>
            <DialogDescription>
              Forneça o nome de usuário e o arquivo de sessão do Instaloader.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Usuário</Label>
              <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionFile" className="text-right">Arquivo de Sessão</Label>
              <Input id="sessionFile" type="file" onChange={(e) => setSessionFile(e.target.files?.[0] || null)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !newUsername || !sessionFile}>
              {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Session Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Sessão</DialogTitle>
            <DialogDescription>
              Faça o upload de um novo arquivo de sessão para a conta selecionada. Isso reativará a conta se a sessão estiver expirada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="updateSessionFile" className="text-right">Novo Arquivo</Label>
                <Input id="updateSessionFile" type="file" onChange={(e) => setSessionFile(e.target.files?.[0] || null)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !sessionFile}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar esta conta de serviço? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
