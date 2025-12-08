import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELASTICSEARCH_URL = Deno.env.get('ELASTICSEARCH_URL');
const ELASTICSEARCH_API_KEY = Deno.env.get('ELASTICSEARCH_API_KEY');

async function elasticRequest(endpoint: string, body?: Record<string, unknown>) {
  const url = `${ELASTICSEARCH_URL}${endpoint}`;
  console.log('Elasticsearch request to:', endpoint);

  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${ELASTICSEARCH_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Elasticsearch error:', errorText);
    throw new Error(`Elasticsearch error: ${response.status}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    console.log('Elasticsearch action:', action, params);

    let result;

    switch (action) {
      case 'getSecurityLogs':
        const logsResponse = await elasticRequest('/_search', {
          index: params?.index || 'security-*',
          size: params?.size || 100,
          sort: [{ '@timestamp': { order: 'desc' } }],
          query: {
            bool: {
              should: [
                { match: { 'event.outcome': 'failure' } },
                { wildcard: { message: '*Failed password*' } },
                { wildcard: { message: '*authentication failure*' } },
                { wildcard: { message: '*HTTP*' } },
                { match: { 'event.category': 'authentication' } },
                { match: { 'event.category': 'network' } },
              ],
              minimum_should_match: 1,
            },
          },
        });

        result = logsResponse.hits?.hits?.map((hit: any, index: number) => ({
          id: hit._id || `log-${index}`,
          timestamp: hit._source['@timestamp'] || new Date().toISOString(),
          type: categorizeLog(hit._source),
          source: hit._source.host?.name || hit._source.source?.ip || 'Unknown',
          message: hit._source.message || JSON.stringify(hit._source),
          severity: getSeverityFromLog(hit._source),
        })) || [];
        break;

      case 'getSecurityStats':
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const statsResponse = await elasticRequest('/_search', {
          index: params?.index || 'security-*',
          size: 0,
          query: {
            range: {
              '@timestamp': {
                gte: last24h.toISOString(),
                lte: now.toISOString(),
              },
            },
          },
          aggs: {
            bruteforce: {
              filter: {
                bool: {
                  should: [
                    { match: { 'event.outcome': 'failure' } },
                    { wildcard: { message: '*Failed password*' } },
                    { wildcard: { message: '*authentication failure*' } },
                  ],
                  minimum_should_match: 1,
                },
              },
            },
            ddos: {
              filter: {
                bool: {
                  should: [
                    { wildcard: { message: '*HTTP*' } },
                    { match: { 'event.category': 'network' } },
                  ],
                  minimum_should_match: 1,
                },
              },
            },
            authFailure: {
              filter: {
                match: { 'event.outcome': 'failure' },
              },
            },
          },
        });

        result = {
          bruteforce: statsResponse.aggregations?.bruteforce?.doc_count || 0,
          ddos: statsResponse.aggregations?.ddos?.doc_count || 0,
          authFailure: statsResponse.aggregations?.authFailure?.doc_count || 0,
          total: statsResponse.hits?.total?.value || 0,
        };
        break;

      case 'getHourlySecurityData':
        const hourlyResponse = await elasticRequest('/_search', {
          index: params?.index || 'security-*',
          size: 0,
          query: {
            range: {
              '@timestamp': {
                gte: 'now-24h',
                lte: 'now',
              },
            },
          },
          aggs: {
            hourly: {
              date_histogram: {
                field: '@timestamp',
                calendar_interval: 'hour',
              },
              aggs: {
                bruteforce: {
                  filter: {
                    bool: {
                      should: [
                        { match: { 'event.outcome': 'failure' } },
                        { wildcard: { message: '*Failed password*' } },
                      ],
                      minimum_should_match: 1,
                    },
                  },
                },
                ddos: {
                  filter: {
                    wildcard: { message: '*HTTP*' },
                  },
                },
                authFailure: {
                  filter: {
                    match: { 'event.outcome': 'failure' },
                  },
                },
              },
            },
          },
        });

        result = hourlyResponse.aggregations?.hourly?.buckets?.map((bucket: any) => ({
          hour: new Date(bucket.key).getHours().toString().padStart(2, '0') + ':00',
          bruteforce: bucket.bruteforce?.doc_count || 0,
          ddos: bucket.ddos?.doc_count || 0,
          authFailure: bucket.authFailure?.doc_count || 0,
        })) || [];
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Elasticsearch API error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function categorizeLog(source: any): 'brute_force' | 'ddos' | 'auth_failure' | 'suspicious' {
  const message = (source.message || '').toLowerCase();
  const eventCategory = source.event?.category || '';
  const eventOutcome = source.event?.outcome || '';

  if (message.includes('failed password') || message.includes('authentication failure')) {
    return 'brute_force';
  }
  if (message.includes('http') || eventCategory === 'network') {
    return 'ddos';
  }
  if (eventOutcome === 'failure') {
    return 'auth_failure';
  }
  return 'suspicious';
}

function getSeverityFromLog(source: any): 'critical' | 'high' | 'medium' | 'low' {
  const level = source.log?.level || source.level || '';
  const eventOutcome = source.event?.outcome || '';

  if (level === 'error' || level === 'critical') {
    return 'critical';
  }
  if (eventOutcome === 'failure') {
    return 'high';
  }
  if (level === 'warning') {
    return 'medium';
  }
  return 'low';
}
