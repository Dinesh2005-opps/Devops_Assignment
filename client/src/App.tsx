import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import OrphanageDashboard from "@/pages/dashboard/OrphanageDashboard";
import DonorDashboard from "@/pages/dashboard/DonorDashboard";
import NotFound from "@/pages/not-found";

// Loader for initial auth check
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ component: Component, roleRequired, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!user) return <Redirect to="/login" />;
  if (roleRequired && user.role !== roleRequired) {
    return <Redirect to={user.role === 'orphanage' ? '/orphanage' : '/donor'} />;
  }
  
  return <Component {...rest} />;
};

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  return (
    <Switch>
      <Route path="/">
        {user ? <Redirect to={user.role === 'orphanage' ? '/orphanage' : '/donor'} /> : <Landing />}
      </Route>
      <Route path="/login">
        {user ? <Redirect to={user.role === 'orphanage' ? '/orphanage' : '/donor'} /> : <Login />}
      </Route>
      <Route path="/register">
        {user ? <Redirect to={user.role === 'orphanage' ? '/orphanage' : '/donor'} /> : <Register />}
      </Route>
      
      {/* Protected Dashboards */}
      <Route path="/orphanage">
        <ProtectedRoute component={OrphanageDashboard} roleRequired="orphanage" />
      </Route>
      <Route path="/donor">
        <ProtectedRoute component={DonorDashboard} roleRequired="donor" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
