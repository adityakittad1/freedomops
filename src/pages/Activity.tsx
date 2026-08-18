import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { TOOL_OPERATION_TYPE } from '../types';
import { mockActivity } from '../data/mockInfrastructure';
import type { ActivityStatus } from '../types';

function StatusBadge({ status }: { status: ActivityStatus }) {
  if (status === 'SUCCESS') return <Badge variant="success">SUCCESS</Badge>;
  if (status === 'FAILED') return <Badge variant="failed">FAILED</Badge>;
  if (status === 'APPROVAL_REQUESTED') return <Badge variant="approval">APPROVAL</Badge>;
  if (status === 'APPROVED') return <Badge variant="success">APPROVED</Badge>;
  return <Badge variant="neutral">PENDING</Badge>;
}

export default function ActivityPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Activity</h1>
        <p className="text-sm text-text-muted mt-1">Tool execution history and audit trail</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-text-muted">Legend:</span>
        <Badge variant="read">READ</Badge>
        <Badge variant="write">WRITE</Badge>
        <Badge variant="success">SUCCESS</Badge>
        <Badge variant="failed">FAILED</Badge>
        <Badge variant="approval">APPROVAL</Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-bg-border" />

        <div className="space-y-0">
          {mockActivity.map((entry, i) => {
            const opType = TOOL_OPERATION_TYPE[entry.tool];
            return (
              <div key={entry.id} className="relative flex gap-6 pb-6 group animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                {/* Timestamp */}
                <div className="w-20 flex-shrink-0 text-right pt-1">
                  <span className="text-xs font-mono text-text-muted">{entry.timestamp}</span>
                </div>

                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    entry.status === 'SUCCESS' || entry.status === 'APPROVED'
                      ? 'bg-success border-success'
                      : entry.status === 'FAILED'
                      ? 'bg-danger border-danger'
                      : entry.status === 'APPROVAL_REQUESTED'
                      ? 'bg-warning border-warning'
                      : 'bg-bg-border border-bg-borderLight'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 bg-bg-surface border border-bg-border rounded-xl px-4 py-3 hover:border-bg-borderLight transition-colors">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium text-text-primary">{entry.tool}</span>
                        <Badge variant={opType === 'READ' ? 'read' : 'write'}>{opType}</Badge>
                        <StatusBadge status={entry.status} />
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 font-mono">{entry.container}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {entry.timestamp}
                    </div>
                  </div>
                  {entry.detail && (
                    <div className="mt-2 text-xs text-text-secondary">{entry.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-5">
        <div className="text-xs text-text-muted uppercase tracking-widest mb-3">Session Summary</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold text-text-primary">{mockActivity.length}</div>
            <div className="text-xs text-text-muted">Total operations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">{mockActivity.filter(a => a.status === 'SUCCESS' || a.status === 'APPROVED').length}</div>
            <div className="text-xs text-text-muted">Successful</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">{mockActivity.filter(a => a.status === 'APPROVAL_REQUESTED' || a.status === 'APPROVED').length}</div>
            <div className="text-xs text-text-muted">WRITE operations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-danger">{mockActivity.filter(a => a.status === 'FAILED').length}</div>
            <div className="text-xs text-text-muted">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
