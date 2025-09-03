"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart } from "@tremor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTopicSentimentOverTime,
  getTopicInfluencers,
  getHashtagFeed,
} from "@/services/instagramDashboardApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle } from "lucide-react";

// Tipos de dados da API
interface SentimentOverTimeData {
  labels: string[];
  series: (number | null)[];
}

interface TopicInfluencersData {
    [username: string]: {
        total_engagement: number;
        post_count: number;
    };
}

interface HashtagPost {
    id: string;
    data: {
        thumbnail_url: string;
        caption: string;
        likes_count: number;
        comments_count: number;
        post_url: string;
    }
}

// TODO: As hashtags monitoradas devem vir de uma chamada à API (coleção monitored_hashtags)
const monitoredHashtags = [
  { id: "seguranca", name: "SegurançaEmMinhaCidade" },
  { id: "saude", name: "SaudeParaTodos" },
  { id: "educacao", name: "EducaçãoDeQualidade" },
];

export default function HashtagsTab() {
  const [selectedHashtag, setSelectedHashtag] = useState<string>(monitoredHashtags[0].name);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [hashtagFeed, setHashtagFeed] = useState<HashtagPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedHashtag) return;

    const fetchHashtagData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sentimentRes, influencersRes, feedRes] = await Promise.all([
          getTopicSentimentOverTime(selectedHashtag, 30),
          getTopicInfluencers(selectedHashtag, 5),
          getHashtagFeed(selectedHashtag, 20),
        ]);

        // Formatar dados de sentimento
        const formattedSentiment = sentimentRes.labels.map((label: string, index: number) => ({
            date: new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            "Sentimento Médio": sentimentRes.series[index],
        })).filter(item => item["Sentimento Médio"] !== null);
        setSentimentData(formattedSentiment);

        // Formatar dados de influenciadores
        const formattedInfluencers = Object.entries(influencersRes).map(([username, data]: [string, any]) => ({
            user: username,
            engagement: data.total_engagement,
            posts: data.post_count,
        }));
        setInfluencers(formattedInfluencers);

        setHashtagFeed(feedRes);

      } catch (err) {
        setError(`Falha ao carregar dados para #${selectedHashtag}.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHashtagData();
  }, [selectedHashtag]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Análise da Pauta</CardTitle>
            <div className="w-64">
              <Select
                defaultValue={selectedHashtag}
                onValueChange={setSelectedHashtag}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a pauta/hashtag" />
                </SelectTrigger>
                <SelectContent>
                  {monitoredHashtags.map(tag => (
                      <SelectItem key={tag.id} value={tag.name}>#{tag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feed da Hashtag */}
      <Card className="lg:col-span-1 h-[600px]">
        <CardHeader><CardTitle>Feed da Hashtag</CardTitle></CardHeader>
        <CardContent className="overflow-y-auto h-[520px] pr-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : error ? <p className="text-red-500">{error}</p> : (
            <div className="space-y-4">
              {hashtagFeed.map((post) => (
                <a key={post.id} href={post.data.post_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="overflow-hidden">
                    <Image
                      src={post.data.thumbnail_url}
                      alt="Post thumbnail"
                      width={400}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs text-gray-500 truncate">{post.data.caption}</p>
                      <div className="flex items-center justify-end gap-2 text-xs mt-1">
                        <Heart className="w-3 h-3" /> {post.data.likes_count.toLocaleString('pt-BR')}
                        <MessageCircle className="w-3 h-3" /> {post.data.comments_count.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Sentimento da Pauta ao Longo do Tempo */}
        <Card>
          <CardHeader><CardTitle>Sentimento da Pauta ao Longo do Tempo</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : error ? <p className="text-red-500">{error}</p> : (
              <LineChart
                data={sentimentData}
                index="date"
                categories={["Sentimento Médio"]}
                colors={["blue"]}
                yAxisWidth={40}
                allowDecimals={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Principais Influenciadores da Pauta */}
        <Card>
          <CardHeader><CardTitle>Principais Influenciadores da Pauta</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : error ? <p className="text-red-500">{error}</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Engajamento na Pauta</TableHead>
                    <TableHead className="text-right">Nº de Posts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {influencers.map((user) => (
                    <TableRow key={user.user}>
                      <TableCell className="font-medium">{user.user}</TableCell>
                      <TableCell className="text-right">{user.engagement.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">{user.posts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
