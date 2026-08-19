import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Documentation from "@/pages/Documentation";
import Home from "@/pages/Home";
import Indicators from "@/pages/Indicators";
import NewTicket from "@/pages/NewTicket";
import NotFound from "@/pages/NotFound";
import TicketDetail from "@/pages/TicketDetail";
import { Route, Switch } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tickets/nuevo" component={NewTicket} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <Route path="/indicadores" component={Indicators} />
      <Route path="/documentacion" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors />
          <DashboardLayout><Router /></DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

