import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitHackathon } from "../lib/supabase";
import { FILTER_TAGS } from "../lib/mockData";
import { Calendar, Award, Globe, Building2, FileText, Check, LogOut, ShieldCheck } from "lucide-react";
import { useToast } from "../components/Toast";

export function meta() {
  return [
    { title: "Master Admin - Contribly" },
    { name: "robots", content: "noindex, nofollow" }
  ];
}

export default function Admin() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean | null>(null);
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("contribly.admin.token");
    setIsAdminLoggedIn(token === "true");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (email === "adminlogin@gmail.com" && password === "12ab123456") {
      localStorage.setItem("contribly.admin.token", "true");
      setIsAdminLoggedIn(true);
      toast.success("Admin login successful.");
    } else {
      setErrorMessage("Invalid master admin credentials.");
      toast.error("Invalid credentials.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("contribly.admin.token");
    setIsAdminLoggedIn(false);
    setEmail("");
    setPassword("");
    toast.info("Admin logged out.");
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage("");
      setSuccessMessage("");

      if (!title || !organizer || !description || !prizePool || !registrationUrl || !startsAt || !endsAt) {
        throw new Error("Please fill in all fields.");
      }

      const starts = new Date(startsAt);
      const ends = new Date(endsAt);

      if (ends <= starts) {
        throw new Error("End date must be after the start date.");
      }

      const now = new Date();
      let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
      if (now > ends) {
        status = 'completed';
      } else if (now >= starts && now <= ends) {
        status = 'ongoing';
      }

      return await submitHackathon({
        title,
        organizer,
        description,
        tags: selectedTags,
        prize_pool: prizePool,
        registration_url: registrationUrl,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        status,
      });
    },
    onSuccess: () => {
      setSuccessMessage("Hackathon manually added successfully!");
      toast.success("Hackathon added to directory.");
      queryClient.invalidateQueries({ queryKey: ["hackathons"] });
      
      // Reset form
      setTitle("");
      setOrganizer("");
      setDescription("");
      setPrizePool("");
      setRegistrationUrl("");
      setStartsAt("");
      setEndsAt("");
      setSelectedTags([]);
    },
    onError: (err: any) => {
      const msg = err.message || "Failed to add hackathon.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  });

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  if (isAdminLoggedIn === null) {
    return null; // Loading state
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="auth-container" style={{ marginTop: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <ShieldCheck size={48} color="var(--accent-color)" />
        </div>
        <h2 className="auth-title">Master Admin Login</h2>
        <p className="auth-subtitle">Access the administrative dashboard.</p>

        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="adminEmail">Admin Email</label>
            <input
              type="email"
              id="adminEmail"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@domain.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn" style={{ width: "100%", justifyContent: "center", padding: "0.75rem", marginTop: "1rem" }}>
            Secure Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck color="var(--accent-color)" /> Master Admin Panel
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
            Manually add hackathons from different platforms bypassing regular user flow.
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
          <LogOut size={14} style={{ marginRight: "0.4rem" }} /> Logout
        </button>
      </div>

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

      <form onSubmit={handleAdminSubmit} style={{ background: "rgba(255,255,255,0.02)", padding: "2rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Manually Add Hackathon</h3>
        
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Building2 size={12} /> Event Title
            </span>
          </label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Global Tech Challenge"
            required
            disabled={submitMutation.isPending}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="organizer">Organizer / Platform Name</label>
          <input
            type="text"
            id="organizer"
            className="form-control"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="e.g. Devpost, Devfolio, HackerEarth"
            required
            disabled={submitMutation.isPending}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <FileText size={12} /> Description
            </span>
          </label>
          <textarea
            id="description"
            className="form-control"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about the hackathon..."
            required
            disabled={submitMutation.isPending}
            style={{ resize: "vertical" }}
          ></textarea>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="prizePool">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Award size={12} /> Prize Pool
              </span>
            </label>
            <input
              type="text"
              id="prizePool"
              className="form-control"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. $10,000 USD"
              required
              disabled={submitMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="registrationUrl">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Globe size={12} /> Registration Link
              </span>
            </label>
            <input
              type="url"
              id="registrationUrl"
              className="form-control"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://..."
              required
              disabled={submitMutation.isPending}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="startsAt">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Calendar size={12} /> Starts At
              </span>
            </label>
            <input
              type="datetime-local"
              id="startsAt"
              className="form-control"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              disabled={submitMutation.isPending}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="endsAt">
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Calendar size={12} /> Ends At
              </span>
            </label>
            <input
              type="datetime-local"
              id="endsAt"
              className="form-control"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              disabled={submitMutation.isPending}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Select Relevant Tags</label>
          <div className="tag-select-grid">
            {FILTER_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <div
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-select-item ${isSelected ? 'selected' : ''}`}
                >
                  {isSelected && <Check size={10} />}
                  {tag}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button 
            type="submit" 
            className="btn"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Adding..." : "Add to Directory"}
          </button>
        </div>
      </form>
    </div>
  );
}
