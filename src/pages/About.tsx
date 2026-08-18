import React from 'react';
import { Zap } from 'lucide-react';

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

const TECH = [
  { name: 'React', desc: 'Frontend UI framework' },
  { name: 'TypeScript', desc: 'Type-safe development' },
  { name: 'FastAPI', desc: 'AI & REST backend' },
  { name: 'Qwen3', desc: 'Local language model' },
  { name: 'Ollama', desc: 'LLM runtime' },
  { name: 'Podman', desc: 'Container engine' },
  { name: 'Ansible', desc: 'Automation' },
  { name: 'Vite', desc: 'Build tool' },
];

export default function About() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto">
          <Zap className="w-7 h-7 text-brand" />
        </div>
        <h1 className="text-2xl font-bold">About FreedomOps</h1>
        <p className="text-text-muted text-sm max-w-xl mx-auto leading-relaxed">
          FreedomOps is a self-hosted AI-powered DevOps assistant designed to help engineers
          understand, diagnose and safely recover infrastructure through natural-language interaction.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 text-center">
        <blockquote className="text-lg font-medium text-text-primary">
          "Talk to your infrastructure in plain English."
        </blockquote>
        <p className="text-sm text-text-muted mt-3 leading-relaxed">
          FreedomOps combines a local AI agent with controlled DevOps tools to diagnose
          infrastructure problems and assist with safe application recovery — all self-hosted,
          without sending data to external services.
        </p>
        <div className="mt-4 text-xs text-brand font-medium tracking-wide">
          Self-hosted · Controlled · Human-approved
        </div>
      </div>

      {/* Creators */}
      <div>
        <div className="text-xs text-text-muted uppercase tracking-widest text-center mb-6">Built by</div>

        <div className="text-center mb-4 text-sm text-text-muted">
          FreedomOps is built collaboratively by two cross-functional engineers combining AI, DevOps,
          infrastructure automation, and controlled self-hosted operations.
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className={`bg-gradient-to-br ${member.color} border rounded-2xl p-6`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-bg-border flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-text-primary">{member.initials}</span>
                </div>
                <div>
                  <div className="font-bold text-text-primary">{member.name}</div>
                  <div className="text-xs text-text-muted">{member.role}</div>
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
      </div>

      {/* Technology */}
      <div>
        <div className="text-xs text-text-muted uppercase tracking-widest text-center mb-6">Technology</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TECH.map((t) => (
            <div
              key={t.name}
              className="bg-bg-surface border border-bg-border rounded-xl px-4 py-3 text-center hover:border-bg-borderLight transition-colors"
            >
              <div className="text-sm font-semibold text-text-primary">{t.name}</div>
              <div className="text-xs text-text-muted mt-0.5">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-bg-border pt-6 text-center space-y-1">
        <div className="text-sm text-text-muted">© 2026 FreedomOps</div>
        <div className="text-sm text-text-muted">Built by Aditya Kittad &amp; Sakshi Pardeshi</div>
        <div className="text-xs text-text-muted">DevOps Engineering × AI Engineering</div>
      </div>
    </div>
  );
}
