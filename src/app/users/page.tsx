"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, KeyRound, Trash2 } from 'lucide-react';

const UsersDashboardPage = () => {
  const { userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  // Proteção de Rota
  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  if (userRole !== 'ADM') {
    router.push('/');
    return <div className="flex justify-center items-center h-screen">Acesso Negado. Redirecionando...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gerenciamento de Usuários</h1>
      <p className="text-muted-foreground mb-8">Selecione uma das opções abaixo para gerenciar os usuários da plataforma.</p>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Card para Criar Usuário */}
        <Link href="/users/create">
          <Card className="hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <PlusCircle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Criar Usuário</CardTitle>
                <CardDescription>Adicionar um novo usuário ao sistema.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Card para Alterar Senha */}
        <Link href="/users/change-password">
          <Card className="hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <KeyRound className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Redefinir a senha de um usuário existente.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Card para Excluir Usuário */}
        <Link href="/users/delete">
          <Card className="hover:border-destructive hover:text-destructive transition-colors">
            <CardHeader className="flex flex-row items-center gap-4">
              <Trash2 className="h-8 w-8" />
              <div>
                <CardTitle>Excluir Usuário</CardTitle>
                <CardDescription>Remover um usuário permanentemente.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default UsersDashboardPage;