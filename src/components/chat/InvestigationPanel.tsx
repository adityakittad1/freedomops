import React from 'react';
import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';
import { cn } from '../../utils';
import type { InvestigationStep, DiagnosisSummary } from '../../types';
import { Badge } from '../ui/Badge';

interface InvestigationPanelProps {
  steps: InvestigationStep[];
  diagnosis?: DiagnosisSummary;
  onApproveAction?: () => void;
}

export function InvestigationPanel({ steps, diagnosis, onApproveAction }: InvestigationPanelProps) {
  return (
    <div className="space-y-3 mt-3">
      {/* Investigation steps */}
      <div className="bg-bg-elevated border border-bg-border rounded-xl p-4">
        <div className="text-xs text-text-muted uppercase tracking-widest mb-3 font-medium">Investigation</div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {step.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />}
              {step.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />}
              {step.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-brand animate-spin flex-shrink-0" />}
              {step.status === 'pending' && <Circle className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />}
              <span className={cn(
                'text-sm',
                step.status === 'done' && 'text-text-secondary',
                step.status === 'failed' && 'text-danger/80',
                step.status === 'running' && 'text-text-primary',
                step.status === 'pending' && 'text-text-muted',
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnosis */}
      {diagnosis && (
        <div className="bg-bg-elevated border border-bg-border rounded-xl p-4 space-y-3">
          <div className="text-xs text-text-muted uppercase tracking-widest mb-1 font-medium">Diagnosis</div>

          <p className="text-sm font-medium text-text-primary">{diagnosis.summary}</p>

          <div className="space-y-2 text-sm">
            <div>
              <div className="text-xs text-text-muted mb-0.5">Potential cause</div>
              <div className="text-text-secondary">{diagnosis.potentialCause}</div>
            </div>
            <div>
              <div className="text-xs text-text-muted mb-0.5">Recommended action</div>
              <div className="text-text-secondary">{diagnosis.recommendedAction}</div>
            </div>
          </div>

          {diagnosis.actionTool && onApproveAction && (
            <button
              onClick={onApproveAction}
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg border border-warning-border bg-warning-dim text-warning text-sm font-medium hover:bg-amber-900/30 transition-colors w-full justify-center"
            >
              <Badge variant="write">WRITE</Badge>
              <span>Request Restart Approval</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
