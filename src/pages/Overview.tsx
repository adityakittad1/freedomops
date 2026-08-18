import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Server, Cpu, HardDrive, Zap, ChevronRight, Activity, Play, FlaskConical } from 'lucide-react';
import { getGreeting } from '../utils';
import { CommandBox } from '../components/chat/CommandBox';
import { Card, CardBody } from '../components/ui/Card';
import { StatusDot } from '../components/ui/StatusDot';
import { Badge } from '../components/ui/Badge';
import { USE_MOCK } from '../api/client';
// Mock data — used when VITE_USE_MOCK_API=true
// In real mode, these values will be replaced by data from the FastAPI backend
import { mockContainerInfo, mockContainerStats } from '../data/mockInfrastructure';

const SUGGESTIONS = [
  'Why is my application down?',
  'Show container status',
  'Check application health',
  'Show recent logs',
  'Diagnose the application',
];

export default function Overview() {
  const navigate = useNavigate();
  const greeting = getGreeting();

  const handleSend = (msg: string) => {
    navigate('/app/assistant', { state: { initialMessage: msg } });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">{greeting}.</h1>
        <p className="text-text-muted text-sm">What's happening with your infrastructure?</p>
      </div>

      {/* Command Box */}
      <div>
        <CommandBox
          onSend={handleSend}
          suggestions={SUGGESTIONS}
        />
      </div>

      {/* System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Application card */}
        <Card hover>
          <CardBody className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Application</div>
                <div className="font-mono font-semibold text-text-primary">{mockContainerInfo.name}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-success-dim border border-success-border flex items-center justify-center">
                <Server className="w-4 h-4 text-success" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusDot status={mockContainerInfo.status} pulse />
              <span className="text-xs font-mono font-semibold text-success uppercase">{mockContainerInfo.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-text-muted mb-0.5">Health</div>
                <div className="font-semibold text-success uppercase">{mockContainerInfo.health}</div>
              </div>
              <div>
                <div className="text-text-muted mb-0.5">Port</div>
                <div className="font-mono text-text-secondary">8080</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/infrastructure')}
              className="text-xs text-brand hover:text-brand/80 flex items-center gap-1 transition-colors"
            >
              View details <ChevronRight className="w-3 h-3" />
            </button>
          </CardBody>
        </Card>

        {/* CPU / Memory card */}
        <Card hover>
          <CardBody className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Resources</div>
                <div className="font-mono font-semibold text-text-primary">freedomops-api</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-brand" />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">CPU</span>
                <span className="font-mono text-text-primary">{mockContainerStats.cpuPercent}%</span>
              </div>
              <div className="h-1 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${Math.max(mockContainerStats.cpuPercent * 5, 2)}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Memory</span>
                <span className="font-mono text-text-primary">{mockContainerStats.memoryUsage}</span>
              </div>
              <div className="h-1 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${Math.max(mockContainerStats.memoryPercent * 5, 2)}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <div className="text-text-muted mb-0.5">Memory %</div>
                <div className="font-mono text-text-secondary">{mockContainerStats.memoryPercent}%</div>
              </div>
              <div>
                <div className="text-text-muted mb-0.5">Processes</div>
                <div className="font-mono text-text-secondary">{mockContainerStats.pids}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardBody className="space-y-2">
            <div className="text-[10px] text-text-muted uppercase tracking-widest mb-3">Quick Actions</div>
            {[
              { label: 'AI Assistant', icon: MessageSquare, to: '/app/assistant' },
              { label: 'Run Diagnostics', icon: Activity, to: '/app/diagnostics' },
              { label: 'View Infrastructure', icon: Server, to: '/app/infrastructure' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors border border-transparent hover:border-bg-border text-left"
              >
                <item.icon className="w-4 h-4 text-text-muted flex-shrink-0" />
                {item.label}
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ))}

            <div className="pt-2 border-t border-bg-border">
              <button
                onClick={() => navigate('/app/assistant', { state: { demo: true } })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand hover:bg-brand/5 transition-colors border border-brand/20 text-left"
                title="Simulate an application failure and walk through the full diagnosis → approval → recovery flow"
              >
                <FlaskConical className="w-4 h-4 flex-shrink-0" />
                Run Recovery Demo
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Security strip */}
      <div className="bg-bg-surface border border-bg-border rounded-xl px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-brand" />
          <span className="text-xs font-semibold text-text-primary">FreedomOps Security</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            'Controlled tool execution',
            'Authorized resources only',
            'No arbitrary shell commands',
            'READ / WRITE separation',
            'Human approval for WRITE ops',
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
