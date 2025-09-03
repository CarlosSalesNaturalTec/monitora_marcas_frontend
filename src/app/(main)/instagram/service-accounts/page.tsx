// /frontend/src/app/(main)/instagram/service-accounts/page.tsx
import { ServiceAccountClientPage } from "@/components/instagram/service-accounts/page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contas de Serviço - Instagram | Social Listening",
  description: "Gerencie as contas de serviço utilizadas para a coleta de dados do Instagram.",
};

export default function ServiceAccountsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Contas de Serviço - Instagram</h1>
      <p className="text-muted-foreground mb-8">
        Adicione, remova e atualize as contas do Instagram usadas para a coleta de dados.
        Mantenha as sessões ativas para garantir a continuidade do monitoramento.
      </p>
      <ServiceAccountClientPage />
    </div>
  );
}
