import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Subjects from "@/pages/subjects";
import SubjectDetail from "@/pages/subject-detail";
import ChapterDetail from "@/pages/chapter-detail";
import Tutor from "@/pages/tutor";
import Practice from "@/pages/practice";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Tutor} />
        <Route path="/dashboard" component={Home} />
        <Route path="/subjects" component={Subjects} />
        <Route path="/subjects/:subjectId" component={SubjectDetail} />
        <Route path="/chapters/:chapterId" component={ChapterDetail} />
        <Route path="/practice/:chapterId" component={Practice} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;