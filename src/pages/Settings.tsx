import React from 'react';
import { Settings, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { USE_MOCK } from '../api/client';

function SettingRow({ label, value, badge }: { label: string; value: string; badge?: 'success' | 'failed' | 'neutral' | 'warning' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-bg-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        {badge ? (
          <Badge variant={badge}>{value}</Badge>
        ) : (
          <span className="font-mono text-sm text-text-primary">{value}</span>
        )}
      </div>
    </div>
  );
}

function SecurityRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-bg-border last:border-0">
      {enabled
        ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
        : <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
      }
      <span className="text-sm text-text-secondary flex-1">{label}</span>
      <Badge variant={enabled ? 'success' : 'failed'}>{enabled ? 'ENABLED' : 'DISABLED'}</Badge>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-text-muted mt-1">System configuration and security policy</p>
      </div>

      {/* Mode banner */}
      {USE_MOCK && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-warning-dim border border-warning-border rounded-xl text-sm text-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Running in Mock Mode — set <code className="font-mono bg-warning/10 px-1 rounded">VITE_USE_MOCK_API=false</code> to connect the real backend.</span>
        </div>
      )}

      {/* AI Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold">AI Configuration</span>
          </div>
        </CardHeader>
        <CardBody className="py-0 px-5">
          <SettingRow label="Model" value="Qwen3" />
          <SettingRow label="Runtime" value="Ollama" />
          <SettingRow label="Mode" value="Local / Self-hosted" />
          <SettingRow label="API Mode" value={USE_MOCK ? 'Mock' : 'Production'} badge={USE_MOCK ? 'warning' : 'success'} />
        </CardBody>
      </Card>

      {/* Infrastructure */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">Infrastructure</span>
        </CardHeader>
        <CardBody className="py-0 px-5">
          <SettingRow label="Backend" value="FastAPI" />
          <SettingRow label="Container Runtime" value="Podman" />
          <SettingRow label="Automation" value="Ansible" />
          <SettingRow label="Target Container" value="freedomops-api" />
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold">Security Policy</span>
          </div>
        </CardHeader>
        <CardBody className="py-0 px-5">
          <SecurityRow label="Controlled tool execution" enabled={true} />
          <SecurityRow label="Authorized resources only" enabled={true} />
          <SecurityRow label="READ / WRITE separation" enabled={true} />
          <SecurityRow label="Human approval for WRITE operations" enabled={true} />
          <SecurityRow label="Arbitrary shell execution" enabled={false} />
        </CardBody>
      </Card>

      {/* Tool Registry */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">Tool Registry</span>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-widest mb-2">READ Operations</div>
              <div className="flex flex-wrap gap-2">
                {['get_container_status', 'get_container_logs', 'get_container_stats', 'get_container_processes', 'check_application_health', 'diagnose_application'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 px-2 py-1 bg-info-dim border border-info-border rounded font-mono text-xs text-info">
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-widest mb-2">WRITE Operations (Approval Required)</div>
              <div className="flex flex-wrap gap-2">
                {['restart_application'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 px-2 py-1 bg-warning-dim border border-warning-border rounded font-mono text-xs text-warning">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
