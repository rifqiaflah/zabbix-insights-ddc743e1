import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ZABBIX_API_URL = Deno.env.get('ZABBIX_API_URL');
const ZABBIX_USERNAME = Deno.env.get('ZABBIX_USERNAME');
const ZABBIX_PASSWORD = Deno.env.get('ZABBIX_PASSWORD');

let authToken: string | null = null;

async function getAuthToken(): Promise<string> {
  console.log('Authenticating with Zabbix API...');
  
  const response = await fetch(ZABBIX_API_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'user.login',
      params: {
        user: ZABBIX_USERNAME,
        password: ZABBIX_PASSWORD,
      },
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    console.error('Zabbix auth error:', data.error);
    throw new Error(data.error.message || 'Authentication failed');
  }
  
  console.log('Zabbix authentication successful');
  return data.result;
}

async function zabbixRequest(method: string, params: Record<string, unknown> = {}) {
  if (!authToken) {
    authToken = await getAuthToken();
  }

  const response = await fetch(ZABBIX_API_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      auth: authToken,
      id: 2,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    // Token might be expired, try re-auth
    if (data.error.code === -32602 || data.error.data?.includes('Session')) {
      console.log('Token expired, re-authenticating...');
      authToken = await getAuthToken();
      return zabbixRequest(method, params);
    }
    console.error('Zabbix API error:', data.error);
    throw new Error(data.error.message || 'API request failed');
  }

  return data.result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log('Zabbix API action:', action);

    let result;

    switch (action) {
      case 'getHosts':
        result = await zabbixRequest('host.get', {
          output: ['hostid', 'host', 'name', 'status'],
          selectInterfaces: ['ip'],
          filter: { status: [0, 1] },
        });
        
        // Get items for CPU, RAM, bandwidth
        const hostIds = result.map((h: any) => h.hostid);
        const items = await zabbixRequest('item.get', {
          hostids: hostIds,
          output: ['hostid', 'key_', 'lastvalue', 'lastclock'],
          search: {
            key_: 'system.cpu,vm.memory,net.if',
          },
          searchWildcardsEnabled: true,
        });

        // Map items to hosts
        const hostsWithMetrics = result.map((host: any) => {
          const hostItems = items.filter((item: any) => item.hostid === host.hostid);
          
          const cpuItem = hostItems.find((i: any) => i.key_.includes('cpu'));
          const ramItem = hostItems.find((i: any) => i.key_.includes('memory'));
          const netInItem = hostItems.find((i: any) => i.key_.includes('net.if') && i.key_.includes('in'));
          const netOutItem = hostItems.find((i: any) => i.key_.includes('net.if') && i.key_.includes('out'));
          
          return {
            id: host.hostid,
            name: host.name || host.host,
            ip: host.interfaces?.[0]?.ip || 'N/A',
            status: host.status === '0' ? 'up' : 'down',
            cpu: cpuItem ? parseFloat(cpuItem.lastvalue) : null,
            ram: ramItem ? parseFloat(ramItem.lastvalue) : null,
            bandwidthIn: netInItem ? parseFloat(netInItem.lastvalue) / 1000000 : null,
            bandwidthOut: netOutItem ? parseFloat(netOutItem.lastvalue) / 1000000 : null,
            lastCheck: new Date().toISOString(),
          };
        });

        result = hostsWithMetrics;
        break;

      case 'getProblems':
        result = await zabbixRequest('problem.get', {
          output: ['eventid', 'objectid', 'name', 'severity', 'clock'],
          selectHosts: ['name'],
          recent: true,
          sortfield: ['eventid'],
          sortorder: 'DESC',
          limit: 50,
        });

        result = result.map((problem: any) => ({
          id: problem.eventid,
          host: problem.hosts?.[0]?.name || 'Unknown',
          severity: getSeverityLabel(problem.severity),
          message: problem.name,
          timestamp: new Date(parseInt(problem.clock) * 1000).toISOString(),
        }));
        break;

      case 'getServerStatus':
        const allHosts = await zabbixRequest('host.get', {
          output: ['hostid', 'status'],
          filter: { status: [0, 1] },
        });

        const upHosts = allHosts.filter((h: any) => h.status === '0').length;
        const downHosts = allHosts.filter((h: any) => h.status === '1').length;

        result = {
          total: allHosts.length,
          up: upHosts,
          down: downHosts,
          uptimePercentage: allHosts.length > 0 ? Math.round((upHosts / allHosts.length) * 100) : 0,
        };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Zabbix API error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSeverityLabel(severity: string): 'disaster' | 'high' | 'average' | 'warning' | 'information' | 'not_classified' {
  const severityMap: Record<string, 'disaster' | 'high' | 'average' | 'warning' | 'information' | 'not_classified'> = {
    '5': 'disaster',
    '4': 'high',
    '3': 'average',
    '2': 'warning',
    '1': 'information',
    '0': 'not_classified',
  };
  return severityMap[severity] || 'not_classified';
}
