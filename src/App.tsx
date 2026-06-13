import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NovaProvider } from "@/context/NovaContext";
import { NovaLayout } from "@/components/nova/NovaLayout";
import DashboardPage from "@/pages/nova/DashboardPage";
import UsersPage from "@/pages/nova/UsersPage";
import UserDetailPage from "@/pages/nova/UserDetailPage";
import SubscriptionsPage from "@/pages/nova/SubscriptionsPage";
import SecurityPage from "@/pages/nova/SecurityPage";
import DevicesPage from "@/pages/nova/DevicesPage";
import ContentPage from "@/pages/nova/ContentPage";
import DocsPage from "@/pages/nova/DocsPage";
import ChangelogPage from "@/pages/nova/ChangelogPage";
import AnnouncementsPage from "@/pages/nova/AnnouncementsPage";
import SupportPage from "@/pages/nova/SupportPage";
import AnalyticsPage from "@/pages/nova/AnalyticsPage";
import SystemPage from "@/pages/nova/SystemPage";
import AuditPage from "@/pages/nova/AuditPage";
import RBACPage from "@/pages/nova/RBACPage";
import SettingsPage from "@/pages/nova/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NovaProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
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
                <Route path="/rbac" element={<RBACPage />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/system" element={<SystemPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NovaProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
