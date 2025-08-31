// src/lib/services/analyticsService.ts
import axios from 'axios';
import { getFirebaseToken } from '../firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = async () => {
  const token = await getFirebaseToken();
  if (!token) {
    throw new Error('User not authenticated');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface SentimentDistribution {
  sentiment: string;
  count: number;
}

export interface SentimentOverTime {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export const getSentimentDistribution = async (term: string): Promise<SentimentDistribution[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/analytics/sentiment_distribution`, {
    params: { term },
    headers,
  });
  return response.data;
};

export const getSentimentOverTime = async (term: string): Promise<SentimentOverTime[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/analytics/sentiment_over_time`, {
    params: { term },
    headers,
  });
  return response.data;
};
