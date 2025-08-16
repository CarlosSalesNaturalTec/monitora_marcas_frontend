"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { adminCreateUser } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const CreateUserPage = () => {
  const { userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADM' | 'OPERADOR'>('OPERADOR');

  const mutation = useMutation({
    mutationFn: adminCreateUser,
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!');
      setEmail('');
      setPassword('');
      setRole('OPERADOR');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Falha ao criar usuário.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password, role });
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  if (userRole !== 'ADM') {
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
              <CardTitle>Criar Novo Usuário</CardTitle>
              <CardDescription>Crie um novo acesso para a plataforma preenchendo os campos abaixo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Permissão</Label>
                <Select onValueChange={(value: 'ADM' | 'OPERADOR') => setRole(value)} defaultValue={role}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERADOR">Operador</SelectItem>
                    <SelectItem value="ADM">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreateUserPage;
