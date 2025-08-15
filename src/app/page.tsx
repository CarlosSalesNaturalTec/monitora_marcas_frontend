"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Função para buscar os dados do usuário no backend
const fetchUserData = async () => {
  const { data } = await apiClient.get('/users/me');
  return data;
};

function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { data: userData, error, isLoading: isUserQueryLoading } = useQuery({
    queryKey: ['userData', user?.uid], // A chave da query depende do UID do usuário
    queryFn: fetchUserData,
    enabled: !!user, // A query só será executada se o usuário estiver logado
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || isUserQueryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    // Isso é um fallback, o useEffect já deve ter redirecionado
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <main>
        <h2 className="text-xl mb-4">Bem-vindo, {user.email}!</h2>
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold">Dados da API:</h3>
          {error && <p className="text-red-500">Erro ao buscar dados: {error.message}</p>}
          {userData && (
            <pre className="mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {JSON.stringify(userData, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}

// Precisamos envolver o Dashboard com o QueryClientProvider
const queryClient = new QueryClient();

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
