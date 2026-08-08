import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/providers/theme-provider';
import { SidebarProvider } from '@/providers/sidebar-provider';
import { NotificationProvider } from '@/providers/notification-provider';
import { DemoModeProvider } from '@/providers/demo-mode-provider';
import { AppLayout } from '@/layouts/app-layout';
import { LandingLayout } from '@/layouts/landing-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { LandingPage } from '@/features/landing/landing-page';
import { LoginPage } from '@/features/auth/login-page';
import { RegisterPage } from '@/features/auth/register-page';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { FleetPage } from '@/features/fleet/fleet-page';
import { VehicleDetailPage } from '@/features/fleet/vehicle-detail-page';
import { DigitalTwinPage } from '@/features/digital-twin/digital-twin-page';
import { CommandCenterPage } from '@/features/command-center/command-center-page';
import { ApprovalCenterPage } from '@/features/approval-center/approval-center-page';
import { ApprovalsPage } from '@/features/approvals/approvals-page';
import { ThreatSandboxPage } from '@/features/threat-sandbox/threat-sandbox-page';
import { VerificationPage } from '@/features/verification/verification-page';
import { AuditPage } from '@/features/audit/audit-page';
import { AnalyticsPage } from '@/features/analytics/analytics-page';
import { CompliancePage } from '@/features/compliance/compliance-page';
import { DriverPortalPage } from '@/features/driver-portal/driver-portal-page';
import { OrganizationPage } from '@/features/organization/organization-page';
import { SettingsPage } from '@/features/settings/settings-page';
import { NotificationsPage } from '@/features/notifications/notifications-page';
import { HelpPage } from '@/features/help/help-page';
import { ReleaseNotesPage } from '@/features/release-notes/release-notes-page';
import { ScenarioSimulatorPage } from '@/features/scenario-simulator/scenario-simulator-page';
import { ActivityCenterPage } from '@/features/activity-center/activity-center-page';
import { JudgeDemoPage } from '@/features/judge-demo/judge-demo-page';
import { Toaster } from '@/components/feedback/toast';

import { AuthProvider, useAuth } from '@/providers/auth-provider';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <DemoModeProvider>
              <SidebarProvider>
                <Routes>
                  {/* Public */}
                  <Route element={<LandingLayout />}>
                    <Route path="/" element={<LandingPage />} />
                  </Route>

                  {/* Auth */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  {/* Standalone Judge Presentation Mode */}
                  <Route path="/judge-demo" element={<JudgeDemoPage />} />

                  {/* Enterprise Application Shell (Protected Routes) */}
                  <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="fleet" element={<FleetPage />} />
                    <Route path="fleet/:id" element={<VehicleDetailPage />} />
                    <Route path="digital-twin" element={<DigitalTwinPage />} />
                    <Route path="command-center" element={<CommandCenterPage />} />
                    <Route path="approval-center" element={<ApprovalCenterPage />} />
                    <Route path="approvals" element={<ApprovalCenterPage />} />
                    <Route path="threat-sandbox" element={<ThreatSandboxPage />} />
                    <Route path="verification" element={<VerificationPage />} />
                    <Route path="audit" element={<AuditPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="compliance" element={<CompliancePage />} />
                    <Route path="driver-portal" element={<DriverPortalPage />} />
                    <Route path="organization" element={<OrganizationPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="activity-center" element={<ActivityCenterPage />} />
                    <Route path="notifications" element={<ActivityCenterPage />} />
                    <Route path="help" element={<HelpPage />} />
                    <Route path="release-notes" element={<ReleaseNotesPage />} />
                    <Route path="scenario-simulator" element={<ScenarioSimulatorPage />} />
                  </Route>
                </Routes>
                <Toaster />
              </SidebarProvider>
            </DemoModeProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
