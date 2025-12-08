import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ElasticLog, SecurityStats } from '@/types/monitoring';
import type { HourlySecurityData } from '@/types/monitoring';

interface ElasticsearchParams {
  index?: string;
  size?: number;
}

async function callElasticsearchApi(action: string, params?: ElasticsearchParams) {
  const { data, error } = await supabase.functions.invoke('elasticsearch-api', {
    body: { action, params },
  });

  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data.data;
}

export function useSecurityLogs(params?: ElasticsearchParams) {
  return useQuery<ElasticLog[]>({
    queryKey: ['elasticsearch', 'securityLogs', params],
    queryFn: () => callElasticsearchApi('getSecurityLogs', params),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
}

export function useSecurityStats(params?: ElasticsearchParams) {
  return useQuery<SecurityStats>({
    queryKey: ['elasticsearch', 'securityStats', params],
    queryFn: () => callElasticsearchApi('getSecurityStats', params),
    refetchInterval: 15000,
    staleTime: 5000,
  });
}

export function useHourlySecurityData(params?: ElasticsearchParams) {
  return useQuery<HourlySecurityData[]>({
    queryKey: ['elasticsearch', 'hourlyData', params],
    queryFn: () => callElasticsearchApi('getHourlySecurityData', params),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
