import { WhatsappUploadForm } from "@/components/whatsapp/whatsapp-upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WhatsappIngestionPage() {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Ingestão de Dados do WhatsApp</h1>
      <p className="text-muted-foreground">
        Faça o upload de arquivos .zip exportados de suas conversas do WhatsApp para análise.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo .ZIP</CardTitle>
          <CardDescription>
            Selecione o arquivo .zip exportado do WhatsApp. O sistema irá processar
            as mensagens e mídias em segundo plano. O nome do grupo será extraído
            automaticamente do nome do arquivo de texto contido no .zip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsappUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
