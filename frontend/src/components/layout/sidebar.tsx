import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, Map, Terminal, CheckCircle2,
  ShieldAlert, GitBranch, FileCheck, BarChart3, Scale,
  Users, Building2, Play, Settings, Bell, HelpCircle,
  FileText, ChevronLeft, ChevronRight, X, Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSidebar } from '@/providers/sidebar-provider';
import { useIsMobile } from '@/hooks';

const iconMap: Record<string, any> = {
  LayoutDashboard, Car, Map, Terminal, CheckCircle2,
  ShieldAlert, GitBranch, FileCheck, BarChart3, Scale,
  Users, Building2, Play, Settings, Bell, HelpCircle, FileText,
};

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    items: [
      { id: 'fleet', label: 'Fleet Management', path: '/app/fleet', icon: 'Car' },
      { id: 'digital-twin', label: 'Digital Twin', path: '/app/digital-twin', icon: 'Map' },
      { id: 'command-center', label: 'Command Center', path: '/app/command-center', icon: 'Terminal' },
      { id: 'approvals', label: 'Approval Center', path: '/app/approvals', icon: 'CheckCircle2' },
    ],
  },
  {
    id: 'security',
    label: 'SECURITY',
    items: [
      { id: 'threat-sandbox', label: 'Threat Sandbox', path: '/app/threat-sandbox', icon: 'ShieldAlert' },
      { id: 'verification', label: 'Verification Pipeline', path: '/app/verification', icon: 'GitBranch' },
      { id: 'audit', label: 'Audit Ledger', path: '/app/audit', icon: 'FileCheck' },
    ],
  },
  {
    id: 'insights',
    label: 'INSIGHTS',
    items: [
      { id: 'analytics', label: 'Analytics', path: '/app/analytics', icon: 'BarChart3' },
      { id: 'compliance', label: 'Compliance', path: '/app/compliance', icon: 'Scale' },
    ],
  },
  {
    id: 'people',
    label: 'PEOPLE',
    items: [
      { id: 'driver-portal', label: 'Driver Portal', path: '/app/driver-portal', icon: 'Users' },
      { id: 'organization', label: 'Organization', path: '/app/organization', icon: 'Building2' },
    ],
  },
  {
    id: 'simulation',
    label: 'SIMULATION',
    items: [
      { id: 'scenario-simulator', label: 'Scenario Simulator', path: '/app/scenario-simulator', icon: 'Play' },
    ],
  },
  {
    id: 'admin',
    label: 'ADMINISTRATION',
    items: [
      { id: 'settings', label: 'Settings', path: '/app/settings', icon: 'Settings' },
      { id: 'notifications', label: 'Activity Center', path: '/app/notifications', icon: 'Bell' },
    ],
  },
  {
    id: 'system',
    label: 'SYSTEM',
    items: [
      { id: 'help', label: 'Help Center', path: '/app/help', icon: 'HelpCircle' },
      { id: 'release-notes', label: 'Release Notes', path: '/app/release-notes', icon: 'FileText' },
    ],
  },
];

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 px-4 border-b border-[var(--color-border)] shrink-0',
        isCollapsed && !isMobile ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white shrink-0">
          <Zap size={18} />
        </div>
        {(!isCollapsed || isMobile) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base font-semibold text-[var(--color-foreground)] tracking-tight"
          >
            TrustRide
          </motion.span>
        )}
        {isMobile && (
          <button onClick={closeMobile} className="ml-auto p-1.5 rounded-md hover:bg-[var(--color-muted)] transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation - overscroll-contain prevents scrolling main dashboard window */}
      <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-2 space-y-5">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.id}>
            {(!isCollapsed || isMobile) && (
              <p className="text-overline px-2 mb-1.5">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => isMobile && closeMobile()}
                    className={cn(
                      'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-150',
                      isCollapsed && !isMobile ? 'justify-center px-2' : '',
                      isActive
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {(!isCollapsed || isMobile) && item.badge && (
                      <span className="ml-auto text-xs bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle (desktop only, above the 48px footer) */}
      {!isMobile && (
        <div className="border-t border-[var(--color-border)] p-2 shrink-0">
          <button
            onClick={toggle}
            className="flex items-center justify-center w-full p-2 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!isCollapsed && <span className="ml-2 text-sm font-medium">Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-[48px] left-0 z-50 w-[280px] bg-[var(--color-card)] border-r border-[var(--color-border)] shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar (stops 48px above the bottom so footer spans full window width)
  return (
    <aside
      className={cn(
        'fixed top-0 bottom-[48px] left-0 z-30 bg-[var(--color-card)] border-r border-[var(--color-border)] transition-[width] duration-200 ease-out',
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {sidebarContent}
    </aside>
  );
}

export default Sidebar;
