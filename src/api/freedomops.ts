/**
 * FreedomOps API — Main Interface
 *
 * All frontend code uses these functions. Never call fetch() directly in components.
 *
 * ─── INTEGRATION GUIDE ────────────────────────────────────────────────────────
 * When VITE_USE_MOCK_API=false, sendChatMessage() POSTs to:
 *   POST /api/chat  { message: string }
 * The real backend returns ApiResponse (see types/index.ts).
 *
 * The only function that connects to the backend is sendChatMessage().
 * All other functions (getDiagnostics, getApplicationStatus) are convenience
 * wrappers that in production would also be driven through /api/chat.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { USE_MOCK, apiFetch, mockDelay } from './client';
import type { ApiResponse, DiagnosticsReport, ContainerInfo, ContainerStats, ActivityEntry, SystemStatus } from '../types';
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
import type { ChatMessage } from '../types';

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Primary entry point for all AI interactions.
 *
 * In mock mode: returns pre-built ChatMessage arrays simulating the AI agent.
 * In production: POSTs to FastAPI /api/chat and returns ApiResponse.
 */
export async function sendChatMessage(
  message: string
): Promise<{ messages: ChatMessage[]; apiResponse?: ApiResponse }> {
  if (USE_MOCK) {
    await mockDelay(700);

    const lower = message.toLowerCase();

    // Unauthorized resource detection
    const knownUnauthorized = ['nginx', 'postgres', 'redis', 'mysql', 'mongodb'];
    for (const res of knownUnauthorized) {
      if (lower.includes(res)) {
        return { messages: buildUnauthorizedConversation(res) };
      }
    }

    // Route to appropriate mock conversation
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
            id: Math.random().toString(36).slice(2),
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

    // Default response
    return {
      messages: [
        {
          id: Math.random().toString(36).slice(2),
          role: 'assistant',
          content: `I can help you with **freedomops-api** infrastructure questions. Try asking:

- "Why is my application down?"
- "Show container status"  
- "Check application health"
- "Diagnose the application"
- "Show recent logs"`,
          status: 'complete',
          timestamp: Date.now(),
        },
      ],
    };
  }

  // ─── Production Mode ─────────────────────────────────────────────────────────
  const apiResponse = await apiFetch<ApiResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  return { messages: [], apiResponse };
}

// ─── Approval / Restart ───────────────────────────────────────────────────────

/**
 * Called when the user approves a WRITE operation.
 * In mock mode, simulates restart + health check.
 * In production, this would be a follow-up message to /api/chat confirming approval.
 */
export async function confirmApproval(
  tool: string,
  container: string
): Promise<{ messages: ChatMessage[] }> {
  if (USE_MOCK) {
    await mockDelay(1500);
    return { messages: buildRecoveryConversation() };
  }

  const apiResponse = await apiFetch<ApiResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: `APPROVED: ${tool} on ${container}` }),
  });

  return { messages: [], apiResponse } as any;
}

// ─── Infrastructure ───────────────────────────────────────────────────────────

export async function getApplicationStatus(): Promise<ContainerInfo> {
  if (USE_MOCK) {
    await mockDelay(300);
    return mockContainerInfo;
  }
  // In production this would be driven through /api/chat
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
