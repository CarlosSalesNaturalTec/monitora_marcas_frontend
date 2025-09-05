"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase"; // Importar a instância de auth do Firebase
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";

export function WhatsappUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth(); 

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.name.toLowerCase().endsWith('.zip')) {
        setFile(selectedFile);
      } else {
        setFile(null);
        toast.error("Arquivo Inválido. Por favor, selecione um arquivo .zip.");
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // A verificação 'user' garante que nosso perfil customizado foi carregado.
    // A verificação 'auth.currentUser' garante que o usuário do Firebase está disponível.
    if (!file || !user || !auth.currentUser) {
      toast.error("Nenhum arquivo selecionado ou usuário não autenticado.");
      return;
    }

    setIsUploading(true);

    try {
      // Obter o token diretamente do usuário atual do Firebase
      const idToken = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || "http://127.0.0.1:8080";
      
      await axios.post(`${apiUrl}/ingest/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${idToken}`,
        },
      });

      toast.success(`O arquivo "${file.name}" foi enviado e está sendo processado.`);
      
      const form = event.target as HTMLFormElement;
      form.reset();
      setFile(null);

    } catch (error) {
      console.error("Erro detalhado no upload:", error); // Adicionado para depuração
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.detail || "Falha ao enviar o arquivo.";
      } else if (error instanceof Error) {
        errorMessage = `Erro no cliente: ${error.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="whatsapp-zip">Arquivo .zip</Label>
        <Input
          id="whatsapp-zip"
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <Button type="submit" disabled={!file || isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Enviar Arquivo
          </>
        )}
      </Button>
    </form>
  );
}
