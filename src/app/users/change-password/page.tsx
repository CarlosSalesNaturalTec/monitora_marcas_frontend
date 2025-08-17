"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { adminChangePassword } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const ChangePasswordPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: adminChangePassword,
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      setEmail('');
      setNewPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Falha ao alterar senha.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, new_password: newPassword });
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
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Alterar Senha de Usuário</CardTitle>
              <CardDescription>Defina uma nova senha para um usuário existente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Usuário</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="secondary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
};

export default ChangePasswordPage;
