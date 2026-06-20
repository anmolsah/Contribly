import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHackathons, getCurrentUser, fetchBookmarks, toggleBookmark } from "../lib/supabase";
import { type Hackathon } from "../lib/mockData";
import { 
  ArrowLeft, Trophy, Clock, Calendar, ExternalLink, 
  Heart, Tag, Users, Globe, ChevronRight 
} from "lucide-react";

export function meta() {
  return [
    { title: "Hackathon Details - Contribly" },
    { name: "description", content: "View hackathon details, prize information, and registration links on Contribly." },
  ];
}

function getCountdownText(startsAtStr: string, endsAtStr: string, status: 'upcoming' | 'ongoing' | 'completed') {
  const now = new Date().getTime();
  const startsAt = new Date(startsAtStr).getTime();
  const endsAt = new Date(endsAtStr).getTime();

  if (status === 'completed' || now > endsAt) {
    return 'Concluded';
  }

  if (status === 'upcoming' || now < startsAt) {
    const diffMs = startsAt - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `Starts in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  }

  const diffMs = endsAt - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `Closes in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `Closes in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return `Closes in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'upcoming': return '#3b82f6';
    case 'ongoing': return '#22c55e';
    case 'completed': return '#71717a';
    default: return '#a1a1aa';
  }
}

export default function HackathonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const { data: hackathons = [], isLoading } = useQuery({
    queryKey: ["hackathons"],
    queryFn: fetchHackathons,
  });

  const { data: bookmarkedIds = [] } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: () => (user ? fetchBookmarks(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const bookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
    },
  });

  const hackathon = hackathons.find((h: Hackathon) => h.id === id);

  if (isLoading) {
    return (
      <div className="hub-container" style={{ textAlign: "center", padding: "8rem 1.5rem" }}>
        <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          Loading hackathon details...
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="hub-container" style={{ textAlign: "center", padding: "8rem 1.5rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>Hackathon Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          The hackathon you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={14} /> Back to Explore
        </Link>
      </div>
    );
  }

  const isBookmarked = Array.isArray(bookmarkedIds) && bookmarkedIds.includes(hackathon.id);
  const countdownText = getCountdownText(hackathon.starts_at, hackathon.ends_at, hackathon.status);
  const statusColor = getStatusColor(hackathon.status);

  const startDate = new Date(hackathon.starts_at).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const endDate = new Date(hackathon.ends_at).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const startTime = new Date(hackathon.starts_at).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit'
  });
  const endTime = new Date(hackathon.ends_at).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit'
  });

  // Calculate duration in days
  const durationMs = new Date(hackathon.ends_at).getTime() - new Date(hackathon.starts_at).getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  return (
    <div className="hub-container">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <Link to="/" className="breadcrumb-link">Explore</Link>
        <ChevronRight size={12} />
        <span className="breadcrumb-current">{hackathon.title}</span>
      </div>

      {/* Main Detail Card */}
      <div className="detail-card">
        {/* Header Section */}
        <div className="detail-header">
          <div className="detail-header-top">
            <span className="detail-organizer">{hackathon.organizer}</span>
            <span 
              className="detail-status-badge" 
              style={{ 
                borderColor: statusColor, 
                color: statusColor 
              }}
            >
              {hackathon.status.toUpperCase()}
            </span>
          </div>
          <h1 className="detail-title">{hackathon.title}</h1>
          <p className="detail-description">{hackathon.description}</p>
        </div>

        {/* Info Grid */}
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <div className="detail-info-icon">
              <Trophy size={18} color="#fbbf24" />
            </div>
            <div>
              <span className="detail-info-label">Prize Pool</span>
              <span className="detail-info-value prize-value">{hackathon.prize_pool}</span>
            </div>
          </div>

          <div className="detail-info-item">
            <div className="detail-info-icon">
              <Clock size={18} color="#3b82f6" />
            </div>
            <div>
              <span className="detail-info-label">Countdown</span>
              <span className="detail-info-value">{countdownText}</span>
            </div>
          </div>

          <div className="detail-info-item">
            <div className="detail-info-icon">
              <Calendar size={18} color="#22c55e" />
            </div>
            <div>
              <span className="detail-info-label">Duration</span>
              <span className="detail-info-value">{durationDays} day{durationDays > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="detail-info-item">
            <div className="detail-info-icon">
              <Users size={18} color="#a78bfa" />
            </div>
            <div>
              <span className="detail-info-label">Organizer</span>
              <span className="detail-info-value">{hackathon.organizer}</span>
            </div>
          </div>
        </div>

        {/* Dates Section */}
        <div className="detail-dates-section">
          <h3 className="detail-section-heading">Event Schedule</h3>
          <div className="detail-dates-grid">
            <div className="detail-date-block">
              <span className="detail-date-label">Starts</span>
              <span className="detail-date-value">{startDate}</span>
              <span className="detail-date-time">{startTime}</span>
            </div>
            <div className="detail-date-divider">→</div>
            <div className="detail-date-block">
              <span className="detail-date-label">Ends</span>
              <span className="detail-date-value">{endDate}</span>
              <span className="detail-date-time">{endTime}</span>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="detail-tags-section">
          <h3 className="detail-section-heading">
            <Tag size={14} /> Technologies & Topics
          </h3>
          <div className="detail-tags">
            {hackathon.tags.map((t: string) => (
              <span key={t} className="detail-tag">{t}</span>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="detail-cta-section">
          <a
            href={hackathon.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-cta-btn"
          >
            <Globe size={18} />
            Join This Hackathon
            <ExternalLink size={14} />
          </a>

          {user ? (
            <button
              onClick={() => bookmarkMutation.mutate(hackathon.id)}
              className={`detail-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            >
              <Heart size={16} fill={isBookmarked ? "currentColor" : "none"} />
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          ) : (
            <Link to="/auth" className="detail-bookmark-btn">
              <Heart size={16} />
              Sign in to Bookmark
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
