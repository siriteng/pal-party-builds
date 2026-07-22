"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DiscordIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { SkillEffect } from "@/components/SkillEffect";
import { categories, type Category } from "@/lib/types";
import { pals, palBySlug, palElements } from "@/lib/pals";
import { withBasePath } from "@/lib/paths";

type SelectedPal = { slug: string; role: string; stackNote: string };
type Draft = {
  title: string;
  category: Category;
  strategy: string;
  passives: string;
  baseSupport: string;
  tags: string;
  gameVersion: string;
  pals: SelectedPal[];
};

const emptyDraft: Draft = { title: "", category: "Combat", strategy: "", passives: "", baseSupport: "", tags: "", gameVersion: "1.0", pals: [] };
const draftKey = "pal-party-build-draft";

export function BuildComposer() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [element, setElement] = useState("All");
  const [ready, setReady] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(draftKey);
        if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) });
      } catch { /* Keep the clean draft. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, ready]);

  const filteredPals = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pals.filter((pal) => {
      const matchesElement = element === "All" || pal.elements.includes(element);
      const matchesQuery = !needle || `${pal.name} ${pal.elements.join(" ")} ${pal.partnerSkill} ${pal.shortEffect}`.toLowerCase().includes(needle);
      return matchesElement && matchesQuery;
    });
  }, [element, query]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function addPal(slug: string) {
    if (draft.pals.length >= 5) return;
    update("pals", [...draft.pals, { slug, role: "", stackNote: "" }]);
  }

  function updatePal(index: number, field: "role" | "stackNote", value: string) {
    update("pals", draft.pals.map((pal, palIndex) => palIndex === index ? { ...pal, [field]: value } : pal));
  }

  function removePal(index: number) {
    update("pals", draft.pals.filter((_, palIndex) => palIndex !== index));
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!draft.title.trim() || !draft.strategy.trim() || !draft.pals.length) {
      setError("Add a result title, the strategy, and at least one Pal.");
      return;
    }
    setPublishing(true);
    try {
      const response = await fetch(withBasePath("/api/builds"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }),
      });
      if (response.status === 401) {
        router.push(`/auth/discord?return_to=${encodeURIComponent("/build/new")}`);
        return;
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not publish this build.");
      sessionStorage.removeItem(draftKey);
      router.push(`/build/${payload.slug}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not publish this build.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="composer-page">
      <form className="page-shell composer-layout" onSubmit={publish}>
        <div className="composer-main">
          <header className="composer-header"><h1>Create build</h1><p>Choose your Pals and explain how the party works.</p></header>

          <section className="composer-section">
            <div className="composer-step"><div><h2>Build details</h2></div></div>
            <div className="form-grid">
              <label className="field field-wide"><span>Result title</span><input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. +40–80% Water Pal Drops" maxLength={80} /></label>
              <div className="field field-wide"><span>Category</span><div className="category-picker">{categories.map((item) => <button type="button" key={item} className={draft.category === item ? "active" : ""} onClick={() => update("category", item)}>{item}</button>)}</div></div>
            </div>
          </section>

          <section className="composer-section">
            <div className="composer-step"><div><h2>Party</h2></div><b>{draft.pals.length}/5 selected</b></div>

            <div className="selected-party">
              {draft.pals.map((selection, index) => {
                const pal = palBySlug.get(selection.slug);
                if (!pal) return null;
                return <article className="selected-pal" key={`${selection.slug}-${index}`}>
                  <div className={`selected-pal-art pal-tone-${pal.elements[0].toLowerCase()}`}><span className="slot-number">{index + 1}</span><img src={pal.imageUrl} alt={pal.name} /></div>
                  <div><div className="selected-pal-name"><h3>{pal.name}</h3><button type="button" onClick={() => removePal(index)} aria-label={`Remove ${pal.name}`}>Remove</button></div><div className="selected-pal-skill"><div><span>Partner Skill</span><strong>{pal.partnerSkill}</strong><em>Lv.1 → Lv.5</em></div><SkillEffect text={pal.shortEffect} /></div><label><span>Job in this party <i>optional</i></span><input value={selection.role} onChange={(event) => updatePal(index, "role", event.target.value)} placeholder="Your note, not the skill description" /></label><label><span>Stacking note <i>optional</i></span><input value={selection.stackNote} onChange={(event) => updatePal(index, "stackNote", event.target.value)} placeholder="e.g. Stacks with the Ignis variant" /></label></div>
                </article>;
              })}
              {!draft.pals.length && <div className="party-placeholder"><strong>No Pals selected</strong><span>Choose up to five from the library.</span></div>}
            </div>

            <div className="pal-library">
              <div className="library-heading"><div><h3>Choose Pals <span className="library-count">{pals.length}</span></h3><span>Search by name or Partner Skill. Duplicates are allowed.</span></div><div className="library-controls"><label className="search-field"><SearchIcon size={17} /><span className="sr-only">Search Pals</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Pals" /></label><label className="element-filter"><span className="sr-only">Filter by element</span><select value={element} onChange={(event) => setElement(event.target.value)}><option value="All">All elements</option>{palElements.map((item) => <option value={item} key={item}>{item}</option>)}</select></label></div></div>
              <div className="library-results"><span>{filteredPals.length} {filteredPals.length === 1 ? "Pal" : "Pals"}</span>{(query || element !== "All") && <button type="button" onClick={() => { setQuery(""); setElement("All"); }}>Clear filters</button>}</div>
              <div className="library-grid">{filteredPals.map((pal) => <button type="button" key={pal.slug} onClick={() => addPal(pal.slug)} disabled={draft.pals.length >= 5}><span className={`library-pal-art pal-tone-${pal.elements[0].toLowerCase()}`}><img src={pal.imageUrl} alt="" loading="lazy" decoding="async" /></span><strong>{pal.name}</strong><small>{pal.partnerSkill}</small><SkillEffect className="library-skill-effect" text={pal.shortEffect} /><span className="add-pal-icon"><PlusIcon size={15} /></span></button>)}</div>
            </div>
          </section>

          <section className="composer-section">
            <div className="composer-step"><div><h2>Strategy</h2></div></div>
            <div className="form-grid">
              <label className="field field-wide"><span>How to run it</span><textarea value={draft.strategy} onChange={(event) => update("strategy", event.target.value)} placeholder="What does each Pal contribute? When should a player swap a slot?" rows={6} /></label>
              <label className="field"><span>Recommended passives <i>optional</i></span><textarea value={draft.passives} onChange={(event) => update("passives", event.target.value)} rows={3} placeholder="Swift, Vanguard…" /></label>
              <label className="field"><span>Base support <i>optional</i></span><textarea value={draft.baseSupport} onChange={(event) => update("baseSupport", event.target.value)} rows={3} placeholder="Pals or buildings that support the loop" /></label>
              <label className="field"><span>Tags <i>comma separated</i></span><input value={draft.tags} onChange={(event) => update("tags", event.target.value)} placeholder="Bossing, Player Damage" /></label>
              <label className="field"><span>Game version</span><input value={draft.gameVersion} onChange={(event) => update("gameVersion", event.target.value)} placeholder="1.0" /></label>
            </div>
          </section>
        </div>

        <aside className="publish-sidebar">
          <div className="publish-card"><h2>{draft.title || "Build preview"}</h2><div className="mini-party-preview">{draft.pals.map((selection, index) => { const pal = palBySlug.get(selection.slug); return pal ? <div className={`pal-tone-${pal.elements[0].toLowerCase()}`} key={`${selection.slug}-${index}`}><img src={pal.imageUrl} alt={pal.name} /><span>{index + 1}</span></div> : null; })}{Array.from({ length: Math.max(0, 5 - draft.pals.length) }).map((_, index) => <div className="empty" key={`empty-${index}`}>{draft.pals.length + index + 1}</div>)}</div>{error && <div className="form-error" role="alert">{error}</div>}<button type="submit" className="button button-primary publish-button" disabled={publishing}>{publishing ? "Publishing…" : "Publish build"}</button><span className="discord-note"><DiscordIcon size={16} /> Discord sign-in required</span></div>
        </aside>
      </form>
    </div>
  );
}
