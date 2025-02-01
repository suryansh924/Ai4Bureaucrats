import React, { useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";

const queryClient = new QueryClient();

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const { user } = useContext(AuthContext);
  return user ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Header />
          <div className="pt-16 pb-16 min-h-screen">
            <Routes>
              <Route path="/" element={<PrivateRoute element={<Index />} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/notes"
                element={<PrivateRoute element={<Notes />} />}
              />
              <Route
                path="/calendar"
                element={<PrivateRoute element={<Calendar />} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <MobileNav />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppWrapper: React.FC = () => {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

export default AppWrapper;
