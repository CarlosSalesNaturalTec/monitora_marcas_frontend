import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
});

// --- Tipagem ---

// Abas 1 & 2
export interface KpiResponse {
  total_mentions: number;
  average_sentiment: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface CombinedViewResponse {
  mentions_over_time: DataPoint[];
  trends_over_time: DataPoint[];
}

export interface Entity {
  text: string;
  value: number;
}

export interface Mention {
  link: string;
  title: string;
  snippet: string;
  publish_date: string;
  sentiment: 'positivo' | 'negativo' | 'neutro';
  sentiment_score: number;
}

export interface MentionsResponse {
  total_pages: number;
  mentions: Mention[];
}

// Aba 3
export interface RisingQueryItem {
  query: string;
  value: number;
  formatted_value: string;
}

export interface RisingQueriesResponse {
  queries: RisingQueryItem[];
}

export interface TrendsDataPoint {
    date: string;
    value: number;
}

export interface TrendsComparisonItem {
    term: string;
    data: TrendsDataPoint[];
}

export interface TrendsComparisonResponse {
    comparison_data: TrendsComparisonItem[];
}

// Aba 4
export interface SentimentDistributionItem {
    sentiment: 'positivo' | 'negativo' | 'neutro';
    count: number;
}

export interface SentimentDistributionResponse {
    distribution: SentimentDistributionItem[];
}

export interface SentimentOverTimeDataPoint {
    positive: number;
    negative: number;
    neutral: number;
}

export interface SentimentOverTimeItem {
    date: string;
    sentiments: SentimentOverTimeDataPoint;
}

export interface SentimentOverTimeResponse {
    over_time_data: SentimentOverTimeItem[];
}


// --- Funções de Serviço ---

export const getKpis = async (searchGroup: string, days: number): Promise<KpiResponse> => {
  const { data } = await apiClient.get('/analytics/kpis', {
    params: { search_group: searchGroup, days },
  });
  return data;
};

export const getCombinedView = async (searchGroup: string, days: number): Promise<CombinedViewResponse> => {
    const { data } = await apiClient.get('/analytics/combined_view', {
        params: { search_group: searchGroup, days },
    });
    return data;
};

export const getEntitiesCloud = async (searchGroup: string, days: number): Promise<Entity[]> => {
    const { data } = await apiClient.get('/analytics/entities_cloud', {
        params: { search_group: searchGroup, days },
    });
    return data;
};

export const getMentions = async (
  searchGroup: string,
  days: number,
  page: number = 1,
  entity: string | null = null
): Promise<MentionsResponse> => {
  const params: any = { search_group: searchGroup, days, page };
  if (entity) {
    params.entity = entity;
  }
  const { data } = await apiClient.get('/analytics/mentions', { params });
  return data;
};

export const getRisingQueries = async (searchGroup: string): Promise<RisingQueriesResponse> => {
    const { data } = await apiClient.get('/analytics/rising_queries', {
        params: { search_group: searchGroup },
    });
    return data;
};

export const getTrendsComparison = async (terms: string[], days: number): Promise<TrendsComparisonResponse> => {
    const { data } = await apiClient.get('/analytics/trends_comparison', {
        params: { terms, days }, // FastAPI handles list parameters correctly
    });
    return data;
};

export const getSentimentDistribution = async (searchGroup: string, days: number): Promise<SentimentDistributionResponse> => {
    const { data } = await apiClient.get('/analytics/sentiment_distribution', {
        params: { search_group: searchGroup, days },
    });
    return data;
};

export const getSentimentOverTime = async (searchGroup: string, days: number): Promise<SentimentOverTimeResponse> => {
    const { data } = await apiClient.get('/analytics/sentiment_over_time', {
        params: { search_group: searchGroup, days },
    });
    return data;
};