// /frontend/src/components/instagram/service-accounts/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InstagramServiceAccount } from "@/services/instagram/serviceAccountService";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função auxiliar para renderizar o status com cores
const renderStatusBadge = (status: 'active' | 'session_expired' | 'banned') => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Ativa</Badge>;
    case 'session_expired':
      return <Badge variant="destructive">Sessão Expirada</Badge>;
    case 'banned':
      return <Badge variant="destructive" className="bg-red-700 hover:bg-red-800">Banida</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Definindo as props para as ações, para passar os handlers do componente cliente
export type ServiceAccountColumnsProps = {
  onUpdateSession: (accountId: string) => void;
  onDelete: (accountId: string) => void;
};

export const getColumns = ({ onUpdateSession, onDelete }: ServiceAccountColumnsProps): ColumnDef<InstagramServiceAccount>[] => [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Usuário
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => renderStatusBadge(row.original.status),
  },
  {
    accessorKey: "last_used_at",
    header: "Último Uso",
    cell: ({ row }) => {
      const lastUsed = row.original.last_used_at;
      return lastUsed ? format(new Date(lastUsed), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Nunca";
    },
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => {
        const createdAt = row.original.created_at;
        return format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR });
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onUpdateSession(account.id)}
            >
              Atualizar Sessão
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-600"
              onClick={() => onDelete(account.id)}
            >
              Deletar Conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
