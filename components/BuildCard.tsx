import Link from "next/link";
import type { PartyBuild } from "@/lib/types";
import { ArrowIcon } from "./icons";
import { LikeButton } from "./LikeButton";
import { PalLineup } from "./PalLineup";

export function BuildCard({ build, featured = false }: { build: PartyBuild; featured?: boolean }) {
  return (
    <article className={`build-card${featured ? " build-card-featured" : ""}`}>
      <Link href={`/build/${build.slug}`} className="build-card-link" aria-label={`View ${build.title}`}>
        <div className="build-card-topline">
          <span className={`category-chip category-${build.category.toLowerCase()}`}>{build.category}</span>
          <LikeButton buildId={build.id} initialLikes={build.likes} initialLiked={build.likedByViewer} />
        </div>
        <div className="build-card-copy">
          <h3>{build.title}</h3>
        </div>
        <PalLineup pals={build.pals} />
        <div className="build-card-footer">
          <div className="author-line"><span className="author-orb">{build.author.name.slice(0, 1).toUpperCase()}</span><span>by <strong>{build.author.name}</strong></span></div>
          <span className="patch-label">v{build.gameVersion}</span>
          <span className="view-build">View build <ArrowIcon size={17} /></span>
        </div>
      </Link>
    </article>
  );
}
