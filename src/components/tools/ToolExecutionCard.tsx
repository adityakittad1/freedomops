import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Settings, Search,
  CheckCircle, XCircle, Loader2, Terminal, AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils';
import { Badge } from '../ui/Badge';
import { TOOL_OPERATION_TYPE } from '../../types';
import type { ToolExecution } from '../../types';

interface ToolExecutionCardProps {
  execution: ToolExecution;
}

const TOOL_ICONS: Partial<Record<string, React.ElementType>> = {
  diagnose_application: Search,
  restart_application: AlertTriangle,
};

export function ToolExecutionCard({ execution }: ToolExecutionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const opType = TOOL_OPERATION_TYPE[execution.tool];
  const isWrite = opType === 'WRITE';
  const Icon = TOOL_ICONS[execution.tool] ?? Settings;

  const statusIcon =
    execution.status === 'running'
      ? <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
      : execution.status === 'success'
      ? <CheckCircle className="w-3.5 h-3.5 text-success" />
      : execution.status === 'failed'
      ? <XCircle className="w-3.5 h-3.5 text-danger" />
      : <div className="w-3.5 h-3.5 rounded-full bg-bg-border" />;

  const jsonOutput = execution.result
    ? JSON.stringify(execution.result, null, 2)
    : null;

  const hasResult = !!jsonOutput;
  const canExpand = hasResult;

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors overflow-hidden',
        execution.status === 'running' && 'border-brand/30 bg-brand/5',
        execution.status === 'success' && !isWrite && 'border-bg-border bg-bg-elevated hover:border-bg-borderLight',
        execution.status === 'success' && isWrite && 'border-success/30 bg-success/5',
        execution.status === 'failed' && 'border-danger/30 bg-danger/5',
        execution.status === 'pending' && 'border-bg-border bg-bg-elevated opacity-50'
      )}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => canExpand && setExpanded((p) => !p)}
        aria-expanded={expanded}
        disabled={!canExpand}
      >
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-7 h-7 rounded flex items-center justify-center',
          isWrite ? 'bg-warning/10' : 'bg-bg-panel'
        )}>
          <Icon className={cn('w-3.5 h-3.5', isWrite ? 'text-warning' : 'text-text-muted')} />
        </div>

        {/* Tool info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-text-primary">{execution.tool}</span>
            <Badge variant={isWrite ? 'write' : 'read'}>{opType}</Badge>
          </div>
          <div className="text-xs text-text-muted mt-0.5 font-mono">{execution.container}</div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusIcon}
          {execution.status === 'success' && <Badge variant="success">SUCCESS</Badge>}
          {execution.status === 'failed' && <Badge variant="failed">FAILED</Badge>}
          {execution.status === 'running' && (
            <span className="text-xs text-brand font-mono">RUNNING</span>
          )}
          {execution.status === 'pending' && (
            <Badge variant="approval">APPROVAL REQUIRED</Badge>
          )}
          {canExpand && (
            expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          )}
        </div>
      </button>

      {/* Error detail */}
      {execution.status === 'failed' && execution.result?.error && (
        <div className="px-4 pb-3 flex items-start gap-2">
          <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-px" />
          <div className="text-xs text-danger/80 font-mono leading-relaxed">
            [{execution.result.error.type}] {execution.result.error.message}
          </div>
        </div>
      )}

      {/* Expanded JSON output */}
      {expanded && jsonOutput && (
        <div className="border-t border-bg-border bg-bg-base">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-bg-border">
            <Terminal className="w-3 h-3 text-text-muted" />
            <span className="text-xs text-text-muted font-mono">
              $ freedomops-tool {execution.tool} {execution.container}
            </span>
          </div>
          <pre className="px-4 py-3 text-xs font-mono text-text-secondary overflow-x-auto leading-relaxed max-h-52 overflow-y-auto">
            {jsonOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
