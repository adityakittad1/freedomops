import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Shield, Server, CheckCircle, ArrowDown,
  Terminal, Cpu, GitBranch, Box, User, Lock,
  Layers, Database, Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// ─── Architecture layers ───────────────────────────────────────────────────────

type LayerColor = 'brand' | 'info' | 'warning' | 'success' | 'neutral';

interface ArchNode {
  label: string;
  sub: string;
  layer: LayerColor;
  icon: React.ElementType;
}

const ARCH_NODES: ArchNode[] = [
  { label: 'User', sub: 'Natural language query', layer: 'neutral', icon: User },
  { label: 'React Frontend', sub: 'FreedomOps UI', layer: 'neutral', icon: Layers },
  { label: 'FastAPI /api/chat', sub: 'REST API gateway', layer: 'info', icon: Server },
  { label: 'Qwen3 / Ollama', sub: 'Local LLM — no external calls', layer: 'brand', icon: Zap },
  { label: 'AI Agent / Orchestrator', sub: 'Tool selection & reasoning', layer: 'brand', icon: Cpu },
  { label: 'Tool Registry', sub: '7 controlled tools — READ & WRITE', layer: 'warning', icon: Database },
  { label: 'DevOps Tool Router', sub: 'Authorization & policy enforcement', layer: 'warning', icon: Lock },
  { label: 'scripts/devops-tool.sh', sub: 'Podman / Linux execution', layer: 'success', icon: Terminal },
  { label: 'Infrastructure', sub: 'Podman containers · Ansible', layer: 'success', icon: Box },
];

const LAYER_LABELS: Record<LayerColor, string> = {
  neutral: 'User / UI',
  info: 'API Layer',
  brand: 'AI Layer',
  warning: 'Security / Policy',
  success: 'DevOps Execution',
};

const layerStyle: Record<LayerColor, { border: string; bg: string; icon: string; label: string }> = {
  neutral: {
    border: 'border-bg-border',
    bg: 'bg-bg-surface',
    icon: 'text-text-muted',
    label: 'text-text-muted',
  },
  info: {
    border: 'border-info-border',
    bg: 'bg-info-dim',
    icon: 'text-info',
    label: 'text-info',
  },
  brand: {
    border: 'border-brand/30',
    bg: 'bg-brand/5',
    icon: 'text-brand',
    label: 'text-brand',
  },
  warning: {
    border: 'border-warning/30',
    bg: 'bg-warning/5',
    icon: 'text-warning',
    label: 'text-warning',
  },
  success: {
    border: 'border-success/30',
    bg: 'bg-success/5',
    icon: 'text-success',
    label: 'text-success',
  },
};

// ─── Security guarantees ──────────────────────────────────────────────────────

const SECURITY_ITEMS = [
  { label: 'Registered tools only', detail: 'No ad-hoc command execution' },
  { label: 'Authorized resources only', detail: 'Unapproved containers are rejected' },
  { label: 'No arbitrary shell commands', detail: 'Browser never touches shell' },
  { label: 'READ / WRITE separation', detail: 'Every tool is classified' },
  { label: 'Human approval for WRITE ops', detail: 'restart_application requires explicit approval' },
  { label: 'Local AI — no external calls', detail: 'Qwen3 runs on-premise via Ollama' },
];

// ─── Team ─────────────────────────────────────────────────────────────────────

const TEAM = [
  {
    name: 'Aditya Kittad',
    role: 'DevOps Engineering • Infrastructure • AI/Agent Integration',
    initials: 'AK',
    color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
    areas: [
      'Infrastructure & containerization',
      'Podman runtime management',
      'Ansible automation',
      'DevOps Tool Router',
      'scripts/devops-tool.sh',
      'Diagnostic & recovery workflows',
      'AI ↔ DevOps integration layer',
      'Security policy & execution control',
    ],
  },
  {
    name: 'Sakshi Pardeshi',
    role: 'DevOps Engineering • AI/Backend • Agent Integration',
    initials: 'SP',
    color: 'from-violet-500/20 to-blue-500/20 border-violet-500/30',
    areas: [
      'FastAPI backend & API design',
      'Ollama / Qwen3 integration',
      'AI Agent orchestration',
      'Tool Registry design',
      'DevOps automation pipelines',
      'Infrastructure integration layer',
      'AI ↔ DevOps integration layer',
      'Approval workflows & security',
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const [archVisible, setArchVisible] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Nav */}
      <nav className="border-b border-bg-border bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand" />
            </div>
            <span className="font-bold tracking-wide text-sm">FreedomOps</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block font-mono">MVP 1.0 · LOCAL</span>
            <Button size="sm" variant="primary" onClick={() => navigate('/app')}>
              <Zap className="w-3.5 h-3.5" />
              Launch FreedomOps
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/5 text-xs text-brand mb-8 font-mono">
          <Shield className="w-3 h-3" />
          <span>Self-Hosted · Local AI · Controlled Tool Execution · Human-Approved Writes</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-none">
          <span className="text-gradient-brand">FreedomOps</span>
        </h1>

        <p className="text-xl sm:text-2xl text-text-secondary font-light mb-4">
          Self-Hosted AI-Powered DevOps Assistant
        </p>

        <p className="text-2xl sm:text-3xl font-medium text-text-primary mb-6">
          "Talk to your infrastructure in plain English."
        </p>

        <p className="max-w-2xl mx-auto text-base text-text-muted leading-relaxed mb-10">
          FreedomOps combines a local AI agent with a controlled DevOps tool registry to diagnose
          infrastructure problems and assist with safe, human-approved application recovery.
          No cloud. No external APIs. No arbitrary shell commands.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Button size="lg" variant="primary" onClick={() => navigate('/app')} className="w-full sm:w-auto">
            <Zap className="w-4 h-4" />
            Launch FreedomOps
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setArchVisible(true)} className="w-full sm:w-auto">
            <GitBranch className="w-4 h-4" />
            View Architecture
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/app/assistant', { state: { demo: true } })} className="w-full sm:w-auto">
            <Play className="w-4 h-4" />
            Run Recovery Demo
          </Button>
        </div>

        {/* Technical positioning pills */}
        <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
          {[
            { text: 'Qwen3 via Ollama', color: 'text-brand border-brand/30 bg-brand/5' },
            { text: 'No arbitrary shell exec', color: 'text-success border-success/30 bg-success/5' },
            { text: 'Controlled tool registry', color: 'text-warning border-warning/30 bg-warning/5' },
            { text: 'Authorized resources only', color: 'text-info border-info-border bg-info-dim' },
            { text: 'READ / WRITE separation', color: 'text-text-secondary border-bg-border bg-bg-surface' },
            { text: 'Human-approved WRITE ops', color: 'text-warning border-warning/30 bg-warning/5' },
          ].map((p) => (
            <span key={p.text} className={`px-2.5 py-1 rounded-full border ${p.color}`}>
              {p.text}
            </span>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-bg-border">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">System Architecture</h2>
          <p className="text-text-muted text-sm">
            End-to-end request flow from natural language to controlled infrastructure
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Layer legend */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs">
            {(Object.entries(LAYER_LABELS) as [LayerColor, string][]).map(([key, label]) => (
              <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${layerStyle[key].border} ${layerStyle[key].bg}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${layerStyle[key].icon.replace('text-', 'bg-')}`} />
                <span className={layerStyle[key].label}>{label}</span>
              </div>
            ))}
          </div>

          {/* Nodes */}
          {ARCH_NODES.map((node, i) => {
            const style = layerStyle[node.layer];
            return (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-4 border rounded-xl px-4 py-3.5 ${style.border} ${style.bg}`}>
                  <div className={`w-8 h-8 rounded-lg bg-bg-base/60 border ${style.border} flex items-center justify-center flex-shrink-0`}>
                    <node.icon className={`w-4 h-4 ${style.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${style.label}`}>{node.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{node.sub}</div>
                  </div>
                  <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${style.border} ${style.label} opacity-70 flex-shrink-0 hidden sm:block`}>
                    {LAYER_LABELS[node.layer]}
                  </div>
                </div>
                {i < ARCH_NODES.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Return path note */}
          <div className="mt-4 flex justify-center">
            <div className="px-4 py-2.5 rounded-xl border border-bg-border bg-bg-surface text-xs text-text-muted text-center font-mono">
              Structured JSON → AI Agent → FastAPI → Frontend → User
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-bg-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-success-dim border border-success-border flex items-center justify-center">
              <Shield className="w-4 h-4 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Security Model</h2>
              <p className="text-xs text-text-muted">Every operation enforces these guarantees</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {SECURITY_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3 bg-bg-surface border border-bg-border rounded-xl p-4 hover:border-bg-borderLight transition-colors">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-bg-border">
        <div className="text-center mb-10">
          <div className="text-xs text-text-muted uppercase tracking-widest mb-2 font-mono">Built by</div>
          <h2 className="text-2xl font-bold">The Team</h2>
          <p className="text-text-muted text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            FreedomOps is a collaborative engineering project. Both engineers work across
            AI, DevOps, infrastructure automation, and controlled self-hosted operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {TEAM.map((member) => (
            <div key={member.name} className={`bg-gradient-to-br ${member.color} border rounded-2xl p-6`}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-text-primary">{member.initials}</span>
                </div>
                <div>
                  <div className="font-bold text-text-primary">{member.name}</div>
                  <div className="text-xs text-text-muted leading-snug mt-0.5">{member.role}</div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {member.areas.map((area) => (
                  <li key={area} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-1 h-1 rounded-full bg-brand/50 flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border bg-bg-surface py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold">FreedomOps</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-muted">Built by Aditya Kittad &amp; Sakshi Pardeshi</div>
            <div className="text-xs text-text-muted">DevOps Engineering × AI Engineering</div>
          </div>
          <div className="text-xs text-text-muted">© 2026 FreedomOps</div>
        </div>
      </footer>

      {/* Full Architecture Modal */}
      {archVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setArchVisible(false)}
        >
          <div
            className="bg-bg-panel border border-bg-border rounded-2xl p-6 max-w-sm w-full mx-4 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-5">
              <GitBranch className="w-4 h-4 text-brand" />
              <h3 className="text-base font-bold">Full Request Flow</h3>
            </div>
            <div className="space-y-px font-mono text-xs">
              {[
                { text: 'User', layer: 'neutral' as LayerColor },
                { text: 'FreedomOps Frontend (React)', layer: 'neutral' as LayerColor },
                { text: 'FastAPI  POST /api/chat', layer: 'info' as LayerColor },
                { text: 'Qwen3 / Ollama  [local]', layer: 'brand' as LayerColor },
                { text: 'AI Agent / Orchestrator', layer: 'brand' as LayerColor },
                { text: 'Tool Registry  [7 tools]', layer: 'warning' as LayerColor },
                { text: 'DevOps Tool Router', layer: 'warning' as LayerColor },
                { text: 'scripts/devops-tool.sh', layer: 'success' as LayerColor },
                { text: 'Podman / Linux Infrastructure', layer: 'success' as LayerColor },
                { text: 'Structured JSON', layer: 'success' as LayerColor },
                { text: 'AI Agent', layer: 'brand' as LayerColor },
                { text: 'FastAPI  response', layer: 'info' as LayerColor },
                { text: 'Frontend  (rendered)', layer: 'neutral' as LayerColor },
                { text: 'User', layer: 'neutral' as LayerColor },
              ].map((step, i, arr) => {
                const style = layerStyle[step.layer];
                return (
                  <div key={i}>
                    <div className={`px-3 py-2 rounded-lg border ${style.border} ${style.bg} ${style.label}`}>
                      {step.text}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-text-muted pl-3 py-0.5 text-[10px]">↓</div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="secondary" className="w-full mt-5" onClick={() => setArchVisible(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
