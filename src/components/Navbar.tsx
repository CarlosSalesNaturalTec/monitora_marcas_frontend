"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth(); // Alterado: usa 'user' em vez de 'userRole'
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  // A Navbar só deve ser renderizada se o usuário existir
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Social Listening
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Acesso ao Dashboard para qualquer usuário logado */}
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/analytics">Analytics</Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  Sistema
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">                
                {user.role === 'ADM' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Termos de Pesquisa</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/trends">Google Trends</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/monitor">Buscas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/scraper">Scraper</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/nlp">NLP</Link>
                </DropdownMenuItem>                
                <DropdownMenuSeparator />
                {user.role === 'ADM' && (
                  <>                   
                    <DropdownMenuItem asChild>
                      <Link href="/users">Usuários</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
