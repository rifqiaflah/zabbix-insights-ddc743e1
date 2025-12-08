import { ServerStatus, ZabbixHost, ZabbixProblem, ElasticLog, SecurityStats } from '@/types/monitoring';

export const mockServerStatus: ServerStatus = {
  total: 48,
  up: 45,
  down: 3,
  uptimePercentage: 93.75,
};

export const mockZabbixHosts: ZabbixHost[] = [
  { id: '1', name: 'web-server-01', ip: '192.168.1.10', status: 'up', cpu: 45, ram: 67, bandwidthIn: 125.5, bandwidthOut: 89.3, lastCheck: '2 sec ago' },
  { id: '2', name: 'db-master-01', ip: '192.168.1.20', status: 'up', cpu: 78, ram: 82, bandwidthIn: 45.2, bandwidthOut: 156.8, lastCheck: '5 sec ago' },
  { id: '3', name: 'api-gateway-01', ip: '192.168.1.30', status: 'up', cpu: 23, ram: 45, bandwidthIn: 890.5, bandwidthOut: 750.2, lastCheck: '1 sec ago' },
  { id: '4', name: 'cache-redis-01', ip: '192.168.1.40', status: 'up', cpu: 12, ram: 89, bandwidthIn: 234.1, bandwidthOut: 198.7, lastCheck: '3 sec ago' },
  { id: '5', name: 'worker-node-01', ip: '192.168.1.50', status: 'down', cpu: 0, ram: 0, bandwidthIn: 0, bandwidthOut: 0, lastCheck: '5 min ago' },
  { id: '6', name: 'web-server-02', ip: '192.168.1.11', status: 'up', cpu: 52, ram: 71, bandwidthIn: 145.2, bandwidthOut: 92.1, lastCheck: '2 sec ago' },
  { id: '7', name: 'db-replica-01', ip: '192.168.1.21', status: 'up', cpu: 65, ram: 78, bandwidthIn: 38.9, bandwidthOut: 122.4, lastCheck: '4 sec ago' },
  { id: '8', name: 'monitoring-01', ip: '192.168.1.60', status: 'up', cpu: 34, ram: 56, bandwidthIn: 12.3, bandwidthOut: 8.7, lastCheck: '1 sec ago' },
  { id: '9', name: 'backup-server-01', ip: '192.168.1.70', status: 'down', cpu: 0, ram: 0, bandwidthIn: 0, bandwidthOut: 0, lastCheck: '15 min ago' },
  { id: '10', name: 'mail-server-01', ip: '192.168.1.80', status: 'up', cpu: 28, ram: 42, bandwidthIn: 56.7, bandwidthOut: 234.5, lastCheck: '2 sec ago' },
  { id: '11', name: 'load-balancer-01', ip: '192.168.1.5', status: 'up', cpu: 18, ram: 35, bandwidthIn: 1250.8, bandwidthOut: 1180.3, lastCheck: '1 sec ago' },
  { id: '12', name: 'storage-nfs-01', ip: '192.168.1.90', status: 'down', cpu: 0, ram: 0, bandwidthIn: 0, bandwidthOut: 0, lastCheck: '8 min ago' },
];

export const mockZabbixProblems: ZabbixProblem[] = [
  { id: '1', host: 'worker-node-01', severity: 'disaster', message: 'Host unreachable - No response for 5 minutes', timestamp: '14:32:15' },
  { id: '2', host: 'db-master-01', severity: 'high', message: 'CPU usage exceeded 75% threshold', timestamp: '14:28:42' },
  { id: '3', host: 'cache-redis-01', severity: 'warning', message: 'Memory usage above 85%', timestamp: '14:25:18' },
  { id: '4', host: 'backup-server-01', severity: 'disaster', message: 'Host unreachable - Network timeout', timestamp: '14:20:05' },
  { id: '5', host: 'storage-nfs-01', severity: 'disaster', message: 'Host unreachable - Connection refused', timestamp: '14:18:33' },
  { id: '6', host: 'api-gateway-01', severity: 'average', message: 'High request latency detected (>500ms)', timestamp: '14:15:22' },
  { id: '7', host: 'web-server-02', severity: 'information', message: 'Scheduled maintenance completed', timestamp: '14:10:00' },
];

export const mockElasticLogs: ElasticLog[] = [
  { id: '1', timestamp: '14:35:28', type: 'bruteforce', source: '45.33.32.156', message: 'Failed password for root from 45.33.32.156 port 22 ssh2', severity: 'critical' },
  { id: '2', timestamp: '14:35:15', type: 'ddos', source: '192.168.1.30', message: 'HTTP flood detected - 5000 requests/sec from single IP', severity: 'critical' },
  { id: '3', timestamp: '14:34:52', type: 'auth_failure', source: '10.0.0.55', message: 'authentication failure; logname= uid=0 euid=0', severity: 'high' },
  { id: '4', timestamp: '14:34:21', type: 'bruteforce', source: '103.21.244.12', message: 'Failed password for invalid user admin', severity: 'high' },
  { id: '5', timestamp: '14:33:58', type: 'ddos', source: '192.168.1.30', message: 'HTTP request spike detected - potential DDoS', severity: 'critical' },
  { id: '6', timestamp: '14:33:12', type: 'bruteforce', source: '45.33.32.156', message: 'Failed password for root from 45.33.32.156', severity: 'high' },
  { id: '7', timestamp: '14:32:45', type: 'auth_failure', source: '172.16.0.100', message: 'pam_unix authentication failure', severity: 'medium' },
  { id: '8', timestamp: '14:31:33', type: 'info', source: '192.168.1.10', message: 'Session opened for user deploy', severity: 'low' },
];

export const mockSecurityStats: SecurityStats = {
  bruteforce: 156,
  ddos: 23,
  authFailure: 89,
  total: 268,
};

export const mockHourlySecurityData = [
  { hour: '00:00', bruteforce: 12, ddos: 2, authFailure: 8 },
  { hour: '02:00', bruteforce: 8, ddos: 1, authFailure: 5 },
  { hour: '04:00', bruteforce: 5, ddos: 0, authFailure: 3 },
  { hour: '06:00', bruteforce: 15, ddos: 3, authFailure: 12 },
  { hour: '08:00', bruteforce: 25, ddos: 5, authFailure: 18 },
  { hour: '10:00', bruteforce: 32, ddos: 4, authFailure: 22 },
  { hour: '12:00', bruteforce: 28, ddos: 8, authFailure: 15 },
  { hour: '14:00', bruteforce: 31, ddos: 0, authFailure: 6 },
];
