import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { ApprovalRequiredResponse } from '../../types';

interface ApprovalDialogProps {
  approval: ApprovalRequiredResponse;
  onApprove: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ApprovalDialog({ approval, onApprove, onCancel, loading = false }: ApprovalDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus Cancel first — safest default for a destructive action
    const timer = setTimeout(() => cancelRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-title"
    >
      <div className="bg-bg-panel border-2 border-warning/50 rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-slide-up overflow-hidden">

        {/* Top warning band */}
        <div className="bg-warning/10 border-b border-warning/30 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <span className="text-xs font-mono font-bold text-warning uppercase tracking-widest">
              Write Operation — Approval Required
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-warning/60 hover:text-warning hover:bg-warning/10 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Operation summary */}
          <div className="bg-bg-elevated border border-bg-border rounded-xl p-4 space-y-4">
            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 font-mono">Tool</div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-lg font-bold text-text-primary">{approval.tool}</span>
                <Badge variant="write">WRITE</Badge>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5 font-mono">Target</div>
              <div className="font-mono text-base font-semibold text-warning">{approval.container}</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-bg-base rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-text-muted mb-0.5 font-mono">Operation</div>
                <div className="font-mono text-sm font-bold text-warning">RESTART</div>
              </div>
              <div className="bg-bg-base rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-text-muted mb-0.5 font-mono">Type</div>
                <div className="font-mono text-sm font-bold text-warning">WRITE</div>
              </div>
            </div>
          </div>

          {/* Message from AI agent */}
          <p className="text-sm text-text-secondary leading-relaxed">
            {approval.message}
          </p>

          {/* Warning */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-warning/8 border border-warning/25 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-warning mt-px flex-shrink-0" />
            <div className="text-xs text-warning/80 leading-relaxed">
              <strong className="font-semibold">This action will modify infrastructure.</strong>
              {' '}Restarting the container briefly interrupts service. FreedomOps does not execute
              WRITE operations without explicit human approval.
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Your approval is logged. Only authorized resources can be targeted.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              ref={cancelRef}
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              className="flex-1 font-semibold"
              onClick={onApprove}
              loading={loading}
            >
              Approve Restart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
