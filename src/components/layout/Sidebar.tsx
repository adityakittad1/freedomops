import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Server,
  Activity,
  Stethoscope,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
} from 'lucide-react';
import { cn } from '../../utils';
import { StatusDot } from '../ui/StatusDot';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/assistant', label: 'AI Assistant', icon: MessageSquare, end: false },
  { to: '/app/infrastructure', label: 'Infrastructure', icon: Server, end: false },
  { to: '/app/diagnostics', label: 'Diagnostics', icon: Stethoscope, end: false },
  { to: '/app/activity', label: 'Activity', icon: Activity, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-bg-surface border-r border-bg-border transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b border-bg-border min-h-[57px]', collapsed && 'justify-center px-0')}>
        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-brand/20 border border-brand/30">
          <Zap className="w-4 h-4 text-brand" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold tracking-wide text-text-primary">FreedomOps</div>
            <div className="text-[10px] text-text-muted">DevOps AI</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors group',
                isActive
                  ? 'bg-brand/10 text-brand border border-brand/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
                collapsed && 'justify-center px-0 py-2.5'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={cn('p-3 border-t border-bg-border space-y-3', collapsed && 'px-2')}>
        {/* System status */}
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <StatusDot status="operational" size="sm" pulse />
          {!collapsed && (
            <div>
              <div className="text-xs text-success font-medium">System Operational</div>
              <div className="text-[10px] text-text-muted">MVP 1.0</div>
            </div>
          )}
        </div>

        {/* Creator credit */}
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-text-muted flex-shrink-0" />
            <span className="text-[10px] text-text-muted leading-tight">
              Built by Aditya Kittad &amp; Sakshi Pardeshi
            </span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
