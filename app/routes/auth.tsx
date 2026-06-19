import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authSignIn, authSignUp, getCurrentUser, authSignInGoogle } from "../lib/supabase";

export function meta() {
  return [
    { title: "Authenticate - Contribly" },
    { name: "description", content: "Sign in or register for an account on Contribly to bookmark events and submit new open-source hackathons." },
  ];
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage("");
      setSuccessMessage("");
      if (isSignUp) {
        return await authSignUp(email, password);
      } else {
        return await authSignIn(email, password);
      }
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      if (isSignUp) {
        setSuccessMessage("Account created successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        navigate("/");
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "An authentication error occurred.");
    }
  });

  const googleAuthMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage("");
      setSuccessMessage("");
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : "";
      return await authSignInGoogle(redirectUrl);
    },
    onSuccess: (user) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        setSuccessMessage("Logged in with Google!");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Google Authentication failed.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    authMutation.mutate();
  };

  const handleGoogleClick = () => {
    googleAuthMutation.mutate();
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
      <p className="auth-subtitle">
        {isSignUp 
          ? "Register to submit open-source hackathons and bookmark events." 
          : "Sign in to access your dashboard and submit events."
        }
      </p>

      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@firstissue.dev"
            required
            disabled={authMutation.isPending}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={authMutation.isPending}
          />
        </div>

        <button 
          type="submit" 
          className="btn" 
          style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.85rem", marginTop: "1rem" }}
          disabled={authMutation.isPending}
        >
          {authMutation.isPending 
            ? "Authenticating..." 
            : (isSignUp ? "Sign Up" : "Sign In")
          }
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", gap: "1rem" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>OR</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
      </div>

      <button
        onClick={handleGoogleClick}
        className="btn btn-secondary"
        style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
        disabled={googleAuthMutation.isPending || authMutation.isPending}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>


      <div className="auth-switch">
        {isSignUp ? "Already have an account?" : "New to Contribly?"}
        <button 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage("");
            setSuccessMessage("");
          }} 
          className="auth-switch-btn"
          disabled={authMutation.isPending}
        >
          {isSignUp ? "Sign In" : "Register"}
        </button>
      </div>
    </div>
  );
}
