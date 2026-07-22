"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BuildComment, SessionUser } from "@/lib/types";
import { withBasePath } from "@/lib/paths";

function commentTime(value: number) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(value);
}

export function BuildComments({ buildId, buildSlug }: { buildId: string; buildSlug: string }) {
  const [comments, setComments] = useState<BuildComment[]>([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(withBasePath(`/api/builds/${buildId}/comments`), { credentials: "include" }).then((response) => response.ok ? response.json() : null),
      fetch(withBasePath("/api/me"), { credentials: "include" }).then((response) => response.ok ? response.json() : null),
    ]).then(([commentPayload, userPayload]) => {
      setComments(commentPayload?.comments ?? []);
      setUser(userPayload?.user ?? null);
    }).catch(() => setError("Could not load comments.")).finally(() => setLoading(false));
  }, [buildId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() || posting) return;
    setError("");
    setPosting(true);
    try {
      const response = await fetch(withBasePath(`/api/builds/${buildId}/comments`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not post comment.");
      setComments((current) => [payload.comment, ...current]);
      setBody("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="comments-section">
      <header className="comments-heading"><h2>Comments</h2><span>{comments.length}</span></header>

      {!loading && user && (
        <form className="comment-composer" onSubmit={submit}>
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span className="comment-avatar">{user.displayName.slice(0, 1)}</span>}
          <div><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} rows={3} placeholder="Add to the discussion…" aria-label="Comment" /><div className="comment-actions"><span>{body.length}/500</span><button type="submit" disabled={!body.trim() || posting}>{posting ? "Posting…" : "Post comment"}</button></div></div>
        </form>
      )}

      {!loading && !user && <div className="comment-sign-in"><span>Sign in to join the discussion.</span><Link href={`/auth/discord?return_to=${encodeURIComponent(`/build/${buildSlug}`)}`}>Sign in with Discord</Link></div>}
      {error && <p className="comment-error" role="alert">{error}</p>}

      <div className="comment-list">
        {comments.map((comment) => <article className="comment" key={comment.id}>{comment.author.avatarUrl ? <img src={comment.author.avatarUrl} alt="" /> : <span className="comment-avatar">{comment.author.name.slice(0, 1)}</span>}<div><div className="comment-meta"><strong>{comment.author.name}</strong><time dateTime={new Date(comment.createdAt).toISOString()}>{commentTime(comment.createdAt)}</time></div><p>{comment.body}</p></div></article>)}
        {!loading && !comments.length && <p className="comments-empty">No comments yet. Start the discussion.</p>}
        {loading && <p className="comments-empty">Loading comments…</p>}
      </div>
    </section>
  );
}
