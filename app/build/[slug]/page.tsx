import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuildComments } from "@/components/BuildComments";
import { LikeButton } from "@/components/LikeButton";
import { SkillEffect } from "@/components/SkillEffect";
import { SparkIcon } from "@/components/icons";
import { findBuildBySlug } from "@/lib/build-repository";
import { getSeedBuild } from "@/lib/seed-builds";

export const dynamic = "force-dynamic";

async function loadBuild(slug: string) {
  try { return await findBuildBySlug(slug); } catch { return getSeedBuild(slug); }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const build = await loadBuild(slug);
  return build ? { title: build.title } : { title: "Party build" };
}

export default async function BuildDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = await loadBuild(slug);
  if (!build) notFound();

  return (
    <div className="detail-page">
      <div className="page-shell detail-shell">
        <header className="detail-header">
          <div className="detail-title">
            <span className={`category-chip category-${build.category.toLowerCase()}`}>{build.category}</span>
            <h1>{build.title}</h1>
            <div className="detail-meta">{build.author.avatarUrl ? <img src={build.author.avatarUrl} alt="" /> : <span className="author-orb">{build.author.name.slice(0, 1)}</span>}<span>by <strong>{build.author.name}</strong></span><span>Palworld v{build.gameVersion}</span></div>
          </div>
          <LikeButton buildId={build.id} initialLikes={build.likes} initialLiked={build.likedByViewer} large />
        </header>

        <section className="party-panel">
          <div className="panel-heading"><h2>Party</h2><span>{build.pals.length}/5 Pals</span></div>
          <div className="detail-pal-grid">
            {build.pals.map((pal, index) => (
              <article className="detail-pal-card" key={`${pal.slug}-${index}`}>
                <div className={`detail-pal-art pal-tone-${pal.elements[0]?.toLowerCase() ?? "neutral"}`}><span className="slot-number">{index + 1}</span><img src={pal.imageUrl} alt={pal.name} /></div>
                <div className="detail-pal-copy"><h3>{pal.name}</h3><div className="skill-heading"><span className="partner-skill">{pal.partnerSkill}</span><small>Lv.1 → Lv.5</small></div><div className="element-list">{pal.elements.map((element) => <span key={element}>{element}</span>)}</div><SkillEffect className="skill-effect" text={pal.shortEffect} />{pal.role && <div className="party-role"><span>Party role</span><strong>{pal.role}</strong></div>}{pal.stackNote && <div className="stack-note"><SparkIcon size={14} /> {pal.stackNote}</div>}</div>
              </article>
            ))}
            {!build.pals.length && <p className="party-empty">No Pals have been added to this build.</p>}
          </div>
        </section>

        <div className="strategy-grid">
          <article className="strategy-main"><h2>How it works</h2><p>{build.strategy}</p><div className="tag-row">{build.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
          <aside className="strategy-side"><section><h3>Recommended passives</h3><p>{build.passives || "No special passives required."}</p></section><section><h3>Base support</h3><p>{build.baseSupport || "No base setup required."}</p></section></aside>
        </div>

        <BuildComments buildId={build.id} buildSlug={build.slug} />
      </div>
    </div>
  );
}
