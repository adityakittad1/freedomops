import React, { useState } from 'react';
import { Stethoscope, RefreshCw, CheckCircle, XCircle, Cpu, HardDrive, Network, Activity } from 'lucide-react';
import { StatusDot } from '../components/ui/StatusDot';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LogViewer } from '../components/diagnostics/LogViewer';
import { mockDiagnosticsHealthy, mockDiagnosticsUnhealthy } from '../data/mockInfrastructure';
import type { DiagnosticsReport } from '../types';

export default function Diagnostics() {
  const [report, setReport] = useState<DiagnosticsReport>(mockDiagnosticsHealthy);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<'healthy' | 'unhealthy'>('healthy');

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setReport(scenario === 'healthy' ? mockDiagnosticsHealthy : mockDiagnosticsUnhealthy);
    setLoading(false);
  };

  const toggleScenario = () => {
    const next = scenario === 'healthy' ? 'unhealthy' : 'healthy';
    setScenario(next);
    setReport(next === 'healthy' ? mockDiagnosticsHealthy : mockDiagnosticsUnhealthy);
  };

  const healthy = report.overallHealth === 'healthy';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Application Diagnostics</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-text-muted">Target:</span>
            <span className="font-mono text-sm text-text-secondary">{report.container}</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status={report.overallHealth} pulse={healthy} />
              <span className={`text-xs font-semibold uppercase ${healthy ? 'text-success' : 'text-danger'}`}>
                {report.overallHealth}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={toggleScenario}>
            Toggle: {scenario === 'healthy' ? 'Simulate Failure' : 'Restore Health'}
          </Button>
          <Button size="sm" variant="secondary" onClick={refresh} loading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Diagnostic Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold">Diagnostic Checks</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-2.5">
          {report.checks.map((check, i) => (
            <div key={i} className="flex items-center gap-3">
              {check.passed
                ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                : <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
              }
              <div className="flex-1">
                <span className="text-sm text-text-primary">{check.name}</span>
                <span className="text-xs text-text-muted ml-2">{check.detail}</span>
              </div>
              <Badge variant={check.passed ? 'success' : 'failed'}>
                {check.passed ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* 1. Container Status */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">1 · Container Status</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Status', value: report.containerStatus.status.toUpperCase(), highlight: healthy },
              { label: 'Image', value: report.containerStatus.image, mono: true },
              { label: 'Command', value: report.containerStatus.command, mono: true },
              { label: 'Port', value: report.containerStatus.port, mono: true },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-text-muted mb-1">{item.label}</div>
                <div className={`${item.mono ? 'font-mono' : 'font-semibold'} ${item.highlight ? 'text-success' : 'text-text-primary'} break-all`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 2. Processes */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">2 · Container Processes</span>
        </CardHeader>
        <CardBody>
          {report.processes.length === 0 ? (
            <div className="text-sm text-text-muted italic">No active processes found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-bg-border">
                    {['USER', 'PID', 'CPU', 'ELAPSED', 'TIME', 'COMMAND'].map((h) => (
                      <th key={h} className="text-left py-2 pr-6 text-text-muted font-medium uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.processes.map((p, i) => (
                    <tr key={i} className="border-b border-bg-border/50 last:border-0">
                      <td className="py-2.5 pr-6 text-text-secondary">{p.user}</td>
                      <td className="py-2.5 pr-6 text-text-primary">{p.pid}</td>
                      <td className="py-2.5 pr-6 text-text-secondary">{p.cpu}</td>
                      <td className="py-2.5 pr-6 text-text-secondary">{p.elapsed}</td>
                      <td className="py-2.5 pr-6 text-text-secondary">{p.time}</td>
                      <td className="py-2.5 text-brand">{p.command}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 3. Resource Metrics */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">3 · Resource Metrics</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Cpu, label: 'CPU', value: `${report.stats.cpuPercent}%` },
              { icon: HardDrive, label: 'Memory', value: report.stats.memoryUsage },
              { icon: HardDrive, label: 'Mem %', value: `${report.stats.memoryPercent}%` },
              { icon: Network, label: 'Net In', value: report.stats.networkIn },
              { icon: Network, label: 'Net Out', value: report.stats.networkOut },
              { icon: Activity, label: 'PIDs', value: String(report.stats.pids) },
            ].map((m) => (
              <div key={m.label} className="bg-bg-elevated rounded-xl p-3 text-center">
                <m.icon className="w-4 h-4 text-text-muted mx-auto mb-2" />
                <div className="text-sm font-mono font-semibold text-text-primary">{m.value}</div>
                <div className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">{m.label}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 4. Logs */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">4 · Recent Logs</span>
        </CardHeader>
        <CardBody className="p-0">
          <LogViewer logs={report.logs} />
        </CardBody>
      </Card>

      {/* 5. Application Health */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold">5 · Application Health</span>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              healthy ? 'bg-success-dim border border-success-border' : 'bg-danger-dim border border-danger-border'
            }`}>
              <StatusDot status={report.overallHealth} pulse={healthy} />
            </div>
            <div>
              <div className={`text-sm font-semibold ${healthy ? 'text-success' : 'text-danger'}`}>
                {healthy ? '● HEALTHY' : '● UNHEALTHY'}
              </div>
              <div className="text-sm text-text-secondary mt-0.5">{report.healthMessage}</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
