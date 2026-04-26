import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Home from "./pages/Home";
import LiveMap from "./pages/LiveMap";
import ReportIssue from "./pages/ReportIssue";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import TrackComplaint from "./pages/TrackComplaint";
import Leaderboard from "./pages/Leaderboard";
import AnimalRescue from "./pages/AnimalRescue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/track/:ticket" element={<TrackComplaint />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rescue" element={<AnimalRescue />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
