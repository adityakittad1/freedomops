import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, Wifi, WifiOff, Loader2, Zap } from 'lucide-react';
import { StatusDot } from '../ui/StatusDot';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { USE_MOCK } from '../../api/client';
import { cn } from '../../utils';

function ConnectionBadge() {
  const { backend, ollama, refresh } = useConnectionStatus();

  const isConnected = backend === 'connected';
  const isConnecting = backend === 'connecting';
  const isOffline = backend === 'offline' || backend === 'error';

  return (
    <button
      onClick={refresh}
      title={isConnected ? 'Backend connected — click to re-check' : 'Click to retry connection'}
      className={cn(
        'hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
        isConnected && 'bg-success-dim border-success-border text-success',
        isConnecting && 'bg-bg-elevated border-bg-border text-text-muted',
        isOffline && 'bg-danger-dim border-danger-border text-danger cursor-pointer hover:bg-red-900/30'
      )}
      aria-label="Connection status"
    >
      {isConnecting && <Loader2 className="w-3 h-3 animate-spin" />}
      {isConnected && <Wifi className="w-3 h-3" />}
      {isOffline && <WifiOff className="w-3 h-3" />}
      <span>
        {isConnecting ? 'Connecting' : isConnected ? 'Connected' : backend === 'error' ? 'Error' : 'Offline'}
      </span>
      {USE_MOCK && (
        <span className="ml-0.5 px-1 py-px rounded text-[9px] font-mono bg-warning/10 text-warning border border-warning/20">
          MOCK
        </span>
      )}
    </button>
  );
}

export function Header() {
  const { backend, ollama } = useConnectionStatus();

  return (
    <header className="h-14 bg-bg-surface border-b border-bg-border flex items-center justify-between px-5 flex-shrink-0">
      {/* Left: brand + environment */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest text-text-primary uppercase">FreedomOps</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-bg-elevated border border-bg-border text-text-muted font-mono">LOCAL</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <StatusDot
              status={backend === 'connected' ? 'operational' : backend === 'connecting' ? 'degraded' : 'down'}
              size="sm"
              pulse={backend === 'connected'}
            />
            <span className={backend === 'connected' ? 'text-text-secondary' : 'text-text-muted'}>
              {backend === 'connected' ? 'Operational' : backend === 'connecting' ? 'Connecting…' : 'Offline'}
            </span>
          </div>
          <span className="text-bg-border">·</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-brand" />
            <span className={cn(
              'font-medium',
              ollama === 'connected' ? 'text-text-secondary' : 'text-text-muted'
            )}>Qwen3</span>
            <span className="text-bg-border">/</span>
            <span className={ollama === 'connected' ? '' : 'opacity-50'}>Ollama</span>
          </div>
          <span className="text-bg-border">·</span>
          <div className="flex items-center gap-1">
            <span>Target:</span>
            <span className="font-mono text-text-secondary">freedomops-api</span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        <ConnectionBadge />

        <button
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <Link
          to="/app/settings"
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
