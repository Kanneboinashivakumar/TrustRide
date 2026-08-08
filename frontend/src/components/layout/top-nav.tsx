import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu, Command, User, LogOut, Settings, ChevronRight, Shield, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/providers/theme-provider';
import { useSidebar } from '@/providers/sidebar-provider';
import { useIsMobile } from '@/hooks';
import { useAuth } from '@/providers/auth-provider';

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const { openMobile } = useSidebar();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Keyboard Shortcuts (Escape to close search, Ctrl+K / Cmd+K to open search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowUserMenu(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allSearchItems = [
    { label: 'Fleet Management (/app/fleet)', category: 'Module', path: '/app/fleet' },
    { label: 'Command Center (/app/command-center)', category: 'Module', path: '/app/command-center' },
    { label: 'Approval Center (/app/approval-center)', category: 'Module', path: '/app/approval-center' },
    { label: 'Digital Twin (/app/digital-twin)', category: 'Module', path: '/app/digital-twin' },
    { label: 'Threat Sandbox (/app/threat-sandbox)', category: 'Module', path: '/app/threat-sandbox' },
    { label: 'Audit Ledger (/app/audit)', category: 'Module', path: '/app/audit' },
    { label: 'Analytics Dashboard (/app/analytics)', category: 'Module', path: '/app/analytics' },
    { label: 'Compliance Matrix (/app/compliance)', category: 'Module', path: '/app/compliance' },
    { label: 'TR-101 — Sargam Electric Rickshaw (MH-12-ER-1001)', category: 'Vehicle', path: '/app/command-center?vehicleId=TR-101' },
    { label: 'TR-102 — Mahindra Treo (KA-01-TR-2002)', category: 'Vehicle', path: '/app/command-center?vehicleId=TR-102' },
    { label: 'TR-103 — Piaggio Ape E-City (DL-01-AP-3003)', category: 'Vehicle', path: '/app/command-center?vehicleId=TR-103' },
    { label: 'V-1004 — Euler HiLoad EV (HR-26-EU-4004)', category: 'Vehicle', path: '/app/command-center?vehicleId=V-1004' },
    { label: 'V-1005 — Tata Ace EV (TN-09-TA-5005)', category: 'Vehicle', path: '/app/command-center?vehicleId=V-1005' },
    { label: 'Command: Immobilize Drivetrain (IMMOBILIZE)', category: 'Security Command', path: '/app/command-center' },
    { label: 'Command: Restore Drivetrain (RESTORE)', category: 'Operational Command', path: '/app/command-center' },
    { label: 'Command: Remote Door Lock (LOCK_DOORS)', category: 'Routine Command', path: '/app/command-center' },
    { label: 'Command: OTA Firmware Update (OTA_UPDATE)', category: 'Software Command', path: '/app/command-center' },
  ];

  const filteredSearchResults = searchQuery.trim() === ''
    ? []
    : allSearchItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  // Build breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  const themeIcon = theme === 'dark' ? Moon : Sun;
  const ThemeIcon = themeIcon;

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-6 bg-[var(--color-background)] border-b border-[var(--color-border)] transition-colors font-sans">
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={openMobile}
          className="p-2 -ml-1 mr-2 rounded-md hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)]"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.path} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight size={14} className="shrink-0 text-[var(--color-border)]" />}
            <button
              onClick={() => !crumb.isLast && navigate(crumb.path)}
              className={cn(
                'truncate transition-colors',
                crumb.isLast
                  ? 'text-[var(--color-foreground)] font-semibold cursor-default'
                  : 'hover:text-[var(--color-foreground)] cursor-pointer'
              )}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Clean Right Actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Search Trigger */}
        <button
          onClick={() => { setShowSearch(true); setSearchQuery(''); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors shadow-xs cursor-pointer"
        >
          <Search size={14} />
          {!isMobile && (
            <>
              <span>Search modules & vehicles...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-[var(--color-background)] border border-[var(--color-border)] rounded text-[var(--color-muted-foreground)]">
                <Command size={10} /> K
              </kbd>
            </>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors shadow-xs cursor-pointer"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon size={16} />
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => navigate('/app/activity-center')}
          className="relative p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors shadow-xs cursor-pointer"
          title="Activity Center & Alerts"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Profile Avatar & Dropdown (ONLY PROFILE & SIGN OUT) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-muted)] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-extrabold shadow-xs overflow-hidden">
              {user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.avatar || user?.profilePhoto || 'SK'
              )}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-60 z-50 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-2xl py-1 text-xs font-mono">
                <div className="px-3.5 py-2.5 border-b border-[var(--color-border)]">
                  <p className="font-extrabold text-[var(--color-foreground)] text-xs">{user?.name || 'Sarah Kim'}</p>
                  <p className="text-[11px] text-blue-500 font-bold">{user?.role || 'Security Officer'}</p>
                  <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">{user?.organization || 'TrustRide Commercial EV Co-op'}</p>
                </div>

                <button
                  onClick={() => { navigate('/app/settings'); setShowUserMenu(false); }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors cursor-pointer font-bold"
                >
                  <User size={15} /> User Profile
                </button>

                <div className="border-t border-[var(--color-border)] my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SEARCH COMMAND PALETTE MODAL */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4" onClick={() => setShowSearch(false)}>
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl max-w-xl w-full p-4 space-y-3 shadow-2xl font-mono text-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-2 border-b border-[var(--color-border)] pb-3">
              <Search size={18} className="text-blue-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearch(false);
                    setSearchQuery('');
                  }
                }}
                placeholder="Search vehicles, commands, threats, or audit logs..."
                className="w-full bg-transparent focus:outline-none text-sm text-[var(--color-foreground)] font-bold"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="p-1 rounded-lg bg-[var(--color-muted)] hover:bg-rose-500/20 text-[var(--color-muted-foreground)] hover:text-rose-500 font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1 shrink-0"
                title="Close Search (ESC)"
              >
                <X size={16} />
                <span className="text-[10px]">ESC</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <p className="font-bold text-xs">Type to Search TrustRide Platform</p>
                  <p className="text-[11px] text-slate-500 font-sans">Search by vehicle name (e.g. Sargam, Treo), license plate, module, or security command...</p>
                </div>
              ) : filteredSearchResults.length > 0 ? (
                <>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Search Results ({filteredSearchResults.length})</div>
                  {filteredSearchResults.map((item) => (
                    <div
                      key={item.path + item.label}
                      onClick={() => { navigate(item.path); setShowSearch(false); setSearchQuery(''); }}
                      className="p-2.5 rounded-lg border border-transparent hover:border-blue-500 hover:bg-[var(--color-muted)] cursor-pointer flex justify-between items-center text-[var(--color-foreground)]"
                    >
                      <span className="font-bold">{item.label}</span>
                      <span className="text-[10px] text-blue-500 font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{item.category} →</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-8 text-center text-amber-500 font-bold">
                  No matching modules or vehicles found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default TopNav;
