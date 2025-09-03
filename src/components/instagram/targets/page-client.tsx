// /frontend/src/components/instagram/targets/page-client.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import {
  getMonitoredProfiles,
  addMonitoredProfile,
  updateProfileStatus,
  deleteMonitoredProfile,
  getMonitoredHashtags,
  addMonitoredHashtag,
  updateHashtagStatus,
  deleteMonitoredHashtag,
  MonitoredProfile,
  MonitoredHashtag,
} from "@/services/instagram/targetService";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "./data-table";
import { getProfilesColumns } from "./profiles-columns";
import { getHashtagsColumns } from "./hashtags-columns";

export function TargetClientPage() {
  const queryClient = useQueryClient();

  // --- State Management ---
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isHashtagDialogOpen, setIsHashtagDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'profile' | 'hashtag'; id: string } | null>(null);

  // Form state
  const [newProfileUsername, setNewProfileUsername] = useState("");
  const [newProfileType, setNewProfileType] = useState<'parlamentar' | 'concorrente' | 'midia'>('parlamentar');
  const [newHashtag, setNewHashtag] = useState("");

  // --- Data Fetching ---
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery<MonitoredProfile[]>({
    queryKey: ["monitoredProfiles"],
    queryFn: getMonitoredProfiles,
  });

  const { data: hashtags = [], isLoading: isLoadingHashtags } = useQuery<MonitoredHashtag[]>({
    queryKey: ["monitoredHashtags"],
    queryFn: getMonitoredHashtags,
  });

  // --- Mutations ---

  // Profiles
  const addProfileMutation = useMutation({
    mutationFn: () => addMonitoredProfile({ username: newProfileUsername, type: newProfileType }),
    onSuccess: () => {
      toast.success("Perfil adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["monitoredProfiles"] });
      setIsProfileDialogOpen(false);
      setNewProfileUsername("");
    },
    onError: (error: any) => toast.error(`Erro: ${error.response?.data?.detail || error.message}`),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (username: string) => deleteMonitoredProfile(username),
    onSuccess: () => {
      toast.success("Perfil deletado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["monitoredProfiles"] });
      setItemToDelete(null);
    },
    onError: (error: any) => toast.error(`Erro: ${error.response?.data?.detail || error.message}`),
  });

  const updateProfileStatusMutation = useMutation({
    mutationFn: ({ username, isActive }: { username: string; isActive: boolean }) => updateProfileStatus(username, isActive),
    onSuccess: () => {
      toast.success("Status do perfil atualizado.");
      queryClient.invalidateQueries({ queryKey: ["monitoredProfiles"] });
    },
    onError: (error: any) => toast.error(`Erro: ${error.response?.data?.detail || error.message}`),
  });

  // Hashtags
  const addHashtagMutation = useMutation({
    mutationFn: () => addMonitoredHashtag({ hashtag: newHashtag }),
    onSuccess: () => {
      toast.success("Hashtag adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["monitoredHashtags"] });
      setIsHashtagDialogOpen(false);
      setNewHashtag("");
    },
    onError: (error: any) => toast.error(`Erro: ${error.response?.data?.detail || error.message}`),
  });

  const deleteHashtagMutation = useMutation({
    mutationFn: (hashtag: string) => deleteMonitoredHashtag(hashtag),
    onSuccess: () => {
      toast.success("Hashtag deletada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["monitoredHashtags"] });
      setItemToDelete(null);
    },
    onError: (error: any) => toast.error(`Erro: ${error.response?.data?.detail || error.message}`),
  });

  const updateHashtagStatusMutation = useMutation({
    mutationFn: ({ hashtag, isActive }: { hashtag: string; isActive: boolean }) => updateHashtagStatus(hashtag, isActive),
    onSuccess: () => {
      toast.success("Status da hashtag atualizado.");
      queryClient.invalidateQueries({ queryKey: ["monitoredHashtags"] });
    },
    onError: (error: any) => toast.error(`Erro: ${error.response?.data?.detail || error.message}`),
  });

  // --- Column Definitions ---
  const profileColumns = useMemo(() => getProfilesColumns({
    onDelete: (username) => setItemToDelete({ type: 'profile', id: username }),
    onStatusChange: (username, isActive) => updateProfileStatusMutation.mutate({ username, isActive }),
  }), [updateProfileStatusMutation]);

  const hashtagColumns = useMemo(() => getHashtagsColumns({
    onDelete: (hashtag) => setItemToDelete({ type: 'hashtag', id: hashtag }),
    onStatusChange: (hashtag, isActive) => updateHashtagStatusMutation.mutate({ hashtag, isActive }),
  }), [updateHashtagStatusMutation]);

  const isLoading = isLoadingProfiles || isLoadingHashtags;

  return (
    <>
      {isLoading && <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /> Carregando dados...</div>}
      
      <Tabs defaultValue="profiles">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="profiles">Perfis Monitorados</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags Monitoradas</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <Button onClick={() => setIsProfileDialogOpen(true)}>Adicionar Perfil</Button>
            <Button onClick={() => setIsHashtagDialogOpen(true)}>Adicionar Hashtag</Button>
          </div>
        </div>

        <TabsContent value="profiles">
          <DataTable columns={profileColumns} data={profiles} />
        </TabsContent>
        <TabsContent value="hashtags">
          <DataTable columns={hashtagColumns} data={hashtags} />
        </TabsContent>
      </Tabs>

      {/* Add Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Perfil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="profile-username">Nome de Usuário</Label>
            <Input id="profile-username" value={newProfileUsername} onChange={(e) => setNewProfileUsername(e.target.value)} />
            <Label htmlFor="profile-type">Tipo</Label>
            <Select value={newProfileType} onValueChange={(v: any) => setNewProfileType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parlamentar">Parlamentar</SelectItem>
                <SelectItem value="concorrente">Concorrente</SelectItem>
                <SelectItem value="midia">Mídia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => addProfileMutation.mutate()} disabled={addProfileMutation.isPending || !newProfileUsername}>
              {addProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Hashtag Dialog */}
      <Dialog open={isHashtagDialogOpen} onOpenChange={setIsHashtagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Hashtag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="hashtag-name">Hashtag (sem #)</Label>
            <Input id="hashtag-name" value={newHashtag} onChange={(e) => setNewHashtag(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHashtagDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => addHashtagMutation.mutate()} disabled={addHashtagMutation.isPending || !newHashtag}>
              {addHashtagMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete?.type === 'profile') {
                  deleteProfileMutation.mutate(itemToDelete.id);
                } else if (itemToDelete?.type === 'hashtag') {
                  deleteHashtagMutation.mutate(itemToDelete.id);
                }
              }}
              disabled={deleteProfileMutation.isPending || deleteHashtagMutation.isPending}
            >
              {(deleteProfileMutation.isPending || deleteHashtagMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
