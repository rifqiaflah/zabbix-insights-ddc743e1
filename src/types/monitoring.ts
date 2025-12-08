export interface ServerStatus {
  total: number;
  up: number;
  down: number;
  uptimePercentage: number;
}

export interface ZabbixHost {
  id: string;
  name: string;
  ip: string;
  status: 'up' | 'down';
  cpu: number;
  ram: number;
  bandwidthIn: number;
  bandwidthOut: number;
  lastCheck: string;
}

export interface ZabbixProblem {
  id: string;
  host: string;
  severity: 'disaster' | 'high' | 'average' | 'warning' | 'information';
  message: string;
  timestamp: string;
}

export interface ElasticLog {
  id: string;
  timestamp: string;
  type: 'bruteforce' | 'ddos' | 'auth_failure' | 'info';
  source: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SecurityStats {
  bruteforce: number;
  ddos: number;
  authFailure: number;
  total: number;
}

export interface HourlySecurityData {
  hour: string;
  bruteforce: number;
  ddos: number;
  authFailure: number;
}
