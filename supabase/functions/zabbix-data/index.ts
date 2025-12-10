import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ZabbixAuthResponse {
  jsonrpc: string;
  result: string;
  id: number;
}

interface ZabbixHost {
  hostid: string;
  host: string;
  name: string;
  status: string;
  interfaces: Array<{ ip: string }>;
}

interface ZabbixItem {
  itemid: string;
  hostid: string;
  name: string;
  key_: string;
  lastvalue: string;
}

interface ZabbixProblem {
  eventid: string;
  objectid: string;
  name: string;
  severity: string;
  clock: string;
  hosts: Array<{ name: string }>;
}

async function zabbixRequest(url: string, method: string, params: Record<string, unknown>, authToken?: string) {
  const body: Record<string, unknown> = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  };

  if (authToken) {
    body.auth = authToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

async function authenticate(url: string, username: string, password: string): Promise<string> {
  const response = await zabbixRequest(url, 'user.login', {
    user: username,
    password: password,
  });

  if (response.error) {
    throw new Error(`Zabbix auth failed: ${response.error.message || response.error.data}`);
  }

  return response.result;
}

async function getHosts(url: string, authToken: string): Promise<ZabbixHost[]> {
  const response = await zabbixRequest(url, 'host.get', {
    output: ['hostid', 'host', 'name', 'status'],
    selectInterfaces: ['ip'],
  }, authToken);

  if (response.error) {
    throw new Error(`Failed to get hosts: ${response.error.message || response.error.data}`);
  }

  return response.result;
}

async function getItems(url: string, authToken: string, hostIds: string[]): Promise<ZabbixItem[]> {
  const response = await zabbixRequest(url, 'item.get', {
    output: ['itemid', 'hostid', 'name', 'key_', 'lastvalue'],
    hostids: hostIds,
    search: {
      key_: 'system.cpu,vm.memory,net.if'
    },
    searchByAny: true,
    sortfield: 'name',
  }, authToken);

  if (response.error) {
    throw new Error(`Failed to get items: ${response.error.message || response.error.data}`);
  }

  return response.result;
}

async function getProblems(url: string, authToken: string): Promise<ZabbixProblem[]> {
  const response = await zabbixRequest(url, 'problem.get', {
    output: ['eventid', 'objectid', 'name', 'severity', 'clock'],
    selectHosts: ['name'],
    recent: true,
    sortfield: ['eventid'],
    sortorder: 'DESC',
    limit: 50,
  }, authToken);

  if (response.error) {
    throw new Error(`Failed to get problems: ${response.error.message || response.error.data}`);
  }

  return response.result;
}

function parseHostMetrics(hosts: ZabbixHost[], items: ZabbixItem[]) {
  const hostMetrics = new Map<string, {
    cpu: number;
    ram: number;
    bandwidthIn: number;
    bandwidthOut: number;
  }>();

  // Group items by host
  for (const item of items) {
    if (!hostMetrics.has(item.hostid)) {
      hostMetrics.set(item.hostid, {
        cpu: 0,
        ram: 0,
        bandwidthIn: 0,
        bandwidthOut: 0,
      });
    }

    const metrics = hostMetrics.get(item.hostid)!;
    const value = parseFloat(item.lastvalue) || 0;
    const key = item.key_.toLowerCase();

    if (key.includes('cpu') && (key.includes('util') || key.includes('load') || key.includes('idle'))) {
      if (key.includes('idle')) {
        metrics.cpu = 100 - value;
      } else {
        metrics.cpu = Math.max(metrics.cpu, value);
      }
    } else if (key.includes('memory') && (key.includes('pused') || key.includes('util'))) {
      metrics.ram = Math.max(metrics.ram, value);
    } else if (key.includes('net.if') && key.includes('in')) {
      metrics.bandwidthIn += value / 1024 / 1024; // Convert to Mbps
    } else if (key.includes('net.if') && key.includes('out')) {
      metrics.bandwidthOut += value / 1024 / 1024; // Convert to Mbps
    }
  }

  return hosts.map(host => ({
    id: host.hostid,
    name: host.name || host.host,
    ip: host.interfaces?.[0]?.ip || 'N/A',
    status: host.status === '0' ? 'up' : 'down',
    cpu: Math.round((hostMetrics.get(host.hostid)?.cpu || 0) * 10) / 10,
    ram: Math.round((hostMetrics.get(host.hostid)?.ram || 0) * 10) / 10,
    bandwidthIn: Math.round((hostMetrics.get(host.hostid)?.bandwidthIn || 0) * 100) / 100,
    bandwidthOut: Math.round((hostMetrics.get(host.hostid)?.bandwidthOut || 0) * 100) / 100,
    lastCheck: new Date().toISOString(),
  }));
}

function parseProblems(problems: ZabbixProblem[]) {
  const severityMap: Record<string, 'disaster' | 'high' | 'average' | 'warning' | 'information'> = {
    '5': 'disaster',
    '4': 'high',
    '3': 'average',
    '2': 'warning',
    '1': 'information',
    '0': 'information',
  };

  return problems.map(problem => ({
    id: problem.eventid,
    host: problem.hosts?.[0]?.name || 'Unknown',
    severity: severityMap[problem.severity] || 'information',
    message: problem.name,
    timestamp: new Date(parseInt(problem.clock) * 1000).toISOString(),
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const zabbixUrl = Deno.env.get('ZABBIX_API_URL');
    const zabbixUsername = Deno.env.get('ZABBIX_USERNAME');
    const zabbixPassword = Deno.env.get('ZABBIX_PASSWORD');

    if (!zabbixUrl || !zabbixUsername || !zabbixPassword) {
      throw new Error('Missing Zabbix credentials in environment variables');
    }

    console.log('Authenticating with Zabbix...');
    const authToken = await authenticate(zabbixUrl, zabbixUsername, zabbixPassword);
    console.log('Authentication successful');

    console.log('Fetching hosts...');
    const hosts = await getHosts(zabbixUrl, authToken);
    console.log(`Found ${hosts.length} hosts`);

    const hostIds = hosts.map(h => h.hostid);

    console.log('Fetching items...');
    const items = await getItems(zabbixUrl, authToken, hostIds);
    console.log(`Found ${items.length} items`);

    console.log('Fetching problems...');
    const problems = await getProblems(zabbixUrl, authToken);
    console.log(`Found ${problems.length} problems`);

    const parsedHosts = parseHostMetrics(hosts, items);
    const parsedProblems = parseProblems(problems);

    const upCount = parsedHosts.filter(h => h.status === 'up').length;
    const downCount = parsedHosts.filter(h => h.status === 'down').length;

    const serverStatus = {
      total: parsedHosts.length,
      up: upCount,
      down: downCount,
      uptimePercentage: parsedHosts.length > 0 ? Math.round((upCount / parsedHosts.length) * 100) : 0,
    };

    // Logout from Zabbix
    await zabbixRequest(zabbixUrl, 'user.logout', {}, authToken);
    console.log('Logged out from Zabbix');

    return new Response(JSON.stringify({
      serverStatus,
      hosts: parsedHosts,
      problems: parsedProblems,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in zabbix-data function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
