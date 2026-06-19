import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authSignIn, authSignUp, getCurrentUser } from "../lib/supabase";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    authMutation.mutate();
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
