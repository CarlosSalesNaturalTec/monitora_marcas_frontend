// src/components/analytics/AnalyticsDashboard.tsx
"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSentimentDistribution, getSentimentOverTime } from '@/lib/services/analyticsService';
import SentimentDistributionChart from './SentimentDistributionChart';
import SentimentOverTimeChart from './SentimentOverTimeChart';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AnalyticsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('brand'); // Initialize with a default or popular term
  const [inputValue, setInputValue] = useState('brand');

  const {
    data: sentimentDistributionData,
    isLoading: isDistributionLoading,
    isError: isDistributionError,
  } = useQuery({
    queryKey: ['sentimentDistribution', searchTerm],
    queryFn: () => getSentimentDistribution(searchTerm),
  });

  const {
    data: sentimentOverTimeData,
    isLoading: isOverTimeLoading,
    isError: isOverTimeError,
  } = useQuery({
    queryKey: ['sentimentOverTime', searchTerm],
    queryFn: () => getSentimentOverTime(searchTerm),
  });

  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex gap-2">
          <Input 
            placeholder="Digite um termo para análise..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>Analisar</Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SentimentDistributionChart 
          data={sentimentDistributionData || []} 
          isLoading={isDistributionLoading}
          isError={isDistributionError}
        />
        <SentimentOverTimeChart 
          data={sentimentOverTimeData || []}
          isLoading={isOverTimeLoading}
          isError={isOverTimeError}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
