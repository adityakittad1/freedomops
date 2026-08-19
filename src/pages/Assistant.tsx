import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Zap, Play, AlertCircle, RotateCcw, FlaskConical } from 'lucide-react';
import { CommandBox } from '../components/chat/CommandBox';
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble';
import { ApprovalDialog } from '../components/approval/ApprovalDialog';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { sendChatMessage, confirmApproval, buildApprovalRequest } from '../api/freedomops';
import type { ChatMessage, ApprovalRequiredResponse } from '../types';
import { buildDemoDownConversation } from '../data/mockResponses';

const SUGGESTIONS = [
  'Why is my application down?',
  'Show container status',
  'Check application health',
  'Show recent logs',
  'Diagnose the application',
  'Show nginx status',
];

const LOADING_MESSAGES = [
  'Analyzing infrastructure...',
  'Selecting DevOps tool...',
  'Running diagnostic...',
  'Collecting metrics...',
  'Verifying application health...',
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Assistant() {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [approval, setApproval] = useState<ApprovalRequiredResponse | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [pendingApprovalMsgId, setPendingApprovalMsgId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Handle initial message or demo mode from navigation state
  useEffect(() => {
    const state = location.state as { initialMessage?: string; demo?: boolean } | null;
    if (state?.demo) {
      triggerDemo();
    } else if (state?.initialMessage) {
      handleSend(state.initialMessage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const triggerDemo = async () => {
    setMessages([]);
    setIsDemoMode(true);
    await new Promise((r) => setTimeout(r, 300));

    // Step 1: Simulate user query
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: 'Why is my application down?',
      status: 'complete',
      timestamp: Date.now(),
    };
    setMessages([userMsg]);

    // Step 2: Staged loading messages (mirrors real AI agent execution)
    setLoading(true);
    setLoadingMsg('Analyzing infrastructure...');
    await new Promise((r) => setTimeout(r, 700));
    setLoadingMsg('Running get_container_status...');
    await new Promise((r) => setTimeout(r, 600));
    setLoadingMsg('Running diagnose_application...');
    await new Promise((r) => setTimeout(r, 900));
    setLoadingMsg('Collecting diagnostics...');
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);

    // Step 3: Full diagnosis response
    const [, assistantMsg] = buildDemoDownConversation();
    const msgId = uid();
    const finalMsg: ChatMessage = { ...assistantMsg, id: msgId };
    setMessages((p) => [...p, finalMsg]);
    setPendingApprovalMsgId(msgId);
  };

  const handleSend = async (message: string) => {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: message,
      status: 'complete',
      timestamp: Date.now(),
    };

    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    const li = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 800);
    setLoadingMsg(LOADING_MESSAGES[0]);

    try {
      const { messages: newMessages } = await sendChatMessage(message);
      clearInterval(li);
      setLoading(false);
      setMessages((p) => [...p, ...newMessages]);

      // Server-enforced approval gate: if any message carries an approvalRequest
      // from /api/chat, surface the approval dialog immediately.
      const withApproval = newMessages.find((m) => m.approvalRequest);
      if (withApproval?.approvalRequest) {
        setApproval(withApproval.approvalRequest);
      }

      // Mock demo path: check for diagnosis-driven approval
      const withDiagnosis = newMessages.find((m) => m.diagnosis?.actionTool);
      if (withDiagnosis) {
        setPendingApprovalMsgId(withDiagnosis.id);
      }
    } catch (err) {
      clearInterval(li);
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: 'assistant',
          content: `Failed to reach the FreedomOps backend. Check that FastAPI and Ollama are running.\n\n_${msg}_`,
          status: 'error',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleRequestApproval = () => {
    setApproval(buildApprovalRequest());
  };

  const handleApprove = async () => {
    if (!approval) return;
    setApprovalLoading(true);

    try {
      // Show optimistic "in-progress" message in the chat
      const approvedMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: `✓ Restart approved. Sending to POST /api/approve — executing \`${approval.tool}\` on \`${approval.container}\`...`,
        status: 'complete',
        timestamp: Date.now(),
        toolExecutions: [
          {
            tool: 'restart_application',
            container: approval.container,
            status: 'running',
          },
        ],
      };
      setMessages((p) => [...p, approvedMsg]);

      // POST /api/approve — the ONLY server path that executes restart
      const { messages: recoveryMsgs } = await confirmApproval(approval.tool, approval.container);
      setMessages((p) => [...p, ...recoveryMsgs]);
      setApproval(null);
      setPendingApprovalMsgId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: 'assistant',
          content: `**Restart failed.** The approval request was rejected by the server.\n\n_${msg}_`,
          status: 'error',
          timestamp: Date.now(),
        },
      ]);
      setApproval(null);
    } finally {
      setApprovalLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-bg-border bg-bg-surface flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-brand" />
              </div>
              <h1 className="text-base font-bold">AI DevOps Assistant</h1>
              {isDemoMode && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-brand/30 bg-brand/5 text-[10px] font-mono text-brand uppercase tracking-wider">
                  <FlaskConical className="w-3 h-3" />
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5 ml-9">
              Ask questions about your infrastructure in natural language.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={triggerDemo}
              disabled={loading}
              title="Simulate an application failure and walk through the full diagnosis → approval → recovery flow"
            >
              <Play className="w-3.5 h-3.5" />
              Run Recovery Demo
            </Button>
            {messages.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setMessages([]); setPendingApprovalMsgId(null); setIsDemoMode(false); }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="text-text-primary font-semibold text-base">FreedomOps AI Assistant</p>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">
                Ask about your infrastructure in plain English. FreedomOps will select
                the appropriate DevOps tool and return structured results.
              </p>
            </div>
            <div className="w-full space-y-2 text-left">
              <p className="text-xs text-text-muted uppercase tracking-widest font-mono">Try asking</p>
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-bg-border bg-bg-surface hover:border-bg-borderLight hover:bg-bg-elevated text-sm text-text-secondary font-mono transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onApprovalRequested={setApproval}
            onRequestApproval={msg.id === pendingApprovalMsgId ? handleRequestApproval : undefined}
          />
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-brand animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="transition-all">{loadingMsg}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-bg-border flex-shrink-0 bg-bg-surface">
        <CommandBox
          onSend={handleSend}
          disabled={loading}
          suggestions={SUGGESTIONS}
        />
      </div>

      {/* Approval Dialog */}
      {approval && (
        <ApprovalDialog
          approval={approval}
          onApprove={handleApprove}
          onCancel={() => setApproval(null)}
          loading={approvalLoading}
        />
      )}
    </div>
  );
}
