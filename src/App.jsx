import { useState, useEffect, useCallback, useRef } from "react";

// Backend URL is injected at build time via Railway environment variable
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - (ts > 1e10 ? ts : ts * 1000)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TAG_COLORS = {
  "next.js": "#00d4ff", "nextjs": "#00d4ff",
  "react": "#61dafb", "frontend developer": "#f472b6",
  "full stack": "#34d399", "fullstack": "#34d399",
  "node.js": "#86efac", "javascript developer": "#fbbf24",
  "need developer": "#fb923c", "hire developer": "#fb923c",
  "looking for developer": "#fb923c", "seeking developer": "#fb923c",
  "web developer": "#a78bfa",
};

function ContactBadge({ contacts }) {
  if (!contacts) return null;
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
      {contacts.emails?.map(e => (
        <a key={e} href={`mailto:${e}`} onClick={ev => ev.stopPropagation()}
          style={{
            fontSize: "11px", fontWeight: 600, color: "#34d399", fontFamily: "monospace",
            background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "5px",
            border: "1px solid rgba(52,211,153,0.3)", textDecoration: "none"
          }}>✉ {e}</a>
      ))}
      {contacts.phones?.map(p => (
        <span key={p} style={{
          fontSize: "11px", fontWeight: 600, color: "#fbbf24", fontFamily: "monospace",
          background: "rgba(251,191,36,0.1)", padding: "2px 8px", borderRadius: "5px",
          border: "1px solid rgba(251,191,36,0.3)"
        }}>📞 {p}</span>
      ))}
      {contacts.has_dm && (
        <span style={{
          fontSize: "11px", fontWeight: 600, color: "#a78bfa", fontFamily: "monospace",
          background: "rgba(167,139,250,0.1)", padding: "2px 8px", borderRadius: "5px",
          border: "1px solid rgba(167,139,250,0.3)"
        }}>💬 DM on Reddit</span>
      )}
    </div>
  );
}

function PostCard({ post, isNew }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: isNew
          ? "linear-gradient(135deg, rgba(0,212,255,0.07), rgba(10,18,35,0.95))"
          : "rgba(10,18,35,0.85)",
        border: isNew ? "1px solid rgba(0,212,255,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", padding: "20px 22px", marginBottom: "14px",
        cursor: "pointer", transition: "all 0.25s ease", position: "relative",
      }}
    >
      {isNew && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,212,255,0.2)", border: "1px solid rgba(0,212,255,0.5)",
          borderRadius: "6px", padding: "2px 8px", fontSize: "10px",
          fontWeight: 700, color: "#00d4ff", letterSpacing: "1px",
          fontFamily: "monospace", animation: "pulse 2s infinite"
        }}>NEW</div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{
          background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: "8px", padding: "6px 10px", minWidth: "fit-content",
          fontSize: "11px", fontWeight: 600, color: "#00d4ff", fontFamily: "monospace"
        }}>r/{post.subreddit}</div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: "0 0 8px", fontSize: "14px", fontWeight: 600,
            color: "#e8eaf6", lineHeight: 1.4, fontFamily: "'DM Sans', sans-serif"
          }}>{post.title}</h3>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            {post.tags?.map(t => (
              <span key={t} style={{
                background: `${TAG_COLORS[t] || "#a78bfa"}18`,
                border: `1px solid ${TAG_COLORS[t] || "#a78bfa"}44`,
                color: TAG_COLORS[t] || "#a78bfa",
                borderRadius: "5px", padding: "2px 8px",
                fontSize: "11px", fontWeight: 500, fontFamily: "monospace"
              }}>{t}</span>
            ))}
            {post.flair && (
              <span style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)", borderRadius: "5px",
                padding: "2px 8px", fontSize: "11px", fontFamily: "monospace"
              }}>{post.flair}</span>
            )}
          </div>

          <ContactBadge contacts={post.contacts} />

          {expanded && post.body && (
            <p style={{
              margin: "12px 0 8px", fontSize: "13px", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
              background: "rgba(255,255,255,0.03)", borderRadius: "8px",
              padding: "12px", borderLeft: "2px solid rgba(0,212,255,0.3)"
            }}>{post.body}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "10px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
              ↑ {post.score} · {timeAgo(post.created_utc)} · by u/{post.author}
            </span>
            <a href={post.url} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                fontSize: "12px", color: "#00d4ff", textDecoration: "none",
                fontFamily: "monospace", marginLeft: "auto", opacity: 0.8
              }}>View Post →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [newIds, setNewIds] = useState(new Set());
  const [filterSub, setFilterSub] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [search, setSearch] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [apiStatus, setApiStatus] = useState("connecting");
  const prevIdsRef = useRef(new Set());

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterSub !== "all") params.set("subreddit", filterSub);
      if (filterTag !== "all") params.set("tag", filterTag);
      if (search) params.set("search", search);
      params.set("limit", "200");

      const [postsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/posts?${params}`),
        fetch(`${API_BASE}/api/stats`),
      ]);

      if (!postsRes.ok || !statsRes.ok) throw new Error("API error");

      const newPosts = await postsRes.json();
      const newStats = await statsRes.json();

      const freshIds = new Set();
      newPosts.forEach(p => { if (!prevIdsRef.current.has(p.id)) freshIds.add(p.id); });
      prevIdsRef.current = new Set(newPosts.map(p => p.id));

      if (freshIds.size > 0) {
        setNewIds(prev => new Set([...prev, ...freshIds]));
        setTimeout(() => setNewIds(prev => {
          const s = new Set(prev); freshIds.forEach(id => s.delete(id)); return s;
        }), 8000);
      }

      setPosts(newPosts);
      setStats(newStats);
      setIsMonitoring(newStats.monitoring ?? true);
      setApiStatus("live");
    } catch {
      setApiStatus("error");
    }
  }, [filterSub, filterTag, search]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleMonitor = async () => {
    await fetch(`${API_BASE}/api/monitoring/toggle`, { method: "POST" }).catch(() => {});
    fetchData();
  };

  const allSubs = [...new Set(posts.map(p => p.subreddit))];
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))];
  const statusColor = { connecting: "#fbbf24", live: "#34d399", error: "#f87171" }[apiStatus];
  const statusLabel = { connecting: "CONNECTING", live: "LIVE", error: "API OFFLINE" }[apiStatus];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050d1a; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 3px; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 20%, rgba(0,60,100,0.3), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,20,60,0.4), transparent 60%), #050d1a",
        fontFamily: "'DM Sans', sans-serif", color: "#e8eaf6",
      }}>
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
          animation: "scanLine 8s linear infinite", pointerEvents: "none", zIndex: 100
        }} />

        {/* Header */}
        <div style={{
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          background: "rgba(5,13,26,0.9)", backdropFilter: "blur(20px)",
          padding: "18px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
          flexWrap: "wrap", gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #00d4ff22, #00d4ff44)",
              border: "1px solid rgba(0,212,255,0.4)", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
            }}>⬡</div>
            <div>
              <h1 style={{ fontSize: "16px", fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#fff" }}>
                DevLeads Monitor
              </h1>
              <p style={{ fontSize: "10px", color: "rgba(0,212,255,0.6)", fontFamily: "monospace" }}>
                Reddit 24/7 Developer Job Scanner
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%", background: statusColor,
                display: "inline-block", animation: apiStatus === "live" ? "pulse 2s infinite" : "none"
              }} />
              <span style={{ fontSize: "11px", color: statusColor, fontFamily: "monospace" }}>{statusLabel}</span>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
              Scans: <span style={{ color: "#a78bfa" }}>{stats.scan_count ?? 0}</span>
              &nbsp;· Leads: <span style={{ color: "#34d399" }}>{stats.total_posts ?? 0}</span>
            </div>
            <button onClick={toggleMonitor} style={{
              background: isMonitoring ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.05)",
              border: isMonitoring ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px", padding: "7px 14px",
              color: isMonitoring ? "#00d4ff" : "rgba(255,255,255,0.4)",
              cursor: "pointer", fontFamily: "'Space Mono', monospace",
              fontSize: "11px", fontWeight: 700, letterSpacing: "1px",
              display: "flex", alignItems: "center", gap: "7px"
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: isMonitoring ? "#00d4ff" : "rgba(255,255,255,0.2)",
                animation: isMonitoring ? "pulse 1.5s infinite" : "none", display: "inline-block"
              }} />
              {isMonitoring ? "LIVE" : "PAUSED"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
          {[
            { label: "Subreddits", value: stats.subreddits?.length ?? 0, color: "#00d4ff" },
            { label: "Total Leads", value: stats.total_posts ?? 0, color: "#34d399" },
            { label: "With Email", value: stats.with_email ?? 0, color: "#fbbf24" },
            { label: "With Phone", value: stats.with_phone ?? 0, color: "#f472b6" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: "12px 10px", textAlign: "center", background: "rgba(5,13,26,0.6)" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center"
        }}>
          <input
            type="text" placeholder="Search..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "7px 12px", color: "#e8eaf6",
              fontSize: "13px", fontFamily: "'DM Sans', sans-serif", width: "150px"
            }}
          />
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {["all", ...allSubs].map(s => (
              <button key={s} onClick={() => setFilterSub(s)} style={{
                background: filterSub === s ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
                border: filterSub === s ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px", padding: "4px 9px",
                color: filterSub === s ? "#00d4ff" : "rgba(255,255,255,0.5)",
                cursor: "pointer", fontSize: "11px", fontFamily: "monospace"
              }}>{s === "all" ? "All" : `r/${s}`}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {["all", ...allTags.slice(0, 5)].map(t => (
              <button key={t} onClick={() => setFilterTag(t)} style={{
                background: filterTag === t ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                border: filterTag === t ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px", padding: "4px 9px",
                color: filterTag === t ? "#a78bfa" : "rgba(255,255,255,0.5)",
                cursor: "pointer", fontSize: "11px", fontFamily: "monospace"
              }}>{t === "all" ? "All Tags" : t}</button>
            ))}
          </div>
        </div>

        {/* Error */}
        {stats.recent_errors?.length > 0 && (
          <div style={{
            margin: "12px 16px 0", padding: "10px 14px",
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: "10px", fontSize: "11px", color: "#f87171", fontFamily: "monospace"
          }}>⚠ {stats.recent_errors[stats.recent_errors.length - 1]}</div>
        )}

        {/* Posts */}
        <div style={{ padding: "16px", maxWidth: "900px", margin: "0 auto" }}>
          {apiStatus === "connecting" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", animation: "pulse 1.5s infinite" }}>
              Connecting to backend...
            </div>
          )}
          {apiStatus === "error" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(248,113,113,0.7)" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚠</div>
              <div style={{ fontFamily: "monospace" }}>Cannot reach backend</div>
              <div style={{ fontSize: "11px", marginTop: "6px", color: "rgba(255,255,255,0.3)" }}>{API_BASE}</div>
            </div>
          )}
          {apiStatus === "live" && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px", animation: "pulse 2s infinite" }}>⬡</div>
              <div style={{ fontFamily: "monospace" }}>Scanning Reddit... leads appear here automatically</div>
            </div>
          )}
          {posts.map(post => (
            <PostCard key={post.id} post={post} isNew={newIds.has(post.id)} />
          ))}
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
            DevLeads · {API_BASE} · polls every 10s
          </p>
        </div>
      </div>
    </>
  );
}
