/**
 * FreedomOps API — Main Interface
 *
 * All frontend code uses these functions. Never call fetch() directly in components.
 *
 * ─── REAL BACKEND FLOW ────────────────────────────────────────────────────────
 *
 * READ operations:
 *   sendChatMessage(msg)
 *     → POST /api/chat { message }
 *     → backend runs Qwen3 + DevOps tool
 *     → returns { status: "ok", ai_decision, devops_result, final_response }
 *     → mapChatResponse() converts to ChatMessage[]
 *
 * WRITE operations (approval gate is SERVER-ENFORCED):
 *   sendChatMessage(msg)
 *     → POST /api/chat { message }
 *     → backend detects WRITE intent, does NOT execute anything
 *     → returns { status: "approval_required", tool, container, message }
 *     → mapChatResponse() surfaces ApprovalDialog in the UI
 *
 *   confirmApproval(tool, container)
 *     → POST /api/approve { tool, container }
 *     → THIS is the only path that actually executes restart
 *     → backend validates + runs DevOps script + health check
 *     → returns { status: "ok", devops_result, health_result }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { USE_MOCK, API_BASE, apiFetch, mockDelay } from './client';
import type {
  ApiResponse,
  DiagnosticsReport,
  ContainerInfo,
  ContainerStats,
  ActivityEntry,
  SystemStatus,
  ChatMessage,
  ToolExecution,
  ApprovalRequiredResponse,
} from '../types';
import {
  mockContainerInfo,
  mockContainerStats,
  mockDiagnosticsHealthy,
  mockActivity,
  mockSystemStatus,
  APPROVED_RESOURCES,
} from '../data/mockInfrastructure';
import {
  buildStatusConversation,
  buildHealthConversation,
  buildDiagnoseConversation,
  buildDemoDownConversation,
  buildUnauthorizedConversation,
  buildApprovalRequest,
  buildRecoveryConversation,
} from '../data/mockResponses';

// ─── Backend Response Shapes ─────────────────────────────────────────────────

/** Shape returned by POST /api/chat for READ operations */
interface BackendChatOk {
  status: 'ok';
  ai_decision: string;
  devops_result: BackendDevOpsResult;
  final_response: string;
}

/** Shape returned by POST /api/chat when a WRITE is detected (server-enforced gate) */
interface BackendApprovalRequired {
  status: 'approval_required';
  tool: string;
  container: string;
  ai_decision: string;
  message: string;
}

/** Shape returned by POST /api/chat when AI fails to select a tool */
interface BackendChatError {
  status: 'error';
  ai_decision: string;
  devops_result: null;
  final_response: string;
}

type BackendChatResponse = BackendChatOk | BackendApprovalRequired | BackendChatError;

/** Shape returned by POST /api/approve */
interface BackendApproveOk {
  status: 'ok';
  tool: string;
  container: string;
  devops_result: BackendDevOpsResult;
  health_result: BackendDevOpsResult;
}

/** DevOps tool result as returned by the shell script */
interface BackendDevOpsResult {
  success: boolean;
  tool?: string;
  container?: string;
  data?: Record<string, unknown> | null;
  error?: { type: string; message: string } | null;
  // restart_application specific
  operation?: string;
  approval_required?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

/**
 * Parse the "Operation: read/write" line from the AI decision string.
 */
function parseOperation(ai_decision: string): 'read' | 'write' | null {
  for (const line of ai_decision.split('\n')) {
    const stripped = line.trim();
    if (stripped.startsWith('Operation:')) {
      const val = stripped.split(':', 2)[1]?.trim().toLowerCase();
      if (val === 'read' || val === 'write') return val;
    }
  }
  return null;
}


/**
 * Build a ToolExecution record from a BackendDevOpsResult for display in the UI.
 */
function buildToolExecution(devops: BackendDevOpsResult): ToolExecution | null {
  if (!devops.tool) return null;
  // Validate tool name is a known ToolName — fall back to best-effort cast
  const tool = devops.tool as ToolExecution['tool'];
  const container = (devops.container ?? 'freedomops-api') as string;
  return {
    tool,
    container,
    status: devops.success ? 'success' : 'failed',
    result: {
      success: devops.success,
      tool,
      container,
      data: (devops.data as Record<string, unknown>) ?? null,
      error: devops.error
        ? { type: devops.error.type as 'validation_error' | 'execution_error' | 'timeout_error' | 'connection_error', message: devops.error.message }
        : null,
    },
  };
}

/**
 * Convert a real backend response from POST /api/chat into the ChatMessage[]
 * shape that the UI already knows how to render.
 *
 * Handles all response states:
 *  - status: "ok"               → normal AI response + optional tool card
 *  - status: "approval_required" → approval dialog (server-gate)
 *  - status: "error"            → error message
 *  - devops_result with error   → failed tool card
 *  - validation_error           → unauthorized resource card
 */
function mapChatResponse(backend: BackendChatResponse): ChatMessage[] {
  const now = Date.now();

  // ── approval_required (server enforced WRITE gate) ──────────────────────────
  if (backend.status === 'approval_required') {
    const approval: ApprovalRequiredResponse = {
      type: 'approval_required',
      tool: backend.tool as ApprovalRequiredResponse['tool'],
      container: backend.container,
      message: backend.message,
    };
    return [
      {
        id: uid(),
        role: 'assistant',
        content: `**Approval required to restart \`${backend.container}\`.**\n\nThis is a WRITE operation. The server has not made any changes. Your explicit approval is required before \`${backend.tool}\` will execute.`,
        status: 'complete',
        timestamp: now,
        approvalRequest: approval,
      },
    ];
  }

  // ── error (AI couldn't pick a tool) ─────────────────────────────────────────
  if (backend.status === 'error') {
    return [
      {
        id: uid(),
        role: 'assistant',
        content: backend.final_response || 'The AI could not determine the right DevOps tool for that request.',
        status: 'error',
        timestamp: now,
      },
    ];
  }

  // ── status: "ok" ─────────────────────────────────────────────────────────────
  const devops = backend.devops_result;
  const toolExec = buildToolExecution(devops);

  // Detect validation_error (unauthorized resource)
  if (!devops.success && devops.error?.type === 'validation_error') {
    return [
      {
        id: uid(),
        role: 'assistant',
        content: `**Resource not authorized.**\n\n\`${devops.container}\` is not an approved FreedomOps resource. The DevOps tool layer rejected this request.\n\nCurrently authorized: \`freedomops-api\``,
        status: 'complete',
        timestamp: now,
        toolExecutions: toolExec ? [toolExec] : undefined,
      },
    ];
  }

  return [
    {
      id: uid(),
      role: 'assistant',
      content: backend.final_response,
      status: devops.success ? 'complete' : 'error',
      timestamp: now,
      toolExecutions: toolExec ? [toolExec] : undefined,
    },
  ];
}

/**
 * Convert a real backend response from POST /api/approve into ChatMessage[].
 * Shows both the restart result and the post-restart health check.
 */
function mapApproveResponse(backend: BackendApproveOk): ChatMessage[] {
  const now = Date.now();
  const executions: ToolExecution[] = [];

  const restartExec = buildToolExecution(backend.devops_result);
  if (restartExec) executions.push(restartExec);

  const healthExec = buildToolExecution(backend.health_result);
  if (healthExec) executions.push(healthExec);

  const healthy = backend.health_result?.success === true;

  return [
    {
      id: uid(),
      role: 'assistant',
      content: healthy
        ? `**Application recovered successfully.**\n\nRestart completed. Health check confirms \`${backend.container}\` is now healthy and responding.`
        : `**Restart completed, but health check did not pass.**\n\nThe container was restarted, but the application may still be starting up or encountered an issue.`,
      status: healthy ? 'complete' : 'error',
      timestamp: now,
      toolExecutions: executions,
    },
  ];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Primary entry point for all AI interactions.
 *
 * Mock mode: returns pre-built ChatMessage[] arrays.
 * Real mode: POSTs to /api/chat. For READ ops returns a tool card + AI summary.
 *            For WRITE ops the server returns approval_required — NO execution happens.
 */
export async function sendChatMessage(
  message: string
): Promise<{ messages: ChatMessage[]; apiResponse?: ApiResponse }> {
  if (USE_MOCK) {
    await mockDelay(700);
    const lower = message.toLowerCase();

    const knownUnauthorized = ['nginx', 'postgres', 'redis', 'mysql', 'mongodb'];
    for (const res of knownUnauthorized) {
      if (lower.includes(res)) {
        return { messages: buildUnauthorizedConversation(res) };
      }
    }

    if (lower.includes('down') || lower.includes('unavailable') || lower.includes('not working')) {
      return { messages: buildDemoDownConversation() };
    }
    if (lower.includes('diagnose') || lower.includes('diagnostic')) {
      return { messages: buildDiagnoseConversation() };
    }
    if (lower.includes('health')) {
      return { messages: buildHealthConversation() };
    }
    if (lower.includes('status') || lower.includes('container')) {
      return { messages: buildStatusConversation() };
    }
    if (lower.includes('log')) {
      return {
        messages: [
          {
            id: uid(),
            role: 'assistant',
            content: 'Fetching recent logs for **freedomops-api**...',
            status: 'complete',
            timestamp: Date.now(),
            toolExecutions: [
              {
                tool: 'get_container_logs',
                container: 'freedomops-api',
                status: 'success',
                result: {
                  success: true,
                  tool: 'get_container_logs',
                  container: 'freedomops-api',
                  data: {
                    lines: [
                      'FreedomOps API listening on port 8080',
                      '10.88.0.1 - GET / HTTP/1.1 200',
                      '10.88.0.1 - POST /api/chat HTTP/1.1 200',
                    ],
                  },
                  error: null,
                },
              },
            ],
          },
        ],
      };
    }

    return {
      messages: [
        {
          id: uid(),
          role: 'assistant',
          content: `I can help you with **freedomops-api** infrastructure questions. Try asking:\n\n- "Why is my application down?"\n- "Show container status"\n- "Check application health"\n- "Diagnose the application"\n- "Show recent logs"`,
          status: 'complete',
          timestamp: Date.now(),
        },
      ],
    };
  }

  // ─── Real Backend ─────────────────────────────────────────────────────────
  const backend = await apiFetch<BackendChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  const messages = mapChatResponse(backend);
  return { messages };
}

// ─── Approval / Restart ───────────────────────────────────────────────────────

/**
 * Called when the user approves a WRITE operation.
 *
 * Mock mode: simulates recovery.
 * Real mode: POSTs to POST /api/approve — this is the ONLY server path
 *            that actually executes restart_application through the DevOps router.
 *            The backend independently validates the tool name and container.
 */
export async function confirmApproval(
  tool: string,
  container: string
): Promise<{ messages: ChatMessage[] }> {
  if (USE_MOCK) {
    await mockDelay(1500);
    return { messages: buildRecoveryConversation() };
  }

  const backend = await apiFetch<BackendApproveOk>('/api/approve', {
    method: 'POST',
    body: JSON.stringify({ tool, container }),
  });

  const messages = mapApproveResponse(backend);
  return { messages };
}

// ─── Infrastructure ───────────────────────────────────────────────────────────

export async function getApplicationStatus(): Promise<ContainerInfo> {
  if (USE_MOCK) {
    await mockDelay(300);
    return mockContainerInfo;
  }
  throw new Error('Production getApplicationStatus not yet implemented');
}

export async function getContainerStats(): Promise<ContainerStats> {
  if (USE_MOCK) {
    await mockDelay(300);
    return mockContainerStats;
  }
  throw new Error('Production getContainerStats not yet implemented');
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export async function getDiagnostics(): Promise<DiagnosticsReport> {
  if (USE_MOCK) {
    await mockDelay(800);
    return mockDiagnosticsHealthy;
  }
  throw new Error('Production getDiagnostics not yet implemented');
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function getActivity(): Promise<ActivityEntry[]> {
  if (USE_MOCK) {
    await mockDelay(200);
    return mockActivity;
  }
  throw new Error('Production getActivity not yet implemented');
}

// ─── System Status ────────────────────────────────────────────────────────────

export async function getSystemStatus(): Promise<SystemStatus> {
  if (USE_MOCK) {
    await mockDelay(100);
    return mockSystemStatus;
  }
  throw new Error('Production getSystemStatus not yet implemented');
}

// ─── Authorization Check ──────────────────────────────────────────────────────

export function isAuthorizedResource(name: string): boolean {
  return APPROVED_RESOURCES.includes(name);
}

export { buildApprovalRequest };
