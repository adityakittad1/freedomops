import type {
  ChatMessage,
  ToolExecution,
  ApprovalRequiredResponse,
} from '../types';

// ─── Helper ───────────────────────────────────────────────────────────────────

const id = () => Math.random().toString(36).slice(2);

// ─── Mock Conversation: "Why is my application down?" ─────────────────────────
// (Used in demo mode - unhealthy scenario)

export function buildDemoDownConversation(): ChatMessage[] {
  const userMsg: ChatMessage = {
    id: id(),
    role: 'user',
    content: 'Why is my application down?',
    status: 'complete',
    timestamp: Date.now(),
  };

  const toolExecutions: ToolExecution[] = [
    {
      tool: 'get_container_status',
      container: 'freedomops-api',
      status: 'success',
      result: {
        success: true,
        tool: 'get_container_status',
        container: 'freedomops-api',
        data: { status: 'stopped' },
        error: null,
      },
    },
    {
      tool: 'get_container_processes',
      container: 'freedomops-api',
      status: 'success',
      result: {
        success: true,
        tool: 'get_container_processes',
        container: 'freedomops-api',
        data: { processes: [] },
        error: null,
      },
    },
    {
      tool: 'get_container_stats',
      container: 'freedomops-api',
      status: 'success',
      result: {
        success: true,
        tool: 'get_container_stats',
        container: 'freedomops-api',
        data: { cpu: '0%', memory: '0 B' },
        error: null,
      },
    },
    {
      tool: 'get_container_logs',
      container: 'freedomops-api',
      status: 'success',
      result: {
        success: true,
        tool: 'get_container_logs',
        container: 'freedomops-api',
        data: { lines: ['FATAL: Application process exited unexpectedly', 'Container stopping due to process exit'] },
        error: null,
      },
    },
    {
      tool: 'check_application_health',
      container: 'freedomops-api',
      status: 'failed',
      result: {
        success: false,
        tool: 'check_application_health',
        container: 'freedomops-api',
        data: null,
        error: { type: 'execution_error', message: 'Connection refused on port 8080' },
      },
    },
  ];

  const assistantMsg: ChatMessage = {
    id: id(),
    role: 'assistant',
    content: `**freedomops-api appears to be unavailable.**

I've completed a diagnostic investigation across 5 checks. Here's what I found:`,
    status: 'complete',
    timestamp: Date.now() + 500,
    toolExecutions,
    investigationSteps: [
      { label: 'Container status', status: 'done' },
      { label: 'Processes', status: 'done' },
      { label: 'Resource metrics', status: 'done' },
      { label: 'Recent logs', status: 'done' },
      { label: 'Application health', status: 'failed' },
    ],
    diagnosis: {
      summary: 'freedomops-api appears to be unavailable.',
      potentialCause: 'The application container has stopped. The process exited unexpectedly and the container is no longer running.',
      recommendedAction: 'Restarting the application may restore service. This is a WRITE operation and requires your explicit approval.',
      actionTool: 'restart_application',
    },
  };

  return [userMsg, assistantMsg];
}

// ─── Mock: Container Status Query ─────────────────────────────────────────────

export function buildStatusConversation(): ChatMessage[] {
  const userMsg: ChatMessage = {
    id: id(),
    role: 'user',
    content: 'Show container status',
    status: 'complete',
    timestamp: Date.now(),
  };

  const assistantMsg: ChatMessage = {
    id: id(),
    role: 'assistant',
    content: `**freedomops-api** is currently **running** and healthy.

The container has been up for 1 hour 23 minutes, serving on port 8080.`,
    status: 'complete',
    timestamp: Date.now() + 300,
    toolExecutions: [
      {
        tool: 'get_container_status',
        container: 'freedomops-api',
        status: 'success',
        result: {
          success: true,
          tool: 'get_container_status',
          container: 'freedomops-api',
          data: { status: 'running', image: 'localhost/freedomops-api:latest', port: '8080' },
          error: null,
        },
      },
    ],
  };

  return [userMsg, assistantMsg];
}

// ─── Mock: Health Check Query ──────────────────────────────────────────────────

export function buildHealthConversation(): ChatMessage[] {
  const userMsg: ChatMessage = {
    id: id(),
    role: 'user',
    content: 'Check application health',
    status: 'complete',
    timestamp: Date.now(),
  };

  const assistantMsg: ChatMessage = {
    id: id(),
    role: 'assistant',
    content: `**Application health check complete.**

**freedomops-api** is healthy. The HTTP endpoint responded with **200 OK**. All systems are operating normally.`,
    status: 'complete',
    timestamp: Date.now() + 300,
    toolExecutions: [
      {
        tool: 'check_application_health',
        container: 'freedomops-api',
        status: 'success',
        result: {
          success: true,
          tool: 'check_application_health',
          container: 'freedomops-api',
          data: { healthy: true, statusCode: 200, message: 'FreedomOps API is healthy.' },
          error: null,
        },
      },
    ],
  };

  return [userMsg, assistantMsg];
}

// ─── Mock: Diagnose Query ──────────────────────────────────────────────────────

export function buildDiagnoseConversation(): ChatMessage[] {
  const userMsg: ChatMessage = {
    id: id(),
    role: 'user',
    content: 'Diagnose the application',
    status: 'complete',
    timestamp: Date.now(),
  };

  const assistantMsg: ChatMessage = {
    id: id(),
    role: 'assistant',
    content: `**Diagnostic investigation complete — application is healthy.**

All 5 diagnostic checks passed. The container is running, processes are active, resource usage is nominal, and the HTTP health endpoint is responding normally.`,
    status: 'complete',
    timestamp: Date.now() + 800,
    toolExecutions: [
      {
        tool: 'diagnose_application',
        container: 'freedomops-api',
        status: 'success',
        result: {
          success: true,
          tool: 'diagnose_application',
          container: 'freedomops-api',
          data: {
            checks: 5,
            passed: 5,
            failed: 0,
            health: 'healthy',
          },
          error: null,
        },
      },
    ],
    investigationSteps: [
      { label: 'Container status', status: 'done' },
      { label: 'Processes', status: 'done' },
      { label: 'Resource metrics', status: 'done' },
      { label: 'Recent logs', status: 'done' },
      { label: 'Application health', status: 'done' },
    ],
  };

  return [userMsg, assistantMsg];
}

// ─── Mock: Unauthorized Resource ──────────────────────────────────────────────

export function buildUnauthorizedConversation(resource: string): ChatMessage[] {
  const userMsg: ChatMessage = {
    id: id(),
    role: 'user',
    content: `Show ${resource} status`,
    status: 'complete',
    timestamp: Date.now(),
  };

  const assistantMsg: ChatMessage = {
    id: id(),
    role: 'assistant',
    content: `**Resource not authorized.**

\`${resource}\` is not an approved FreedomOps resource. The tool registry only permits operations on explicitly authorized containers.

Currently authorized: \`freedomops-api\`

This restriction is enforced at the DevOps tool layer — FreedomOps does not operate on unapproved infrastructure.`,
    status: 'complete',
    timestamp: Date.now() + 200,
    toolExecutions: [
      {
        tool: 'get_container_status',
        container: resource,
        status: 'failed',
        result: {
          success: false,
          tool: 'get_container_status',
          container: resource,
          data: null,
          error: {
            type: 'validation_error',
            message: `Container '${resource}' is not an approved FreedomOps resource.`,
          },
        },
      },
    ],
  };

  return [userMsg, assistantMsg];
}

// ─── Mock: Approval Required ──────────────────────────────────────────────────

export function buildApprovalRequest(): ApprovalRequiredResponse {
  return {
    type: 'approval_required',
    tool: 'restart_application',
    container: 'freedomops-api',
    message: 'Restarting freedomops-api requires explicit user approval. This is a WRITE operation.',
  };
}

// ─── Mock: Post-Approval Recovery ─────────────────────────────────────────────

export function buildRecoveryConversation(): ChatMessage[] {
  return [
    {
      id: id(),
      role: 'assistant',
      content: `**Application recovered successfully.**

The restart completed and the health check confirms **freedomops-api** is now healthy and responding on port 8080.`,
      status: 'complete',
      timestamp: Date.now(),
      toolExecutions: [
        {
          tool: 'restart_application',
          container: 'freedomops-api',
          status: 'success',
          result: {
            success: true,
            tool: 'restart_application',
            container: 'freedomops-api',
            data: { restarted: true, newUptime: '0m 5s' },
            error: null,
          },
        },
        {
          tool: 'check_application_health',
          container: 'freedomops-api',
          status: 'success',
          result: {
            success: true,
            tool: 'check_application_health',
            container: 'freedomops-api',
            data: { healthy: true, statusCode: 200, message: 'FreedomOps API is healthy.' },
            error: null,
          },
        },
      ],
    },
  ];
}
