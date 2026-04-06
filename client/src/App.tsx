import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Statutes from "./pages/Statutes";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import MemberDirectory from "./pages/MemberDirectory";
import Documents from "./pages/Documents";
import Calendar from "./pages/Calendar";
import Payment from "./pages/Payment";
import Folkspel from "./pages/Folkspel";
import Contact from "./pages/Contact";
import ImplementationChecklist from "./pages/ImplementationChecklist";
import LoginPage from "./pages/LoginPage";
import ChangePassword from "./pages/ChangePassword";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/statutes"} component={Statutes} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/events"} component={Events} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/payment"} component={Payment} />
      <Route path={"/folkspel"} component={Folkspel} />
      <Route path={"/members"} component={MemberDirectory} />
      <Route path={"/documents"} component={Documents} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/implementation"} component={ImplementationChecklist} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/change-password"} component={ChangePassword} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
