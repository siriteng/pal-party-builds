"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HeartIcon } from "./icons";
import { withBasePath } from "@/lib/paths";

type LikeButtonProps = {
  buildId: string;
  initialLikes: number;
  initialLiked?: boolean;
  large?: boolean;
};

export function LikeButton({ buildId, initialLikes, initialLiked = false, large = false }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function toggleLike(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(withBasePath(`/api/builds/${encodeURIComponent(buildId)}/like`), { method: "POST", credentials: "include" });
      if (response.status === 401) {
        const resumeLike = `/api/builds/${encodeURIComponent(buildId)}/like?return_to=${encodeURIComponent(pathname || "/")}`;
        router.push(`/auth/discord?return_to=${encodeURIComponent(resumeLike)}`);
        return;
      }
      if (!response.ok) throw new Error("Like failed");
      const payload = await response.json();
      setLikes(payload.likes);
      setLiked(payload.liked);
    } catch {
      setLiked((value) => !value);
      setLikes((value) => Math.max(0, value + (liked ? -1 : 1)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={`like-button${liked ? " is-liked" : ""}${large ? " like-button-large" : ""}`} onClick={toggleLike} disabled={loading} aria-label={liked ? "Unlike this build" : "Like this build"} aria-pressed={liked}>
      <HeartIcon size={large ? 23 : 18} filled={liked} />
      <span>{likes.toLocaleString("en-US")}</span>
    </button>
  );
}
