import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import Home from "@/pages/home";
import NewsDetail from "@/pages/news-detail";
import NewsVerify from "@/pages/news-verify";
import NewsExplain from "@/pages/news-explain";
import Submit from "@/pages/submit";
import Sources from "@/pages/sources";
import SourceDetail from "@/pages/source-detail";
import Profile from "@/pages/profile";
import Trust from "@/pages/trust";
import Explore from "@/pages/explore";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Page transition wrapper
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/">
          <PageWrapper><Home /></PageWrapper>
        </Route>
        <Route path="/explore">
          <PageWrapper><Explore /></PageWrapper>
        </Route>
        <Route path="/submit">
          <PageWrapper><Submit /></PageWrapper>
        </Route>
        <Route path="/sources">
          <PageWrapper><Sources /></PageWrapper>
        </Route>
        <Route path="/sources/:id">
          {params => <PageWrapper><SourceDetail id={params.id} /></PageWrapper>}
        </Route>
        <Route path="/me">
          <PageWrapper><Profile isMe /></PageWrapper>
        </Route>
        <Route path="/u/:id">
          {params => <PageWrapper><Profile id={params.id} /></PageWrapper>}
        </Route>
        <Route path="/trust">
          <PageWrapper><Trust /></PageWrapper>
        </Route>
        <Route path="/news/:id">
          {params => <PageWrapper><NewsDetail id={params.id} /></PageWrapper>}
        </Route>
        <Route path="/news/:id/verify">
          {params => <PageWrapper><NewsVerify id={params.id} /></PageWrapper>}
        </Route>
        <Route path="/news/:id/explain">
          {params => <PageWrapper><NewsExplain id={params.id} /></PageWrapper>}
        </Route>
        <Route>
          <PageWrapper><NotFound /></PageWrapper>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
