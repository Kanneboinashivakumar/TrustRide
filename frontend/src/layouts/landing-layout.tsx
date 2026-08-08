import { Outlet } from 'react-router-dom';

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Outlet />
    </div>
  );
}
