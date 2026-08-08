import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Terminal, ShieldAlert, BarChart3, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSidebar } from '@/providers/sidebar-provider';

const MOBILE_NAV_ITEMS = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/app/fleet', icon: Car, label: 'Fleet' },
  { path: '/app/command-center', icon: Terminal, label: 'Commands' },
  { path: '/app/threat-sandbox', icon: ShieldAlert, label: 'Security' },
  { path: '/app/analytics', icon: BarChart3, label: 'Insights' },
];

export function MobileNav() {
  const location = useLocation();
  const { openMobile } = useSidebar();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[var(--color-card)] border-t border-[var(--color-border)] safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors',
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)]'
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={openMobile}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-[var(--color-muted-foreground)]"
        >
          <Menu size={20} />
          <span className="font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
