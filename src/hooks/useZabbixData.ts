import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServerStatus, ZabbixHost, ZabbixProblem } from '@/types/monitoring';

interface ZabbixDataResponse {
  serverStatus: ServerStatus;
  hosts: ZabbixHost[];
  problems: ZabbixProblem[];
  timestamp: string;
  error?: string;
}

export function useZabbixData(refreshInterval = 30000) {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [hosts, setHosts] = useState<ZabbixHost[]>([]);
  const [problems, setProblems] = useState<ZabbixProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: fnError } = await supabase.functions.invoke<ZabbixDataResponse>('zabbix-data');

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data) {
        setServerStatus(data.serverStatus);
        setHosts(data.hosts);
        setProblems(data.problems);
        setLastUpdate(data.timestamp);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Zabbix data';
      setError(errorMessage);
      console.error('Zabbix data fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    serverStatus,
    hosts,
    problems,
    loading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
}
