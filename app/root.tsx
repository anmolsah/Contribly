import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  NavLink,
  useNavigate,
} from "react-router";
import { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, LogIn, LogOut, Plus, LayoutDashboard } from "lucide-react";
import type { Route } from "./+types/root";
import { getCurrentUser, authSignOut, isSupabaseConfigured } from "./lib/supabase";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap",
  },
];

// 1. Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Inner App with Layout container & Mouse tracking spotlight
function AppContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query authenticated user state
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Track cursor coordinates for the background spotlight
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      // Force page refresh or navigate to refresh storage/state
      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  return (
    <div ref={containerRef} className="spotlight-grid-container">
      {/* Header */}
      <header className="app-header">
        <div className="nav-container">
          <Link to="/" className="logo-link">
            CONTRIBLY <span className="logo-dot"></span>
          </Link>
          <nav className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end
            >
              Explore
            </NavLink>
            
            {user ? (
              <>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                    <LayoutDashboard size={14} /> Dashboard
                  </span>
                </NavLink>
                <Link to="/submit" className="btn">
                  <Plus size={14} /> Submit Hackathon
                </Link>
                <button onClick={handleSignOut} className="btn btn-secondary">
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn">
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <Outlet />

      {/* Subtle indicator of active connection mode */}
      <div 
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 100,
          background: "rgba(9, 9, 11, 0.8)",
          border: "1px solid var(--border-color)",
          borderRadius: "4px",
          padding: "0.35rem 0.6rem",
          fontSize: "0.65rem",
          fontFamily: "var(--font-mono)",
          color: isSupabaseConfigured ? "#22c55e" : "#eab308",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          backdropFilter: "blur(4px)"
        }}
      >
        <span 
          style={{
            width: "6px",
            height: "6px",
            background: isSupabaseConfigured ? "#22c55e" : "#eab308",
            borderRadius: "50%"
          }}
        ></span>
        {isSupabaseConfigured ? "Supabase Connected" : "Local Mock Sandbox"}
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto" style={{ zIndex: 100, position: "relative" }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto" style={{ background: "rgba(255,0,0,0.1)" }}>
          <code>{stack}</code>
        </pre>
      )}
      <Link to="/" className="btn btn-secondary mt-4">
        Go Back Home
      </Link>
    </main>
  );
}
