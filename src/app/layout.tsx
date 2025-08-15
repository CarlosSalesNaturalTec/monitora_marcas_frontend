import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Importa a fonte Inter
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

// Configura a fonte Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Listening Platform",
  description: "Monitoramento de Marcas e Social Listening",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* Aplica a classe da fonte ao body */}
      <body className={inter.className}>
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
