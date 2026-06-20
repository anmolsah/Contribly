import { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, fetchHackathons, fetchBookmarks, toggleBookmark, deleteHackathon } from "../lib/supabase";
import { Heart, Plus, Eye, Calendar, Trash2, ShieldAlert } from "lucide-react";
import { type Hackathon } from "../lib/mockData";
import { useToast } from "../components/Toast";

export function meta() {
  return [
    { title: "Dashboard - Contribly" },
    { name: "description", content: "View and manage your bookmarked and submitted open-source hackathons on Contribly." },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Redirect if not logged in
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate("/auth");
    }
  }, [user, isUserLoading, navigate]);

  // Fetch all hackathons
  const { data: hackathons = [], isLoading: isHackathonsLoading } = useQuery({
    queryKey: ["hackathons"],
    queryFn: fetchHackathons,
  });

  // Fetch bookmarks
  const { data: bookmarkedIds = [], isLoading: isBookmarksLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: () => (user ? fetchBookmarks(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
    onSuccess: (wasBookmarked) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
      if (wasBookmarked) {
        toast.success("Hackathon added to bookmarks.");
      } else {
        toast.info("Hackathon removed from bookmarks.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update bookmark.");
    }
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHackathon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hackathons"] });
      toast.success("Hackathon submission deleted.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete submission.");
    }
  });

  if (isUserLoading || isHackathonsLoading || isBookmarksLoading) {
    return (
      <div style={{ textAlign: "center", padding: "8rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
        Loading dashboard data...
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting...
  }

  // Filter bookmarked events
  const bookmarkedEvents = hackathons.filter(h => bookmarkedIds.includes(h.id));

  // Filter user's own submissions
  const mySubmissions = hackathons.filter(h => h.submitted_by === user.id);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the submission "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="hub-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>Developer Dashboard</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
            Welcome, <span style={{ color: "white", fontWeight: 600 }}>{user.user_metadata?.display_name || user.email?.split('@')[0] || "Developer"}</span> (
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "0.75rem" }}>{user.email}</span>)
          </p>
        </div>
      </div>

      <div className="dashboard-sections">
        {/* Tracked Bookmarks Section */}
        <div>
          <div className="section-title-row">
            <Heart size={18} fill="#ef4444" color="#ef4444" />
            <h3 className="section-title">Tracked Bookmarks ({bookmarkedEvents.length})</h3>
          </div>

          {bookmarkedEvents.length > 0 ? (
            <div className="bento-grid">
              {bookmarkedEvents.map(h => (
                <CompactDashboardCard 
                  key={h.id}
                  hackathon={h}
                  isOwner={h.submitted_by === user.id}
                  onBookmarkRemove={() => bookmarkMutation.mutate(h.id)}
                  onDelete={() => handleDelete(h.id, h.title)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Heart className="empty-state-icon" style={{ color: "rgba(239, 68, 68, 0.4)" }} />
              <h4 style={{ margin: "0 0 0.5rem 0", color: "white" }}>No Tracked Hackathons</h4>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.875rem" }}>
                Bookmarks let you save hackathons directly to your dashboard.
              </p>
              <Link to="/" className="btn btn-secondary">
                Browse Events
              </Link>
            </div>
          )}
        </div>

        {/* My Submissions Section */}
        <div>
          <div className="section-title-row">
            <ShieldAlert size={18} color="var(--accent-color)" />
            <h3 className="section-title">My Submitted Listings ({mySubmissions.length})</h3>
          </div>

          {mySubmissions.length > 0 ? (
            <div className="bento-grid">
              {mySubmissions.map(h => (
                <CompactDashboardCard 
                  key={h.id}
                  hackathon={h}
                  isOwner={true}
                  onBookmarkRemove={bookmarkedIds.includes(h.id) ? () => bookmarkMutation.mutate(h.id) : undefined}
                  onDelete={() => handleDelete(h.id, h.title)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Plus className="empty-state-icon" style={{ color: "rgba(59, 130, 246, 0.4)" }} />
              <h4 style={{ margin: "0 0 0.5rem 0", color: "white" }}>No Submissions Yet</h4>
              <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.875rem" }}>
                Add your hackathon to make it discoverable by other open-source developers.
              </p>
              <Link to="/submit" className="btn btn-secondary">
                Submit a Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact card version specifically tailored for dashboard
interface CompactCardProps {
  hackathon: Hackathon;
  isOwner: boolean;
  onBookmarkRemove?: () => void;
  onDelete?: () => void;
}

function CompactDashboardCard({ hackathon, isOwner, onBookmarkRemove, onDelete }: CompactCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);
  };

  const starts = new Date(hackathon.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const ends = new Date(hackathon.ends_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div 
      ref={cardRef}
      className="bento-card"
      onMouseMove={handleMouseMove}
      style={{ minHeight: "220px" }}
    >
      <div>
        <div className="card-header" style={{ marginBottom: "0.5rem" }}>
          <span className="organizer-label">{hackathon.organizer}</span>
          <span 
            className="card-tag" 
            style={{ 
              borderColor: hackathon.status === 'upcoming' ? '#3b82f6' : hackathon.status === 'ongoing' ? '#22c55e' : '#71717a',
              color: hackathon.status === 'upcoming' ? '#3b82f6' : hackathon.status === 'ongoing' ? '#22c55e' : '#a1a1aa',
              textTransform: 'uppercase',
              fontSize: '0.6rem'
            }}
          >
            {hackathon.status}
          </span>
        </div>
        <div className="card-body" style={{ marginBottom: "1rem" }}>
          <h4 className="card-title" style={{ fontSize: "1.1rem" }}>{hackathon.title}</h4>
          <p className="countdown-label" style={{ marginTop: "0.25rem", fontSize: "0.7rem" }}>
            <Calendar size={10} />
            {starts} - {ends}
          </p>
        </div>
      </div>

      <div className="card-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.75rem" }}>
        <div className="prize-pool-label" style={{ fontSize: "0.75rem" }}>
          {hackathon.prize_pool}
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {onBookmarkRemove && (
            <button 
              onClick={onBookmarkRemove}
              className="btn btn-secondary" 
              style={{ padding: "0.35rem 0.5rem", fontSize: "0.7rem" }}
            >
              Uncheck
            </button>
          )}

          {isOwner && onDelete && (
            <button 
              onClick={onDelete}
              className="btn btn-danger-secondary" 
              style={{ padding: "0.35rem 0.5rem", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          )}

          <Link 
            to={`/hackathon/${hackathon.id}`}
            className="btn"
            style={{ padding: "0.35rem 0.5rem", fontSize: "0.7rem", background: "white", color: "black" }}
          >
            View <Eye size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}
