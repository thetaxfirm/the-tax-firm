import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QuestionnaireProvider } from "./contexts/QuestionnaireContext";
import Questionnaire from "./components/Questionnaire";
import { useQuestionnaire } from "./contexts/QuestionnaireContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function QuestionnaireModal() {
  const { isOpen, closeQuestionnaire } = useQuestionnaire();
  return <Questionnaire isOpen={isOpen} onClose={closeQuestionnaire} />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <QuestionnaireProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <QuestionnaireModal />
          </TooltipProvider>
        </QuestionnaireProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
