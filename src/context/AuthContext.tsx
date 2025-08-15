"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Define o tipo para os valores do contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  idToken: string | null;
  userRole: string | null; // Adiciona o role do usuário
  signOut: () => Promise<void>;
}

// Cria o Contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  idToken: null,
  userRole: null,
  signOut: async () => {},
});

// Define as props do provedor
interface AuthProviderProps {
  children: ReactNode;
}

// Cria o componente Provedor
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const tokenResult = await user.getIdTokenResult();
        setIdToken(tokenResult.token);
        
        // Busca o 'role' diretamente das custom claims do token
        const userRoleFromClaims = tokenResult.claims.role as string | undefined;
        setUserRole(userRoleFromClaims || null);

      } else {
        setUser(null);
        setIdToken(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserRole(null); // Limpa o role no logout
  };

  const value = { user, loading, idToken, userRole, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};
