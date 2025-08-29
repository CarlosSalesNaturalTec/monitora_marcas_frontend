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

// --- Tipos para Monitoramento ---

export interface HistoricalRunRequest {
  start_date: string; // Formato YYYY-MM-DD
}

export interface UnifiedMonitorResult {
  run_id: string;
  link: string;
  displayLink: string;
  title: string;
  snippet: string;
  htmlSnippet: string;
  status: string;
  search_type: "relevante" | "historico" | "continuo";
  search_group: 'brand' | 'competitors';
  collected_at: string;
  range_start?: string;
  range_end?: string;
}

export interface MonitorRunDetails {
  id: string;
  search_terms_query: string;
  search_group: 'brand' | 'competitors';
  search_type: "relevante" | "historico" | "continuo";
  total_results_found: number;
  collected_at: string;
  range_start?: string;
  range_end?: string;
  last_interruption_date?: string;
  historical_run_start_date?: string;
}

export interface RequestLog {
  run_id: string;
  search_group: string;
  page: number;
  results_count: number;
  timestamp: string;
  search_type: "relevante" | "historico" | "continuo";
  origin: string;
}

export interface MonitorSummary {
  total_runs: number;
  total_requests: number;
  total_results_saved: number;
  runs_by_type: Record<string, number>;
  results_by_group: Record<string, number>;
  latest_logs: RequestLog[];
  brand_search_query?: string;
  competitors_search_query?: string;
}

export interface HistoricalStatus {
  is_running: boolean;
  last_processed_date?: string; // YYYY-MM-DD
  original_start_date?: string; // YYYY-MM-DD
  message: string;
}

export interface SystemStatus {
  is_monitoring_running: boolean;
  current_task?: string;
  task_start_time?: string;
  last_completion_time?: string;
  message?: string;
}

export interface SystemLogTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface SystemLog {
  task: string;
  start_time: string;
  end_time: string | null;
  processed_count: number;
  status: string;
  error_message?: string;
  message?: string;
}

export interface ScraperStats {
  counts: {
    pending: number;
    scraper_skipped: number;
    relevance_failed: number;
    scraper_failed: number;
    scraper_ok: number;
  };
}

export interface NlpStats {
  counts: Record<string, number>;
}

export interface UpdateHistoricalStartDateData {
  new_start_date: string; // YYYY-MM-DD
}

// --- Funções de Monitoramento ---

export const runMonitorSearch = async (data: HistoricalRunRequest): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/monitor/run', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao iniciar a coleta de monitoramento:", error);
    throw error;
  }
};

export const getAllMonitorResults = async (): Promise<UnifiedMonitorResult[]> => {
  try {
    const response = await apiClient.get('/monitor/all-results');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar todos os resultados de monitoramento:", error);
    throw error;
  }
};

export const deleteAllMonitorData = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete('/monitor/all-data');
    return response.data;
  } catch (error) {
    console.error("Erro ao excluir todos os dados de monitoramento:", error);
    throw error;
  }
};

export const getMonitorSummary = async (): Promise<MonitorSummary> => {
  try {
    const response = await apiClient.get('/monitor/summary');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar o resumo do monitoramento:", error);
    throw error;
  }
};

export const getHistoricalStatus = async (): Promise<HistoricalStatus> => {
  try {
    const response = await apiClient.get('/monitor/historical-status');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar status da coleta histórica:", error);
    throw error;
  }
};

export const getSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const response = await apiClient.get('/monitor/system-status');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar status do sistema:", error);
    throw error;
  }
};

export const updateHistoricalStartDate = async (data: UpdateHistoricalStartDateData): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post('/monitor/update-historical-start-date', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar a data de início histórica:", error);
    throw error;
  }
};

export const getMonitorRunDetails = async (runId: string): Promise<MonitorRunDetails> => {
  try {
    const response = await apiClient.get(`/monitor/run/${runId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar detalhes da execução ${runId}:`, error);
    throw error;
  }
};

export const getSystemLogs = async (): Promise<SystemLog[]> => {
  try {
    const response = await apiClient.get('/monitor/system-logs');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar os logs do sistema:", error);
    throw error;
  }
};

export const getMonitorResultsByStatus = async (status: string): Promise<UnifiedMonitorResult[]> => {
  if (!status) return []; // Don't fetch if status is empty
  try {
    const response = await apiClient.get(`/monitor/results-by-status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar resultados com status ${status}:`, error);
    throw error;
  }
};

export const getScraperStats = async (): Promise<ScraperStats> => {
  try {
    const response = await apiClient.get('/monitor/scraper-stats');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar estatísticas do scraper:", error);
    throw error;
  }
};

export const getNlpStats = async (): Promise<NlpStats> => {
  try {
    const response = await apiClient.get('/monitor/nlp-stats');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar estatísticas do NLP:", error);
    throw error;
  }
};
