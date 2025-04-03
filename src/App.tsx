
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OfflineProvider } from "./context/OfflineContext";

// Import pages
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import NewReport from "./pages/NewReport";
import ReportDetail from "./pages/ReportDetail";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <OfflineProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/new" element={<NewReport />} />
                <Route path="reports/:id" element={<ReportDetail />} />
                <Route path="search" element={<Reports />} /> {/* Reusing Reports with search filter active */}
                <Route path="analytics" element={<Analytics />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="users" element={<Users />} />
                <Route path="projects" element={<Projects />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
            <Toaster />
          </OfflineProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
