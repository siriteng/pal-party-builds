"use client";

import { useEffect, useMemo, useState } from "react";
import { BuildCard } from "./BuildCard";
import { SearchIcon } from "./icons";
import { categories, type PartyBuild } from "@/lib/types";
import { withBasePath } from "@/lib/paths";

export function HomeFeed({ initialBuilds }: { initialBuilds: PartyBuild[] }) {
  const [builds, setBuilds] = useState(initialBuilds);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"Top" | "Fresh">("Top");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(withBasePath("/api/builds"), { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => payload?.builds?.length && setBuilds(payload.builds))
      .catch(() => undefined);
  }, []);

  const visibleBuilds = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return builds
      .filter((build) => category === "All" || build.category === category)
      .filter((build) => !needle || `${build.title} ${build.summary} ${build.tags.join(" ")} ${build.pals.map((pal) => pal.name).join(" ")}`.toLowerCase().includes(needle))
      .sort((a, b) => sort === "Top" ? b.likes - a.likes : b.createdAt - a.createdAt);
  }, [builds, category, query, sort]);

  return (
    <section className="feed-section" id="builds">
      <div className="section-heading">
        <div><span className="eyebrow">COMMUNITY-TESTED</span><h2>Builds worth copying</h2></div>
        <div className="sort-toggle" role="group" aria-label="Sort builds">
          {(["Top", "Fresh"] as const).map((item) => <button type="button" key={item} className={sort === item ? "active" : ""} onClick={() => setSort(item)}>{item}</button>)}
        </div>
      </div>

      <div className="feed-tools">
        <div className="category-tabs" role="group" aria-label="Filter by category">
          {["All", ...categories].map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <label className="search-field"><SearchIcon size={18} /><span className="sr-only">Search builds or Pals</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Pal or build" /></label>
      </div>

      {visibleBuilds.length ? (
        <div className="build-grid">
          {visibleBuilds.map((build, index) => <BuildCard build={build} featured={index === 0 && category === "All" && !query} key={build.id} />)}
        </div>
      ) : (
        <div className="empty-state"><span>◌</span><h3>No build found</h3><p>Try another Pal name or category.</p></div>
      )}
    </section>
  );
}
