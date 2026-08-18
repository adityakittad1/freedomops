import React, { useState, useRef } from 'react';
import { Search, Copy, Maximize2, CheckCheck, Terminal } from 'lucide-react';
import { cn } from '../../utils';
import { formatTimestamp } from '../../utils';
import type { LogEntry } from '../../types';

interface LogViewerProps {
  logs: LogEntry[];
  maxHeight?: string;
}

export function LogViewer({ logs, maxHeight = '320px' }: LogViewerProps) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const filtered = logs.filter((l) =>
    search ? l.message.toLowerCase().includes(search.toLowerCase()) : true
  );

  const handleCopy = () => {
    const text = filtered.map((l) => `[${formatTimestamp(l.timestamp)}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="terminal-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-border bg-bg-elevated">
        <Terminal className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        <div className="flex-1 relative">
          <Search className="w-3 h-3 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-7 pr-3 py-1 bg-bg-base border border-bg-border rounded text-xs font-mono text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-brand/50"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-panel transition-colors"
            aria-label="Copy logs"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-panel transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-text-muted font-mono">{filtered.length} lines</span>
      </div>

      {/* Log lines */}
      <div
        className="overflow-y-auto p-4 space-y-1"
        style={{ maxHeight: expanded ? '600px' : maxHeight }}
      >
        {filtered.length === 0 ? (
          <div className="text-xs text-text-muted text-center py-8">No logs matching filter</div>
        ) : (
          filtered.map((log, i) => (
            <div key={i} className="flex gap-3 group hover:bg-bg-elevated/30 rounded px-1 -mx-1 transition-colors">
              <span className="text-[11px] font-mono text-text-muted flex-shrink-0 select-none mt-px">
                {formatTimestamp(log.timestamp)}
              </span>
              <span
                className={cn(
                  'text-[12px] font-mono leading-relaxed',
                  log.level === 'error' && 'text-danger/80',
                  log.level === 'warn' && 'text-warning/80',
                  log.level === 'debug' && 'text-text-muted',
                  log.level === 'info' && 'text-text-secondary'
                )}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
