import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ExternalLink, FileText, Stethoscope, ChevronRight } from 'lucide-react';
import { StatusDot } from '../components/ui/StatusDot';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockContainerInfo } from '../data/mockInfrastructure';

export default function Infrastructure() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold">Infrastructure</h1>
        <p className="text-sm text-text-muted mt-1">
          Authorized containers managed by FreedomOps
        </p>
      </div>

      {/* Info strip */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-brand/5 border border-brand/20 rounded-xl text-xs text-brand">
        <Server className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          Only authorized resources are shown. FreedomOps enforces resource restrictions at the tool layer.
        </span>
      </div>

      {/* Containers */}
      <div>
        <div className="text-xs text-text-muted uppercase tracking-widest mb-3">Containers</div>

        <Card hover>
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Container icon + status */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-success-dim border border-success-border flex items-center justify-center">
                  <Server className="w-5 h-5 text-success" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-text-primary text-base">{mockContainerInfo.name}</span>
                      <StatusDot status={mockContainerInfo.status} pulse />
                      <span className="text-xs font-mono font-semibold text-success uppercase">{mockContainerInfo.status}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">ID: {mockContainerInfo.id}</div>
                  </div>
                  <Badge variant="neutral">Authorized</Badge>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-text-muted mb-0.5">Image</div>
                    <div className="font-mono text-text-secondary break-all">{mockContainerInfo.image}</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-0.5">Command</div>
                    <div className="font-mono text-text-secondary">{mockContainerInfo.command}</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-0.5">Port</div>
                    <div className="font-mono text-text-secondary">8080 → 8080</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-0.5">Uptime</div>
                    <div className="font-mono text-text-secondary">{mockContainerInfo.uptime}</div>
                  </div>
                </div>

                {/* Health */}
                <div className="flex items-center gap-2 px-3 py-2 bg-success-dim border border-success-border rounded-lg w-fit">
                  <StatusDot status="healthy" pulse />
                  <span className="text-xs font-medium text-success">HEALTHY</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate('/app/assistant', { state: { initialMessage: 'Show container status' } })}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate('/app/assistant', { state: { initialMessage: 'Show recent logs' } })}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Logs
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate('/app/diagnostics')}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Diagnose
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Security note */}
      <div className="bg-bg-surface border border-bg-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Resource Authorization</h3>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>FreedomOps only operates on explicitly authorized containers. Requests for other resources are rejected at the tool layer.</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div className="px-3 py-2.5 bg-success-dim border border-success-border rounded-lg">
              <div className="text-xs text-text-muted mb-1">Authorized</div>
              <div className="font-mono text-sm text-success">freedomops-api</div>
            </div>
            <div className="px-3 py-2.5 bg-danger-dim border border-danger-border rounded-lg">
              <div className="text-xs text-text-muted mb-1">Not authorized (example)</div>
              <div className="font-mono text-sm text-danger">nginx, postgres, redis, ...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
