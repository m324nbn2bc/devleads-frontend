import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - (ts > 1e10 ? ts : ts * 1000)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TAG_COLORS = {
  "next.js": "#4f8ef7", "nextjs": "#4f8ef7",
  "react": "#4f8ef7", "frontend developer": "#9b7fe8",
  "full stack": "#3dab7a", "fullstack": "#3dab7a",
  "node.js": "#3dab7a", "javascript developer": "#c49a2a",
  "need developer": "#c4722a", "hire developer": "#c4722a",
  "looking for developer": "#c4722a", "seeking developer": "#c4722a",
  "web developer": "#9b7fe8",
};

const THEMES = {
  dark: {
    bg: "#0f1117",
    surface: "#181b23",
    border: "#2a2d3a",
    text: "#e2e4ed",
    textMuted: "#6b7280",
    textFaint: "#3d4150",
    accent: "#4f8ef7",
    accentSoft: "rgba(79,142,247,0.1)",
    accentBorder: "rgba(79,142,247,0.22)",
    newBg: "#14172a",
    newBorder: "rgba(79,142,247,0.28)",
    errorBg: "rgba(200,60,60,0.07)",
    errorBorder: "rgba(200,60,60,0.2)",
    errorText: "#d07070",
    inputBg: "#13161e",
    statsBg: "#13161e",
  },
  light: {
    bg: "#f4f3ef",
    surface: "#ffffff",
    border: "#e6e4de",
    text: "#1a1c22",
    textMuted: "#7a7d88",
    textFaint: "#b8bbc6",
    accent: "#3b7de8",
    accentSoft: "rgba(59,125,232,0.08)",
    accentBorder: "rgba(59,125,232,0.2)",
    newBg: "#f0f4fd",
    newBorder: "rgba(59,125,232,0.22)",
    errorBg: "rgba(190,50,50,0.05)",
    errorBorder: "rgba(190,50,50,0.15)",
    errorText: "#b04040",
    inputBg: "#ffffff",
    statsBg: "#ffffff",
  },
};

function ContactBadge({ contacts }) {
  if (!contacts) return null;
  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "6px" }}>
      {contacts.emails?.map(e => (
        <a key={e} href={"mailto:" + e} onClick={ev => ev.stopPropagation()}
          style={{
            fontSize: "11px", fontWeight: 500, color: "#3dab7a",
            background: "rgba(61,171,122,0.09)", padding: "2px 7px", borderRadius: "5px",
            border: "1px solid rgba(61,171,122,0.22)", textDecoration: "none", fontFamily: "monospace"
          }}>✉ {e}</a>
      ))}
      {contacts.phones?.map(p => (
        <span key={p} style={{
          fontSize: "11px", fontWeight: 500, color: "#c49a2a", fontFamily: "monospace",
          background: "rgba(196,154,42,0.09)", padding: "2px 7px", borderRadius: "5px",
          border: "1px solid rgba(196,154,42,0.22)"
        }}>📞 {p}</span>
      ))}
      {contacts.has_dm && (
        <span style={{
          fontSize: "11px", fontWeight: 500, color: "#9b7fe8", fontFamily: "monospace",
          background: "rgba(155,127,232,0.09)", padding: "2px 7px", borderRadius: "5px",
          border: "1px solid rgba(155,127,232,0.22)"
        }}>💬 DM on Reddit</span>
      )}
    </div>
  );
}

function PostCard({ post, isNew, th }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div onClick={() => setExpanded(!expanded)} style={{
      background: isNew ? th.newBg : th.surface,
      border: "1px solid " + (isNew ? th.newBorder : th.border),
      borderRadius: "10px", padding: "14px 16px", marginBottom: "8px",
      cursor: "pointer", position: "relative",
    }}>
      {isNew && (
        <div style={{
          position: "absolute", top: 11, right: 11,
          background: th.accentSoft, border: "1px solid " + th.accentBorder,
          borderRadius: "4px", padding: "1px 6px", fontSize: "10px",
          fontWeight: 600, color: th.accent, fontFamily: "monospace",
        }}>new</div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div style={{
          background: th.accentSoft, border: "1px solid " + th.accentBorder,
          borderRadius: "6px", padding: "3px 8px", minWidth: "fit-content",
          fontSize: "11px", fontWeight: 500, color: th.accent, fontFamily: "monospace"
        }}>r/{post.subreddit}</div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: "0 0 7px", fontSize: "13px", fontWeight: 500,
            color: th.text, lineHeight: 1.45,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>{post.title}</h3>

          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "5px" }}>
            {post.tags?.map(t => (
              <span key={t} style={{
                background: (TAG_COLORS[t] || "#9b7fe8") + "14",
                border: "1px solid " + (TAG_COLORS[t] || "#9b7fe8") + "33",
                color: TAG_COLORS[t] || "#9b7fe8",
                borderRadius: "4px", padding: "1px 6px",
                fontSize: "10px", fontFamily: "monospace"
              }}>{t}</span>
            ))}
            {post.flair && (
              <span style={{
                border: "1px solid " + th.border, color: th.textMuted,
                borderRadius: "4px", padding: "1px 6px", fontSize: "10px", fontFamily: "monospace"
              }}>{post.flair}</span>
            )}
          </div>

          <ContactBadge contacts={post.contacts} />

          {expanded && post.body && (
            <p style={{
              margin: "10px 0 6px", fontSize: "12px", color: th.textMuted,
              lineHeight: 1.65, background: th.bg, borderRadius: "7px",
              padding: "10px 12px", borderLeft: "2px solid " + th.border,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>{post.body}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", marginTop: "9px" }}>
            <span style={{ fontSize: "11px", color: th.textFaint, fontFamily: "monospace" }}>
              ↑ {post.score} · {timeAgo(post.created_utc)} · u/{post.author}
            </span>
            <a href={post.url} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                fontSize: "11px", color: th.accent, textDecoration: "none",
                fontFamily: "monospace", marginLeft: "auto"
              }}>open →</a>
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
  const [darkMode, setDarkMode] = useState(true);
  const th = THEMES[darkMode ? "dark" : "light"];
  const prevIdsRef = useRef(new Set());

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterSub !== "all") params.set("subreddit", filterSub);
      if (filterTag !== "all") params.set("tag", filterTag);
      if (search) params.set("search", search);
      params.set("limit", "200");

      const [postsRes, statsRes] = await Promise.all([
        fetch(API_BASE + "/api/posts?" + params),
        fetch(API_BASE + "/api/stats"),
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
    await fetch(API_BASE + "/api/monitoring/toggle", { method: "POST" }).catch(() => {});
    fetchData();
  };

  const allSubs = [...new Set(posts.map(p => p.subreddit))];
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))];

  const statusColor = { connecting: "#c49a2a", live: "#3dab7a", error: "#c04040" }[apiStatus];
  const statusLabel = { connecting: "connecting", live: "live", error: "offline" }[apiStatus];

  const filterBtn = (active, onClick, label) => (
    <button key={label} onClick={onClick} style={{
      background: active ? th.accentSoft : "transparent",
      border: "1px solid " + (active ? th.accentBorder : th.border),
      borderRadius: "6px", padding: "4px 9px",
      color: active ? th.accent : th.textMuted,
      cursor: "pointer", fontSize: "11px", fontFamily: "monospace"
    }}>{label}</button>
  );

  return (
    <>
      <style>{"* { box-sizing: border-box; margin: 0; padding: 0; } body { background: " + th.bg + "; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: " + th.border + "; border-radius: 3px; } input:focus { outline: none; } button { cursor: pointer; }"}</style>

      <div style={{ minHeight: "100vh", background: th.bg, color: th.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Header */}
        <div style={{
          borderBottom: "1px solid " + th.border, background: th.bg,
          padding: "14px 20px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
          flexWrap: "wrap", gap: "10px"
        }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: th.text }}>DevLeads</div>
            <div style={{ fontSize: "11px", color: th.textMuted, marginTop: "1px" }}>Reddit developer job monitor</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }} />
              <span style={{ fontSize: "11px", color: statusColor, fontFamily: "monospace" }}>{statusLabel}</span>
            </div>

            {/* Stats inline */}
            <span style={{ fontSize: "11px", color: th.textMuted, fontFamily: "monospace" }}>
              {stats.scan_count ?? 0} scans · {stats.total_posts ?? 0} leads
            </span>

            {/* Monitor toggle */}
            <button onClick={toggleMonitor} style={{
              background: "transparent",
              border: "1px solid " + th.border,
              borderRadius: "6px", padding: "5px 12px",
              color: isMonitoring ? th.accent : th.textMuted,
              fontSize: "11px", fontFamily: "monospace", fontWeight: 500
            }}>
              {isMonitoring ? "● monitoring" : "○ paused"}
            </button>

            {/* Theme toggle */}
            <button onClick={() => setDarkMode(d => !d)} style={{
              background: "transparent", border: "1px solid " + th.border,
              borderRadius: "6px", padding: "5px 10px",
              color: th.textMuted, fontSize: "13px"
            }}>{darkMode ? "☀" : "☾"}</button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", borderBottom: "1px solid " + th.border, background: th.statsBg }}>
          {[
            { label: "Subreddits", value: stats.subreddits?.length ?? 0 },
            { label: "Total Leads", value: stats.total_posts ?? 0 },
            { label: "With Email", value: stats.with_email ?? 0 },
            { label: "With Phone", value: stats.with_phone ?? 0 },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: "1px solid " + th.border }}>
              <div style={{ fontSize: "18px", fontWeight: 600, color: th.text, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: th.textMuted, marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          padding: "10px 16px", borderBottom: "1px solid " + th.border,
          display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center",
          background: th.bg
        }}>
          <input
            type="text" placeholder="Search posts..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: th.inputBg, border: "1px solid " + th.border,
              borderRadius: "6px", padding: "5px 10px", color: th.text,
              fontSize: "12px", width: "140px"
            }}
          />
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {["all", ...allSubs].map(s => filterBtn(filterSub === s, () => setFilterSub(s), s === "all" ? "all" : "r/" + s))}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {["all", ...allTags.slice(0, 5)].map(t => filterBtn(filterTag === t, () => setFilterTag(t), t === "all" ? "all tags" : t))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: th.textFaint, fontFamily: "monospace" }}>
            {posts.length} results
          </span>
        </div>

        {/* Error */}
        {stats.recent_errors?.length > 0 && (
          <div style={{
            margin: "12px 16px 0", padding: "9px 12px",
            background: th.errorBg, border: "1px solid " + th.errorBorder,
            borderRadius: "8px", fontSize: "11px", color: th.errorText, fontFamily: "monospace"
          }}>⚠ {stats.recent_errors[stats.recent_errors.length - 1]}</div>
        )}

        {/* Posts */}
        <div style={{ padding: "14px 16px", maxWidth: "860px", margin: "0 auto" }}>
          {apiStatus === "connecting" && (
            <div style={{ textAlign: "center", padding: "60px 0", color: th.textMuted, fontFamily: "monospace", fontSize: "13px" }}>
              Connecting to backend...
            </div>
          )}
          {apiStatus === "error" && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: "13px", color: th.errorText, fontFamily: "monospace" }}>Cannot reach backend</div>
              <div style={{ fontSize: "11px", marginTop: "6px", color: th.textFaint }}>{API_BASE}</div>
            </div>
          )}
          {apiStatus === "live" && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: th.textMuted, fontSize: "13px" }}>
              Scanning Reddit for developer job posts...
            </div>
          )}
          {posts.map(post => (
            <PostCard key={post.id} post={post} isNew={newIds.has(post.id)} th={th} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid " + th.border, textAlign: "center" }}>
          <p style={{ fontSize: "10px", color: th.textFaint, fontFamily: "monospace" }}>
            DevLeads · {API_BASE} · polls every 10s
          </p>
        </div>
      </div>
    </>
  );
}
