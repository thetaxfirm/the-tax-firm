import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const LOGIN_REDIRECT_GUARD = "auth:last-login-redirect";
const LOGIN_REDIRECT_COOLDOWN_MS = 30_000;

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Redirect at most once per cooldown. If signing in does not result in a
  // usable session — a dropped cookie, a clock skew, a revoked account — the
  // page would otherwise load, 401, bounce to login, return, and 401 again,
  // with nothing on screen but an endless redirect chain. Better to land
  // signed-out and let the UI say so.
  try {
    const last = Number(sessionStorage.getItem(LOGIN_REDIRECT_GUARD) ?? 0);
    if (Number.isFinite(last) && Date.now() - last < LOGIN_REDIRECT_COOLDOWN_MS) {
      console.error(
        "[Auth] Still unauthenticated right after signing in — not redirecting again. The session cookie is probably not being stored."
      );
      return;
    }
    sessionStorage.setItem(LOGIN_REDIRECT_GUARD, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private browsing): redirect, but only this once.
  }

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
