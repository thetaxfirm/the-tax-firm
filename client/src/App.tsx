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
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import AdminResponses from "./pages/AdminResponses";
import FractionalCFO from "./pages/FractionalCFO";
import Bookkeeping from "./pages/Bookkeeping";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogArticle} />
      <Route path={"/services/fractional-cfo"} component={FractionalCFO} />
      <Route path={"/services/bookkeeping"} component={Bookkeeping} />
      <Route path={"/admin/responses"} component={AdminResponses} />
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
