// ─── Tool Types ───────────────────────────────────────────────────────────────

export type ToolName =
  | 'get_container_status'
  | 'get_container_logs'
  | 'get_container_stats'
  | 'get_container_processes'
  | 'check_application_health'
  | 'diagnose_application'
  | 'restart_application';

export type OperationType = 'READ' | 'WRITE';

export const TOOL_OPERATION_TYPE: Record<ToolName, OperationType> = {
  get_container_status: 'READ',
  get_container_logs: 'READ',
  get_container_stats: 'READ',
  get_container_processes: 'READ',
  check_application_health: 'READ',
  diagnose_application: 'READ',
  restart_application: 'WRITE',
};

// ─── API Response Types ───────────────────────────────────────────────────────

export interface FinalResponse {
  type: 'final';
  response: string;
  toolsExecuted?: ToolResult[];
}

export interface ApprovalRequiredResponse {
  type: 'approval_required';
  tool: ToolName;
  container: string;
  message: string;
}

export type ApiResponse = FinalResponse | ApprovalRequiredResponse;

// ─── Tool Results ─────────────────────────────────────────────────────────────

export interface ToolError {
  type: 'validation_error' | 'execution_error' | 'timeout_error' | 'connection_error';
  message: string;
}

export interface ToolResult {
  success: boolean;
  tool: ToolName;
  container: string;
  data: Record<string, unknown> | null;
  error: ToolError | null;
}

// ─── Container / Infrastructure ───────────────────────────────────────────────

export type ContainerStatus = 'running' | 'stopped' | 'exited' | 'paused' | 'restarting';
export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown';

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  command: string;
  status: ContainerStatus;
  health: HealthStatus;
  port: string;
  createdAt: string;
  uptime: string;
}

export interface ContainerStats {
  cpuPercent: number;
  memoryUsage: string;
  memoryLimit: string;
  memoryPercent: number;
  networkIn: string;
  networkOut: string;
  blockRead: string;
  blockWrite: string;
  pids: number;
}

export interface ContainerProcess {
  user: string;
  pid: number;
  cpu: string;
  elapsed: string;
  time: string;
  command: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface DiagnosticsReport {
  container: string;
  overallHealth: HealthStatus;
  containerStatus: ContainerInfo;
  processes: ContainerProcess[];
  stats: ContainerStats;
  logs: LogEntry[];
  applicationHealthy: boolean;
  healthMessage: string;
  checks: DiagnosticCheck[];
}

export interface DiagnosticCheck {
  name: string;
  passed: boolean;
  detail: string;
}

// ─── Chat / Conversation ─────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'thinking' | 'complete' | 'error';

export interface ToolExecution {
  tool: ToolName;
  container: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: ToolResult;
  startedAt?: number;
  completedAt?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: number;
  toolExecutions?: ToolExecution[];
  approvalRequest?: ApprovalRequiredResponse;
  investigationSteps?: InvestigationStep[];
  diagnosis?: DiagnosisSummary;
}

export interface InvestigationStep {
  label: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}

export interface DiagnosisSummary {
  summary: string;
  potentialCause: string;
  recommendedAction: string;
  actionTool?: ToolName;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityStatus = 'SUCCESS' | 'FAILED' | 'APPROVAL_REQUESTED' | 'APPROVED' | 'PENDING';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  tool: ToolName;
  container: string;
  status: ActivityStatus;
  detail?: string;
}

// ─── System Status ────────────────────────────────────────────────────────────

export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down';
  backendConnected: boolean;
  ollamaConnected: boolean;
  targetContainer: string;
  model: string;
  runtime: string;
}
