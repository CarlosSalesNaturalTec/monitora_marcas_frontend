"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { adminDeleteUser } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const DeleteUserPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso!');
      setEmail('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Falha ao excluir usuário.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Adicionar uma confirmação extra aqui seria uma boa prática
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${email}? Esta ação é irreversível.`)) {
      mutation.mutate({ email });
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  if (user?.role !== 'ADM') {
    router.push('/');
    return <div className="flex justify-center items-center h-screen">Acesso Negado.</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-2xl">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/users"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
          </Button>
        </div>
        <Card className="border-destructive">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Excluir Usuário</CardTitle>
              <CardDescription>Esta ação é permanente e não pode ser desfeita. O usuário será removido de forma irreversível.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="delete-email">Email do Usuário a ser Excluído</Label>
              <Input id="delete-email" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="destructive" disabled={mutation.isPending}>
                {mutation.isPending ? 'Excluindo...' : 'Excluir Usuário'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
};

export default DeleteUserPage;
