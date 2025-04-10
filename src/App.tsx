
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Auth Provider
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import NewReport from "./pages/NewReport";
import Analytics from "./pages/Analytics";
import Projects from "./pages/Projects";
import Reviews from "./pages/Reviews";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

// Protected route component with role-based access
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires specific roles, check if the user has one of them
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || '')) {
    // Redirect to dashboard with unauthorized access
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { userRole } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        
        {/* Reports Routes */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/reports/new" element={
          <ProtectedRoute allowedRoles={['Technician', 'Admin']}>
            <NewReport />
          </ProtectedRoute>
        } />
        
        {/* Reviews Route - Managers Only */}
        <Route path="/reviews" element={
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <Reviews />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Projects Route - Admin Only */}
        <Route path="/projects" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Projects />
          </ProtectedRoute>
        } />
        
        {/* Users Route - Admin Only */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Users />
          </ProtectedRoute>
        } />
        
        {/* Settings Route */}
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
