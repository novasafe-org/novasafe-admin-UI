import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NovaProvider } from "@/context/NovaContext";
import { AuthProvider } from "@/context/AuthContext";
import { NovaLayout } from "@/components/nova/NovaLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardPage from "@/pages/nova/DashboardPage";
import UsersPage from "@/pages/nova/UsersPage";
import UserDetailPage from "@/pages/nova/UserDetailPage";
import SubscriptionsPage from "@/pages/nova/SubscriptionsPage";
import SecurityPage from "@/pages/nova/SecurityPage";
import DevicesPage from "@/pages/nova/DevicesPage";
import ContentPage from "@/pages/nova/ContentPage";
import BlogEditorPage from "@/pages/nova/BlogEditorPage";
import MediaPage from "@/pages/nova/MediaPage";
import DocsPage from "@/pages/nova/DocsPage";
import ChangelogPage from "@/pages/nova/ChangelogPage";
import ChangelogEditorPage from "@/pages/nova/ChangelogEditorPage";
import AnnouncementsPage from "@/pages/nova/AnnouncementsPage";
import SupportPage from "@/pages/nova/SupportPage";
import AnalyticsPage from "@/pages/nova/AnalyticsPage";
import SystemPage from "@/pages/nova/SystemPage";
import AuditPage from "@/pages/nova/AuditPage";
import RBACPage from "@/pages/nova/RBACPage";
import SettingsPage from "@/pages/nova/SettingsPage";
import FeatureFlagsPage from "@/pages/nova/feature-flags/FeatureFlagsPage";
import FeatureFlagDetailPage from "@/pages/nova/feature-flags/FeatureFlagDetailPage";
import ProfilePage from "@/pages/nova/ProfilePage";
import SecuritySettingsPage from "@/pages/nova/SecuritySettingsPage";
import LoginPage from "@/pages/auth/LoginPage";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NovaProvider>
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/accept-invite" element={<AcceptInvitePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected app */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<NovaLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/:id" element={<UserDetailPage />} />
                    <Route path="/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/devices" element={<DevicesPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/security" element={<SecurityPage />} />
                    <Route path="/audit" element={<AuditPage />} />
                    <Route path="/content" element={<ContentPage />} />
                    <Route path="/content/new" element={<BlogEditorPage />} />
                    <Route path="/content/edit/:id" element={<BlogEditorPage />} />
                    <Route path="/content/media" element={<MediaPage />} />
                    <Route path="/docs" element={<DocsPage />} />
                    <Route path="/changelog" element={<ChangelogPage />} />
                    <Route path="/changelog/edit/:id" element={<ChangelogEditorPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/system" element={<SystemPage />} />
                    <Route path="/feature-flags" element={<FeatureFlagsPage />} />
                    <Route path="/feature-flags/:key" element={<FeatureFlagDetailPage />} />
                    <Route path="/rbac" element={<RBACPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/security" element={<SecuritySettingsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NovaProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
