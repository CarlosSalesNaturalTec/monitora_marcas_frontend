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

// --- Tipos para o Perfil do Usuário ---

export interface UserProfile {
  uid: string;
  email: string;
  role: 'ADM' | 'OPERADOR' | null;
}

// --- Tipos para as Operações de Admin ---

export interface AdminUserCreateData {
  email: string;
  password?: string;
  role: 'ADM' | 'OPERADOR';
}

export interface AdminUserPasswordChangeData {
  email: string;
  new_password?: string;
}

export interface AdminUserDeleteData {
  email: string;
}

// --- Tipos para os Termos de Pesquisa ---

export interface TermGroup {
  main_terms: string[];
  synonyms: string[];
  excluded_terms: string[];
}

export interface SearchTerms {
  brand: TermGroup;
  competitors: TermGroup;
}

export interface SearchResultItem {
  link: string;
  htmlSnippet: string;
}

export interface PreviewResult {
  brand_results: SearchResultItem[];
  competitor_results: SearchResultItem[];
}

// --- Funções da API ---

export const getMyProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error;
  }
};

// --- Funções de Gerenciamento de Termos de Pesquisa ---

export const getSearchTerms = async (): Promise<SearchTerms> => {
  try {
    const response = await apiClient.get('/terms');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar termos de pesquisa:", error);
    throw error;
  }
};

export const saveSearchTerms = async (terms: SearchTerms): Promise<SearchTerms> => {
  try {
    const response = await apiClient.post('/terms', terms);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar termos de pesquisa:", error);
    throw error;
  }
};

export const runSearchPreview = async (terms: SearchTerms): Promise<PreviewResult> => {
  try {
    const response = await apiClient.post('/terms/preview', terms);
    return response.data;
  } catch (error) {
    console.error("Erro ao rodar o preview da busca:", error);
    throw error;
  }
};

// --- Funções de Gerenciamento de Usuários (Apenas para Admins) ---

export const adminCreateUser = async (userData: AdminUserCreateData) => {
    const response = await apiClient.post('/admin/create-user', userData);
    return response.data;
};

export const adminChangePassword = async (data: AdminUserPasswordChangeData) => {
    const response = await apiClient.post('/admin/change-password', data);
    return response.data;
};

export const adminDeleteUser = async (data: AdminUserDeleteData) => {
    const response = await apiClient.post('/admin/delete-user', data);
    return response.data;
};
