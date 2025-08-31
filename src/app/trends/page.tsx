import TrendsManager from "@/components/trends/TrendsManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrendsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Google Trends
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Termos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione ou remova termos-chave para monitoramento contínuo no Google Trends. 
            Apenas administradores podem realizar estas ações.
          </p>
          <TrendsManager />
        </CardContent>
      </Card>
    </div>
  );
}
