// src/app/dashboard/analytics/page.tsx
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AuthProvider from '@/context/AuthContext'; // Supondo que você tenha um AuthProvider
import HydratedQueryProvider from '@/context/HydratedQueryProvider';

export default function AnalyticsPage() {
  return (
    <AuthProvider>
        <HydratedQueryProvider>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Dashboard de Análise de Sentimento</h1>
                <AnalyticsDashboard />
            </div>
        </HydratedQueryProvider>
    </AuthProvider>
  );
}
