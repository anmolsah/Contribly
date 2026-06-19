import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Trophy, Clock, Heart, ExternalLink, Calendar, HelpCircle } from "lucide-react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Contribly - Open Source Hackathons Hub" },
    { name: "description", content: "Discover, track, and bookmark open-source hackathons. Explore upcoming, ongoing, and completed developer hackathons." },
  ];
}
import { fetchHackathons, toggleBookmark, getCurrentUser, fetchBookmarks } from "../lib/supabase";
import { FILTER_TAGS, type Hackathon } from "../lib/mockData";

// Helper to format remaining time
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
    if (diffDays > 0) {
      return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `Starts in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  }

  // ongoing
  const diffMs = endsAt - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return `Closes in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) {
    return `Closes in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return `Closes in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
}

// Reusable Bento Card Component
interface BentoCardProps {
  hackathon: Hackathon;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  isAuthenticated: boolean;
}

function BentoCard({ hackathon, isBookmarked, onBookmarkToggle, isAuthenticated }: BentoCardProps) {
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

  const countdownText = getCountdownText(hackathon.starts_at, hackathon.ends_at, hackathon.status);

  return (
    <div 
      ref={cardRef} 
      className="bento-card"
      onMouseMove={handleMouseMove}
    >
      <div>
        <div className="card-header">
          <span className="organizer-label">{hackathon.organizer}</span>
          {isAuthenticated ? (
            <button 
              onClick={() => onBookmarkToggle(hackathon.id)}
              className={`bookmark-toggle ${isBookmarked ? 'bookmarked' : ''}`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Hackathon"}
            >
              <Heart size={16} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          ) : (
            <Link 
              to="/auth" 
              className="bookmark-toggle"
              title="Sign in to bookmark"
            >
              <Heart size={16} />
            </Link>
          )}
        </div>
        <div className="card-body">
          <h3 className="card-title">{hackathon.title}</h3>
          <p className="card-description">{hackathon.description}</p>
          <div className="card-tags">
            {hackathon.tags.map(t => (
              <span key={t} className="card-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="prize-pool-label">
          <Trophy size={14} />
          {hackathon.prize_pool}
        </div>
        <div className="countdown-label">
          <Clock size={12} />
          {countdownText}
        </div>
        <a 
          href={hackathon.registration_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn"
          style={{ padding: "0.4rem 0.75rem", background: "white", color: "black", width: "auto" }}
        >
          Join <ExternalLink size={10} style={{ marginLeft: "0.2rem" }} />
        </a>
      </div>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 1. Fetch user authentication
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // 2. Fetch hackathons
  const { data: hackathons = [], isLoading } = useQuery({
    queryKey: ["hackathons"],
    queryFn: fetchHackathons,
  });

  // 3. Fetch user bookmarks
  const { data: bookmarkedIds = [] } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: () => (user ? fetchBookmarks(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  // 4. Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
    },
  });

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Filter hackathons
  const filteredHackathons = hackathons.filter(h => {
    // Tab filter
    if (h.status !== activeTab) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title.toLowerCase().includes(q);
      const matchOrg = h.organizer.toLowerCase().includes(q);
      const matchDesc = h.description.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchDesc) return false;
    }

    // Tag filter
    if (selectedTags.length > 0) {
      // Check if hackathon has at least one of the selected tags
      const hasTag = h.tags.some(tag => selectedTags.includes(tag));
      if (!hasTag) return false;
    }

    return true;
  });

  return (
    <div className="hub-container">
      {/* Hero */}
      <section className="hero-section">
        <h1 className="hero-title">Open Source Hackathons Hub</h1>
        <p className="hero-subtitle">
          Discover, track, and submit open-source hackathons. Filter by tech stacks, track countdowns, and build the future of software.
        </p>
      </section>

      {/* Filter Row */}
      <div className="filter-row">
        <div className="filter-main">
          {/* Tabs */}
          <div className="tabs-container">
            <button 
              onClick={() => setActiveTab('upcoming')} 
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('ongoing')} 
              className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            >
              Completed
            </button>
          </div>

          {/* Search Box */}
          <div className="search-box-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search hackathons, organizers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Tag Cloud */}
        <div className="tag-cloud">
          {FILTER_TAGS.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <span 
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`tag-badge ${isSelected ? 'active' : ''}`}
              >
                {tag}
              </span>
            );
          })}
          {selectedTags.length > 0 && (
            <button 
              onClick={() => setSelectedTags([])}
              style={{
                background: "transparent",
                border: "none",
                color: "#f87171",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: "0.2rem 0.5rem"
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Hub Listings */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          Loading listings...
        </div>
      ) : filteredHackathons.length > 0 ? (
        <div className="bento-grid">
          {filteredHackathons.map(h => (
            <BentoCard 
              key={h.id}
              hackathon={h}
              isBookmarked={Array.isArray(bookmarkedIds) && bookmarkedIds.includes(h.id)}
              onBookmarkToggle={(id) => bookmarkMutation.mutate(id)}
              isAuthenticated={!!user}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <HelpCircle className="empty-state-icon" />
          <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>No Hackathons Found</h3>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            No events match your selected status, search parameters, or technology filters.
          </p>
        </div>
      )}
    </div>
  );
}
