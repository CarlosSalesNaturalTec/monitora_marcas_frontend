// src/services/instagramDashboardApi.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Busca os dados da API e lida com a resposta.
 * @param endpoint O caminho do endpoint da API.
 * @param options Opções para a requisição fetch.
 * @returns A resposta da API em formato JSON.
 */
async function fetchApiData(endpoint: string, options: RequestInit = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API.' }));
            throw new Error(errorData.detail || `Erro ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Falha ao buscar dados de ${endpoint}:`, error);
        throw error;
    }
}

// --- Aba 1: Pulso do Dia ---

export const getKpisLast24h = () => {
    return fetchApiData('/dashboard/instagram/kpis-24h');
};

export const getStoriesLast24h = () => {
    return fetchApiData('/dashboard/instagram/stories-24h');
};

export const getSentimentBalanceLast24h = () => {
    return fetchApiData('/dashboard/instagram/sentiment-balance-24h');
};

export const getTopTermsLast24h = () => {
    return fetchApiData('/dashboard/instagram/top-terms-24h');
};

export const getAlertsLast24h = () => {
    return fetchApiData('/dashboard/instagram/alerts-24h');
};

// --- Aba 2: Análise de Desempenho ---

export const getEngagementEvolution = (profile: string, days: number = 30) => {
    return fetchApiData(`/dashboard/instagram/engagement-evolution/${profile}?days=${days}`);
};

export const getPerformanceByContentType = (profile: string) => {
    return fetchApiData(`/dashboard/instagram/performance-by-content-type/${profile}`);
};

export const getPostsRanking = (profile: string, sortBy: string = 'likes_count', limit: number = 10) => {
    return fetchApiData(`/dashboard/instagram/posts-ranking/${profile}?sort_by=${sortBy}&limit=${limit}`);
};

export const getTopCommenters = (profile: string, type: 'supporter' | 'critic', limit: number = 5) => {
    return fetchApiData(`/dashboard/instagram/top-commenters/${profile}?analysis_type=${type}&limit=${limit}`);
};

export const getCommentersInfluence = (profile: string, limit: number = 50) => {
    return fetchApiData(`/dashboard/instagram/commenters-influence/${profile}?limit=${limit}`);
};

export const getSentimentByPost = (profile: string, limit: number = 10) => {
    return fetchApiData(`/dashboard/instagram/sentiment-by-post/${profile}?limit=${limit}`);
};

// --- Aba 3: Inteligência Competitiva ---

export const getHeadToHeadEngagement = (profiles: string[], days: number = 7) => {
    const params = new URLSearchParams();
    profiles.forEach(p => params.append('profiles', p));
    return fetchApiData(`/dashboard/instagram/head-to-head-engagement?${params.toString()}&days=${days}`);
};

export const getContentStrategyComparison = (profiles: string[]) => {
    const params = new URLSearchParams();
    profiles.forEach(p => params.append('profiles', p));
    return fetchApiData(`/dashboard/instagram/content-strategy-comparison?${params.toString()}`);
};

export const getVulnerabilityIdentification = (profiles: string[]) => {
    const params = new URLSearchParams();
    profiles.forEach(p => params.append('profiles', p));
    return fetchApiData(`/dashboard/instagram/vulnerability-identification?${params.toString()}`);
};

export const getTopTermsByProfile = (profiles: string[], days: number = 7) => {
    const params = new URLSearchParams();
    profiles.forEach(p => params.append('profiles', p));
    params.append('days', days.toString());
    return fetchApiData(`/analytics/top-terms-by-profile?${params.toString()}`);
};

// --- Aba 4: Radar de Pautas ---

export const getHashtagFeed = (hashtag: string, limit: number = 20) => {
    return fetchApiData(`/dashboard/instagram/hashtag-feed/${hashtag}?limit=${limit}`);
};

export const getTopicSentimentOverTime = (hashtag: string, days: number = 30) => {
    return fetchApiData(`/dashboard/instagram/topic-sentiment-over-time/${hashtag}?days=${days}`);
};

export const getTopicInfluencers = (hashtag: string, limit: number = 10) => {
    return fetchApiData(`/dashboard/instagram/topic-influencers/${hashtag}?limit=${limit}`);
};
