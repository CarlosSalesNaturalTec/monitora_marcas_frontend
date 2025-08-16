"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Interface para nosso objeto de usuário customizado
export interface AppUser {
  uid: string;
  email: string;
  role: 'ADM' | 'OPERADOR' | null;
}

// Tipo para os valores do contexto
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Cria o Contexto
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  signOut: async () => {},
});

// Componente Provedor
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Força a atualização do token para obter as claims mais recentes
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        
        // Extrai o 'role' das custom claims
        const roleFromClaims = tokenResult.claims.role as AppUser['role'] || null;

        // Monta nosso objeto de usuário customizado
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          role: roleFromClaims,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Limpa o listener
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = { user, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado
export const useAuth = () => {
  return useContext(AuthContext);
};