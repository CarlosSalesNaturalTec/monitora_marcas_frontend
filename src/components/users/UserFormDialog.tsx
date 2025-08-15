"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { User, UserCreateData } from "@/lib/api";

// Esquema de validação
const formSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }).optional().or(z.literal('')),
  role: z.enum(["ADM", "OPERADOR"], { message: "A permissão é obrigatória." }),
});

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserCreateData) => void;
  user: User | null; // Se for nulo, é criação. Se não, é edição.
}

export function UserFormDialog({ isOpen, onClose, onSubmit, user }: UserFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "OPERADOR",
    },
  });

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setValue("email", user.email);
      setValue("role", user.role || "OPERADOR");
    } else {
      reset(); // Limpa o formulário para o modo de criação
    }
  }, [user, setValue, reset]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Remove a senha se não for fornecida (importante para edição)
    if (!data.password) {
      delete data.password;
    }
    onSubmit(data as UserCreateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Altere a permissão do usuário."
              : "Preencha os detalhes para criar um novo usuário."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" {...register("email")} className="col-span-3" disabled={isEditMode} />
            {errors.email && <p className="col-span-4 text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          {!isEditMode && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password"className="text-right">Senha</Label>
              <Input id="password" type="password" {...register("password")} className="col-span-3" />
              {errors.password && <p className="col-span-4 text-red-500 text-sm">{errors.password.message}</p>}
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Permissão</Label>
            <Select onValueChange={(value) => setValue("role", value as "ADM" | "OPERADOR")} defaultValue={user?.role || "OPERADOR"}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADM">Administrador (ADM)</SelectItem>
                <SelectItem value="OPERADOR">Operador</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="col-span-4 text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
