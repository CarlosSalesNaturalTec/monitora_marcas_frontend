// /frontend/src/components/instagram/targets/profiles-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MonitoredProfile } from "@/services/instagram/targetService";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

type ActionsProps = {
  profile: MonitoredProfile;
  onDelete: (username: string) => void;
  onStatusChange: (username: string, isActive: boolean) => void;
};

const ActionsCell = ({ profile, onDelete, onStatusChange }: ActionsProps) => {
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
        <DropdownMenuItem onClick={() => onDelete(profile.username)}>
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getProfilesColumns = (
  actions: Omit<ActionsProps, 'profile'>
): ColumnDef<MonitoredProfile>[] => [
  {
    accessorKey: "username",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Usuário
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
        const type = row.original.type;
        const variant: "default" | "secondary" | "outline" = 
            type === 'parlamentar' ? 'default' :
            type === 'concorrente' ? 'secondary' :
            'outline';
        return <Badge variant={variant}>{type}</Badge>
    }
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <div className="flex items-center space-x-2">
            <Switch
                id={`status-switch-${profile.id}`}
                checked={profile.is_active}
                onCheckedChange={(isChecked) => actions.onStatusChange(profile.username, isChecked)}
            />
            <label htmlFor={`status-switch-${profile.id}`}>{profile.is_active ? "Ativo" : "Inativo"}</label>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell profile={row.original} {...actions} />,
  },
];
