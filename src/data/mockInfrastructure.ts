import type {
  ContainerInfo,
  ContainerStats,
  ContainerProcess,
  LogEntry,
  DiagnosticsReport,
  DiagnosticCheck,
  ActivityEntry,
  SystemStatus,
} from '../types';

// ─── Approved Resources ───────────────────────────────────────────────────────

export const APPROVED_RESOURCES = ['freedomops-api'];

// ─── Container Info ───────────────────────────────────────────────────────────

export const mockContainerInfo: ContainerInfo = {
  id: 'a3f82b1c9d4e',
  name: 'freedomops-api',
  image: 'localhost/freedomops-api:latest',
  command: 'python app.py',
  status: 'running',
  health: 'healthy',
  port: '0.0.0.0:8080 → 8080',
  createdAt: '2026-08-18T18:00:00Z',
  uptime: '1h 23m',
};

export const mockContainerInfoStopped: ContainerInfo = {
  ...mockContainerInfo,
  status: 'stopped',
  health: 'unhealthy',
  uptime: '0s',
};

// ─── Container Stats ──────────────────────────────────────────────────────────

export const mockContainerStats: ContainerStats = {
  cpuPercent: 0.03,
  memoryUsage: '9.72 MB',
  memoryLimit: '7.92 GB',
  memoryPercent: 0.12,
  networkIn: '7.831 kB',
  networkOut: '6.628 kB',
  blockRead: '0 B',
  blockWrite: '0 B',
  pids: 1,
};

// ─── Container Processes ──────────────────────────────────────────────────────

export const mockContainerProcesses: ContainerProcess[] = [
  {
    user: 'root',
    pid: 1,
    cpu: '0.03%',
    elapsed: '1h 23m',
    time: '2s',
    command: 'python app.py',
  },
];

// ─── Logs ─────────────────────────────────────────────────────────────────────

export const mockLogs: LogEntry[] = [
  { timestamp: '2026-08-18T18:00:01Z', level: 'info', message: 'FreedomOps API starting up...' },
  { timestamp: '2026-08-18T18:00:02Z', level: 'info', message: 'Connecting to Ollama runtime at http://localhost:11434' },
  { timestamp: '2026-08-18T18:00:03Z', level: 'info', message: 'Ollama connection established. Model: Qwen3' },
  { timestamp: '2026-08-18T18:00:04Z', level: 'info', message: 'Tool registry initialized with 7 tools' },
  { timestamp: '2026-08-18T18:00:05Z', level: 'info', message: 'FreedomOps API listening on port 8080' },
  { timestamp: '2026-08-18T19:34:12Z', level: 'info', message: '10.88.0.1 - GET / HTTP/1.1 200' },
  { timestamp: '2026-08-18T19:34:45Z', level: 'info', message: '10.88.0.1 - POST /api/chat HTTP/1.1 200' },
  { timestamp: '2026-08-18T19:35:01Z', level: 'info', message: 'Agent: Received query — running diagnose_application' },
  { timestamp: '2026-08-18T19:35:02Z', level: 'info', message: 'Tool: get_container_status freedomops-api → running' },
  { timestamp: '2026-08-18T19:35:03Z', level: 'info', message: 'Tool: check_application_health freedomops-api → healthy' },
  { timestamp: '2026-08-18T19:35:04Z', level: 'info', message: '10.88.0.1 - POST /api/chat HTTP/1.1 200' },
  { timestamp: '2026-08-18T19:36:00Z', level: 'info', message: 'APPROVAL REQUESTED: restart_application freedomops-api' },
  { timestamp: '2026-08-18T19:37:00Z', level: 'info', message: 'APPROVED: restart_application freedomops-api' },
  { timestamp: '2026-08-18T19:37:05Z', level: 'info', message: 'Tool: restart_application freedomops-api → success' },
  { timestamp: '2026-08-18T19:37:06Z', level: 'info', message: 'Tool: check_application_health freedomops-api → healthy' },
  { timestamp: '2026-08-18T19:37:10Z', level: 'info', message: 'FreedomOps API is healthy and responding normally.' },
];

// ─── Diagnostic Report ────────────────────────────────────────────────────────

export const mockDiagnosticsHealthy: DiagnosticsReport = {
  container: 'freedomops-api',
  overallHealth: 'healthy',
  containerStatus: mockContainerInfo,
  processes: mockContainerProcesses,
  stats: mockContainerStats,
  logs: mockLogs,
  applicationHealthy: true,
  healthMessage: 'FreedomOps API is healthy and responding normally.',
  checks: [
    { name: 'Container running', passed: true, detail: 'Container status is running' },
    { name: 'Process active', passed: true, detail: '1 process running (PID 1: python app.py)' },
    { name: 'Resource usage normal', passed: true, detail: 'CPU 0.03%, Memory 9.72 MB (0.12%)' },
    { name: 'Recent logs available', passed: true, detail: '16 log entries available' },
    { name: 'HTTP health check', passed: true, detail: 'GET / → 200 OK' },
  ],
};

export const mockDiagnosticsUnhealthy: DiagnosticsReport = {
  container: 'freedomops-api',
  overallHealth: 'unhealthy',
  containerStatus: mockContainerInfoStopped,
  processes: [],
  stats: { ...mockContainerStats, cpuPercent: 0, pids: 0 },
  logs: [
    { timestamp: '2026-08-18T19:33:50Z', level: 'error', message: 'FATAL: Application process exited unexpectedly' },
    { timestamp: '2026-08-18T19:33:51Z', level: 'error', message: 'Container stopping due to process exit' },
    { timestamp: '2026-08-18T19:33:52Z', level: 'error', message: 'Health check failed: connection refused on port 8080' },
  ],
  applicationHealthy: false,
  healthMessage: 'Application is not responding. Connection refused on port 8080.',
  checks: [
    { name: 'Container running', passed: false, detail: 'Container status is stopped' },
    { name: 'Process active', passed: false, detail: 'No active processes found' },
    { name: 'Resource usage normal', passed: false, detail: 'No resource data available' },
    { name: 'Recent logs available', passed: true, detail: '3 log entries available' },
    { name: 'HTTP health check', passed: false, detail: 'Connection refused on port 8080' },
  ],
};

// ─── Activity Timeline ────────────────────────────────────────────────────────

export const mockActivity: ActivityEntry[] = [
  { id: '1', timestamp: '19:34', tool: 'get_container_status', container: 'freedomops-api', status: 'SUCCESS', detail: 'Container is running' },
  { id: '2', timestamp: '19:35', tool: 'diagnose_application', container: 'freedomops-api', status: 'SUCCESS', detail: '5 checks completed — healthy' },
  { id: '3', timestamp: '19:36', tool: 'restart_application', container: 'freedomops-api', status: 'APPROVAL_REQUESTED', detail: 'Awaiting user approval' },
  { id: '4', timestamp: '19:37', tool: 'restart_application', container: 'freedomops-api', status: 'APPROVED', detail: 'Approved by user' },
  { id: '5', timestamp: '19:37', tool: 'check_application_health', container: 'freedomops-api', status: 'SUCCESS', detail: 'Application healthy' },
];

// ─── System Status ────────────────────────────────────────────────────────────

export const mockSystemStatus: SystemStatus = {
  overall: 'operational',
  backendConnected: true,
  ollamaConnected: true,
  targetContainer: 'freedomops-api',
  model: 'Qwen3',
  runtime: 'Ollama',
};
