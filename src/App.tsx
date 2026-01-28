import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import Documents from "./pages/Documents";
import BillingPage from "./pages/BillingPage";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customers from "./pages/Customers";

const queryClient = new QueryClient();

// Auth Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("4s_user");

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

// Protected Layout with Auth
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/jobs" element={<ProtectedLayout><JobList /></ProtectedLayout>} />
          <Route path="/jobs/:jobId" element={<ProtectedLayout><JobDetail /></ProtectedLayout>} />
          <Route path="/documents" element={<ProtectedLayout><Documents /></ProtectedLayout>} />
          <Route path="/billing" element={<ProtectedLayout><BillingPage /></ProtectedLayout>} />
          <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

          {/* Masters Routes */}
          <Route path="/masters/customers" element={<ProtectedLayout><Customers /></ProtectedLayout>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

