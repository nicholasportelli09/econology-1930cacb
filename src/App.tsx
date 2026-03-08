import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfflineBanner } from "@/components/OfflineBanner";
import { InAppNotification } from "@/components/InAppNotification";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import TipArticle from "./pages/TipArticle";
import Learn from "./pages/Learn";
import MarketIdeas from "./pages/MarketIdeas";
import InvestmentDetail from "./pages/InvestmentDetail";
import EconomicNews from "./pages/EconomicNews";
import AskEkon from "./pages/AskEkon";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import BudgetSimulator from "./pages/BudgetSimulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OfflineBanner />
          <InAppNotification />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/tip/:tipId" element={<TipArticle />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><MarketIdeas /></ProtectedRoute>} />
            <Route path="/investment" element={<ProtectedRoute><InvestmentDetail /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><EconomicNews /></ProtectedRoute>} />
            <Route path="/ask" element={<ProtectedRoute><AskEkon /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
