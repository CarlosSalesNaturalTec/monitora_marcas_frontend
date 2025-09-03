// /frontend/src/components/instagram/targets/hashtags-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MonitoredHashtag } from "@/services/instagram/targetService";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

type ActionsProps = {
  hashtag: MonitoredHashtag;
  onDelete: (hashtag: string) => void;
  onStatusChange: (hashtag: string, isActive: boolean) => void;
};

const ActionsCell = ({ hashtag, onDelete }: ActionsProps) => {
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
        <DropdownMenuItem onClick={() => onDelete(hashtag.hashtag)}>
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getHashtagsColumns = (
  actions: Omit<ActionsProps, 'hashtag'>
): ColumnDef<MonitoredHashtag>[] => [
  {
    accessorKey: "hashtag",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Hashtag
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => `#${row.original.hashtag}`
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const hashtag = row.original;
      return (
        <div className="flex items-center space-x-2">
            <Switch
                id={`status-switch-${hashtag.id}`}
                checked={hashtag.is_active}
                onCheckedChange={(isChecked) => actions.onStatusChange(hashtag.hashtag, isChecked)}
            />
            <label htmlFor={`status-switch-${hashtag.id}`}>{hashtag.is_active ? "Ativo" : "Inativo"}</label>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell hashtag={row.original} {...actions} />,
  },
];
