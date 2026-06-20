import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, submitHackathon } from "../lib/supabase";
import { FILTER_TAGS } from "../lib/mockData";
import { Calendar, Award, Globe, Building2, FileText, Check } from "lucide-react";
import { useToast } from "../components/Toast";

export function meta() {
  return [
    { title: "Submit a Hackathon - Contribly Directory" },
    { name: "description", content: "Submit your open-source hackathon or programming contest to the Contribly developer directory and reach thousands of developers worldwide." },
    { name: "keywords", content: "submit hackathon, promote developer contest, list coding challenge, post tech event" },
    { property: "og:title", content: "Submit a Hackathon - Contribly" },
    { property: "og:description", content: "Submit your open-source hackathon or programming contest to the Contribly developer directory." },
    { property: "og:type", content: "website" },
  ];
}

export default function Submit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Redirect if not logged in
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

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

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate("/auth");
    }
  }, [user, isUserLoading, navigate]);

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

      // Automatically determine status based on current time
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
      setSuccessMessage("Hackathon submitted successfully!");
      toast.success("Hackathon submitted successfully! It is now live.");
      queryClient.invalidateQueries({ queryKey: ["hackathons"] });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (err: any) => {
      const msg = err.message || "Failed to submit hackathon.";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  if (isUserLoading) {
    return (
      <div style={{ textAlign: "center", padding: "8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
        Verifying session...
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting...
  }

  return (
    <div className="form-container">
      <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Submit a Hackathon</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Add an open-source hackathon to our curated directory. Listings are public immediately.
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
        {/* Title */}
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
            placeholder="e.g. Supabase Launch Week Hackathon"
            required
            disabled={submitMutation.isPending}
          />
        </div>

        {/* Organizer */}
        <div className="form-group">
          <label className="form-label" htmlFor="organizer">Organizer Name</label>
          <input
            type="text"
            id="organizer"
            className="form-control"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            placeholder="e.g. Supabase Inc."
            required
            disabled={submitMutation.isPending}
          />
        </div>

        {/* Description */}
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
            placeholder="Outline the rules, tracks, themes, and open-source contributions expected..."
            required
            disabled={submitMutation.isPending}
            style={{ resize: "vertical" }}
          ></textarea>
        </div>

        {/* Prize Pool & Registration URL */}
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
              placeholder="e.g. $10,000 USD or Swag"
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

        {/* Start Date & End Date */}
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

        {/* Tags Selection Grid */}
        <div className="form-group">
          <label className="form-label">Select Relevant Tech Stacks / Tags</label>
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

        {/* Submit Actions */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
