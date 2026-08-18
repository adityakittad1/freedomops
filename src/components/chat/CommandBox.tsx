import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap } from 'lucide-react';
import { cn } from '../../utils';

interface CommandBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
}

export function CommandBox({
  onSend,
  disabled = false,
  placeholder = 'Ask FreedomOps anything about your infrastructure...',
  suggestions = [],
}: CommandBoxProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSend = () => {
    const msg = value.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input box */}
      <div className={cn(
        'relative rounded-xl border transition-colors bg-bg-elevated',
        disabled
          ? 'border-bg-border opacity-60 cursor-not-allowed'
          : 'border-bg-border focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20'
      )}>
        <div className="flex items-start gap-3 px-4 pt-3.5 pb-2">
          <Zap className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none outline-none leading-relaxed min-h-[24px]"
            aria-label="Ask FreedomOps"
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-bg-border">
          <span className="text-xs text-text-muted">
            <kbd className="px-1 py-0.5 rounded bg-bg-panel border border-bg-border font-mono text-[10px]">Enter</kbd>
            {' '}send ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-bg-panel border border-bg-border font-mono text-[10px]">Shift+Enter</kbd>
            {' '}new line
          </span>

          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              value.trim() && !disabled
                ? 'bg-brand text-white hover:bg-brand-dim'
                : 'bg-bg-panel text-text-muted cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setValue(s); textareaRef.current?.focus(); }}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg text-xs text-text-secondary border border-bg-border hover:border-bg-borderLight hover:text-text-primary transition-colors bg-bg-elevated font-mono disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
