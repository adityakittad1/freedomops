import React from 'react';
import { Zap, User, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';
import { formatTime } from '../../utils';
import type { ChatMessage, ApprovalRequiredResponse } from '../../types';
import { ToolExecutionCard } from '../tools/ToolExecutionCard';
import { InvestigationPanel } from './InvestigationPanel';
import { Badge } from '../ui/Badge';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onApprovalRequested?: (approval: ApprovalRequiredResponse) => void;
  onRequestApproval?: () => void;
}

function renderMarkdown(text: string): React.ReactNode {
  // Simple inline markdown: **bold**, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-text-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="font-mono text-brand bg-brand/10 px-1 py-0.5 rounded text-xs">{part.slice(1, -1)}</code>;
    }
    // Handle line breaks
    return part.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

export function ChatMessageBubble({ message, onApprovalRequested, onRequestApproval }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-message-in', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
        isUser ? 'bg-bg-elevated border border-bg-border' : 'bg-brand/15 border border-brand/30'
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-text-secondary" />
          : <Zap className="w-3.5 h-3.5 text-brand" />
        }
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0 space-y-2', isUser && 'flex flex-col items-end')}>
        {/* Role label + time */}
        <div className={cn('flex items-center gap-2', isUser && 'flex-row-reverse')}>
          <span className="text-xs font-medium text-text-muted">
            {isUser ? 'You' : 'FreedomOps'}
          </span>
          <span className="text-[10px] text-text-muted">{formatTime(message.timestamp)}</span>
          {message.status === 'complete' && !isUser && (
            <CheckCircle2 className="w-3 h-3 text-success" />
          )}
        </div>

        {/* Message text */}
        {message.status === 'thinking' ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
            <span>Analyzing infrastructure...</span>
          </div>
        ) : (
          <div className={cn(
            'text-sm leading-relaxed',
            isUser
              ? 'bg-brand/10 border border-brand/20 rounded-xl px-4 py-2.5 text-text-primary max-w-[85%]'
              : 'text-text-secondary max-w-full'
          )}>
            {renderMarkdown(message.content)}
          </div>
        )}

        {/* Tool executions */}
        {!isUser && message.toolExecutions && message.toolExecutions.length > 0 && (
          <div className="w-full space-y-2 mt-1">
            {message.toolExecutions.map((exec, i) => (
              <ToolExecutionCard key={i} execution={exec} />
            ))}
          </div>
        )}

        {/* Investigation + Diagnosis */}
        {!isUser && message.investigationSteps && (
          <InvestigationPanel
            steps={message.investigationSteps}
            diagnosis={message.diagnosis}
            onApproveAction={onRequestApproval}
          />
        )}

        {/* Approval request inline */}
        {!isUser && message.approvalRequest && (
          <div className="w-full mt-2">
            <button
              onClick={() => onApprovalRequested?.(message.approvalRequest!)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warning-border bg-warning-dim text-warning text-sm font-medium hover:bg-amber-900/30 transition-colors"
            >
              <Badge variant="write">WRITE</Badge>
              <span>Review &amp; Approve Restart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
