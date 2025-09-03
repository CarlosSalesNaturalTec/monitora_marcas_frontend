// /frontend/src/app/instagram/targets/page.tsx
import { TargetClientPage } from "@/components/instagram/targets/page-client";
import { Suspense } from "react";

export default function InstagramTargetsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Alvos do Instagram</h1>
      <Suspense fallback={<div>Carregando...</div>}>
        <TargetClientPage />
      </Suspense>
    </div>
  );
}
