// /frontend/src/services/instagram/serviceAccountService.ts
import apiClient from '@/lib/api';

// Tipagem alinhada com o schema Pydantic do backend
export interface InstagramServiceAccount {
  id: string;
  username: string;
  status: 'active' | 'session_expired' | 'banned';
  secret_manager_path?: string;
  last_used_at?: string; // A data virá como string ISO
  created_at: string;
}

/**
 * Busca todas as contas de serviço do Instagram.
 */
export const getServiceAccounts = async (): Promise<InstagramServiceAccount[]> => {
  const response = await apiClient.get<InstagramServiceAccount[]>('/instagram/service-accounts/');
  return response.data;
};

/**
 * Adiciona uma nova conta de serviço do Instagram.
 * @param username - O nome de usuário da conta.
 * @param sessionFile - O arquivo de sessão do Instaloader.
 */
export const addServiceAccount = async (username: string, sessionFile: File): Promise<InstagramServiceAccount> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('session_file', sessionFile);

  const response = await apiClient.post<InstagramServiceAccount>('/instagram/service-accounts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Atualiza o arquivo de sessão de uma conta de serviço existente.
 * @param accountId - O ID da conta a ser atualizada.
 * @param sessionFile - O novo arquivo de sessão.
 */
export const updateServiceAccountSession = async (accountId: string, sessionFile: File): Promise<InstagramServiceAccount> => {
  const formData = new FormData();
  formData.append('session_file', sessionFile);

  const response = await apiClient.post<InstagramServiceAccount>(`/instagram/service-accounts/${accountId}/update-session`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Deleta uma conta de serviço.
 * @param accountId - O ID da conta a ser deletada.
 */
export const deleteServiceAccount = async (accountId: string): Promise<void> => {
  await apiClient.delete(`/instagram/service-accounts/${accountId}`);
};
