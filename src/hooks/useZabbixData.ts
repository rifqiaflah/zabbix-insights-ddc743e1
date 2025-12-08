import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ZabbixHost, ZabbixProblem, ServerStatus } from '@/types/monitoring';

async function callZabbixApi(action: string) {
  const { data, error } = await supabase.functions.invoke('zabbix-api', {
    body: { action },
  });

  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data.data;
}

export function useZabbixHosts() {
  return useQuery<ZabbixHost[]>({
    queryKey: ['zabbix', 'hosts'],
    queryFn: () => callZabbixApi('getHosts'),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}

export function useZabbixProblems() {
  return useQuery<ZabbixProblem[]>({
    queryKey: ['zabbix', 'problems'],
    queryFn: () => callZabbixApi('getProblems'),
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 5000,
  });
}

export function useServerStatus() {
  return useQuery<ServerStatus>({
    queryKey: ['zabbix', 'serverStatus'],
    queryFn: () => callZabbixApi('getServerStatus'),
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
