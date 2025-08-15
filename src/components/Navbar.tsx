"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Sistema</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => router.push("/users")}>
            Usuários
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleLogout}>Logout</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
