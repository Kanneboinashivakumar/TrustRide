import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useSidebar } from '@/providers/sidebar-provider';
import { useIsMobile } from '@/hooks';
import { cn } from '@/utils/cn';
import { pageVariants } from '@/motion/variants';

export function AppLayout() {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-background)] relative pb-[48px]">
      <Sidebar />
      <div
        className={cn(
          'min-h-screen transition-[margin-left] duration-200 ease-out',
          isMobile ? 'ml-0' : isCollapsed ? 'ml-[68px]' : 'ml-[260px]'
        )}
      >
        <TopNav />
        <main className={cn('p-4 md:p-6 lg:p-8', isMobile && 'pb-20')}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      {isMobile && <MobileNav />}

      {/* FULL-WIDTH FOOTER SPANNING ACROSS THE ENTIRE BOTTOM OF THE WINDOW WITH ELEGANT SPACING */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-[48px] bg-[var(--color-card)] border-t border-[var(--color-border)] px-8 flex items-center justify-between text-xs text-[var(--color-muted-foreground)] shadow-xs transition-colors">
        <div className="flex items-center space-x-6 truncate">
          <span className="font-bold text-[var(--color-foreground)] tracking-tight">TrustRide Secure Fleet Command Platform</span>
          <span className="text-[var(--color-border)] font-light">|</span>
          <span className="hidden sm:inline">ECDSA P-256 Hardware Security</span>
          <span className="text-[var(--color-border)] font-light hidden sm:inline">|</span>
          <span className="hidden md:inline">SHA-256 Immutable Audit Ledger</span>
          <span className="text-[var(--color-border)] font-light hidden md:inline">|</span>
          <span className="hidden lg:inline">7-Stage Verification Engine</span>
        </div>
        <div className="shrink-0 font-medium tracking-wide">© 2026 TrustRide Technologies</div>
      </footer>
    </div>
  );
}

export default AppLayout;
