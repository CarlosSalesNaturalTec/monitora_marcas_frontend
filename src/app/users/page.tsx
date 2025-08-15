"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';

import { listUsers, createUser, updateUserRole, deleteUser, User, UserCreateData, UserUpdateData } from '@/lib/api';
import { UserTable } from '@/components/users/UserTable';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const UsersPage = () => {
  const { userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redireciona se o usuário não for ADM
  if (!authLoading && userRole !== 'ADM') {
    router.push('/');
  }

  // Query para buscar os usuários
  const { data: users = [], isLoading, isError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: !authLoading && userRole === 'ADM',
  });

  // Mutação para criar usuário
  const createUserMutation = useMutation({
    mutationFn: (newUserData: UserCreateData) => createUser(newUserData),
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Falha ao criar usuário.');
    },
  });

  // Mutação para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UserUpdateData }) => updateUserRole(uid, data),
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Falha ao atualizar usuário.');
    },
  });

  // Mutação para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: (uid: string) => deleteUser(uid),
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Falha ao excluir usuário.');
    },
  });

  // Handlers para abrir os diálogos
  const handleOpenCreateForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleOpenDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  // Handler para submissão do formulário
  const handleFormSubmit = (data: UserCreateData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ uid: selectedUser.uid, data: { role: data.role } });
    } else {
      createUserMutation.mutate(data);
    }
  };

  // Handler para confirmação de exclusão
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.uid);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (userRole !== 'ADM') {
    return <div className="flex justify-center items-center h-screen">Acesso Negado.</div>;
  }
  
  if (isError) {
    return <div className="flex justify-center items-center h-screen text-red-500">Ocorreu um erro ao carregar os usuários.</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Usuários</h1>
          <Button onClick={handleOpenCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>
        
        <UserTable 
          users={users} 
          onEdit={handleOpenEditForm} 
          onDelete={(uid) => handleOpenDeleteConfirm(users.find(u => u.uid === uid)!)} 
        />
      </div>

      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />

      <DeleteUserDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        userEmail={selectedUser?.email}
      />
    </>
  );
};

export default UsersPage;