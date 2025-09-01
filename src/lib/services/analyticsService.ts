// src/lib/services/analyticsService.ts
import apiClient from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
  const response = await apiClient.get(`${API_URL}/analytics/sentiment_distribution`, {
    params: { term },
  });
  return response.data;
};

export const getSentimentOverTime = async (term: string): Promise<SentimentOverTime[]> => {
  const response = await apiClient.get(`${API_URL}/analytics/sentiment_over_time`, {
    params: { term },
  });
  return response.data;
};
