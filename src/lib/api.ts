import axios from 'axios';
import { auth } from './firebase';

// A URL da API será definida pela variável de ambiente em produção,
// ou usará localhost como padrão para desenvolvimento.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar o token de autenticação a cada requisição
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      // Força a atualização do token se ele estiver expirado
      const token = await user.getIdToken(true);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

// --- Tipos para o CRUD de Usuários ---

export interface User {
  uid: string;
  email: string;
  role: 'ADM' | 'OPERADOR' | null;
  disabled: boolean;
}

export interface UserCreateData {
  email: string;
  password?: string; // Opcional no frontend, obrigatório no backend
  role: 'ADM' | 'OPERADOR';
}

export interface UserUpdateData {
    role: 'ADM' | 'OPERADOR';
}


// --- Funções da API ---

export const getMyProfile = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error;
  }
};

// --- Funções do CRUD de Usuários (Apenas para Admins) ---

export const listUsers = async (): Promise<User[]> => {
    try {
        const response = await apiClient.get('/users');
        return response.data;
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        throw error;
    }
};

export const createUser = async (userData: UserCreateData): Promise<User> => {
    try {
        const response = await apiClient.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        throw error;
    }
};

export const updateUserRole = async (uid: string, userData: UserUpdateData): Promise<User> => {
    try {
        const response = await apiClient.put(`/users/${uid}`, userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        throw error;
    }
};

export const deleteUser = async (uid: string): Promise<void> => {
    try {
        await apiClient.delete(`/users/${uid}`);
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        throw error;
    }
};
