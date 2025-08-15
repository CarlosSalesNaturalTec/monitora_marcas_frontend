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
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
