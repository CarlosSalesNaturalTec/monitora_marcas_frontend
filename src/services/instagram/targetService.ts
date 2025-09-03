// /frontend/src/services/instagram/targetService.ts
import apiClient from '@/lib/api';

// --- Tipagens para Perfis ---
export interface MonitoredProfile {
  id: string;
  username: string;
  type: 'parlamentar' | 'concorrente' | 'midia';
  is_active: boolean;
  last_scanned_at?: string;
}

export interface MonitoredProfileCreate {
  username: string;
  type: 'parlamentar' | 'concorrente' | 'midia';
  is_active?: boolean;
}

// --- Tipagens para Hashtags ---
export interface MonitoredHashtag {
  id: string;
  hashtag: string;
  is_active: boolean;
  last_scanned_at?: string;
}

export interface MonitoredHashtagCreate {
  hashtag: string;
  is_active?: boolean;
}

// --- Funções da API para Perfis ---

export const getMonitoredProfiles = async (): Promise<MonitoredProfile[]> => {
  const response = await apiClient.get<MonitoredProfile[]>('/instagram/targets/profiles');
  return response.data;
};

export const addMonitoredProfile = async (profile: MonitoredProfileCreate): Promise<MonitoredProfile> => {
  const response = await apiClient.post<MonitoredProfile>('/instagram/targets/profiles', profile);
  return response.data;
};

export const updateProfileStatus = async (username: string, isActive: boolean): Promise<MonitoredProfile> => {
  const response = await apiClient.put<MonitoredProfile>(`/instagram/targets/profiles/${username}/status`, { is_active: isActive });
  return response.data;
};

export const deleteMonitoredProfile = async (username: string): Promise<void> => {
  await apiClient.delete(`/instagram/targets/profiles/${username}`);
};

// --- Funções da API para Hashtags ---

export const getMonitoredHashtags = async (): Promise<MonitoredHashtag[]> => {
  const response = await apiClient.get<MonitoredHashtag[]>('/instagram/targets/hashtags');
  return response.data;
};

export const addMonitoredHashtag = async (hashtag: MonitoredHashtagCreate): Promise<MonitoredHashtag> => {
  const response = await apiClient.post<MonitoredHashtag>('/instagram/targets/hashtags', hashtag);
  return response.data;
};

export const updateHashtagStatus = async (hashtag: string, isActive: boolean): Promise<MonitoredHashtag> => {
  const response = await apiClient.put<MonitoredHashtag>(`/instagram/targets/hashtags/${hashtag}/status`, { is_active: isActive });
  return response.data;
};

export const deleteMonitoredHashtag = async (hashtag: string): Promise<void> => {
  await apiClient.delete(`/instagram/targets/hashtags/${hashtag}`);
};
