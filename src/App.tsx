import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import PostsPage from "@/pages/PostsPage";
import EditorPage from "@/pages/EditorPage";
import SEOPage from "@/pages/SEOPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import MediaPage from "@/pages/MediaPage";
import TeamPage from "@/pages/TeamPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import BlogIndexPage from "@/pages/blog/BlogIndexPage";
import BlogPostPage from "@/pages/blog/BlogPostPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<BlogLayout />}>
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
              </Route>

              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
                <Route path="/seo" element={<SEOPage />} />
                <Route path="/ai" element={<AIAssistantPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
