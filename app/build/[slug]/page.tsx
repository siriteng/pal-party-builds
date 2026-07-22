import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";
import { PalLineup } from "@/components/PalLineup";
import { ArrowIcon, SparkIcon } from "@/components/icons";
import { findBuildBySlug } from "@/lib/build-repository";
import { getSeedBuild, seedBuilds } from "@/lib/seed-builds";

export const dynamic = "force-dynamic";

async function loadBuild(slug: string) {
  try { return await findBuildBySlug(slug); } catch { return getSeedBuild(slug); }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const build = await loadBuild(slug);
  return build ? { title: build.title, description: build.summary } : { title: "Party build" };
}

export default async function BuildDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = await loadBuild(slug);
  if (!build) notFound();
  const related = seedBuilds.filter((item) => item.id !== build.id && item.category === build.category).slice(0, 2);

  return (
    <div className="detail-page">
      <div className="page-shell detail-shell">
        <div className="detail-breadcrumb"><Link href="/#builds">Builds</Link><span>/</span><span>{build.category}</span></div>
        <header className="detail-header">
          <div>
            <span className={`category-chip category-${build.category.toLowerCase()}`}>{build.category}</span>
            <h1>{build.title}</h1>
            <p>{build.summary}</p>
            <div className="detail-meta"><span className="author-orb">{build.author.name.slice(0, 1)}</span><span>Build by <strong>{build.author.name}</strong></span><span>Palworld v{build.gameVersion}</span></div>
          </div>
          <LikeButton buildId={build.id} initialLikes={build.likes} initialLiked={build.likedByViewer} large />
        </header>

        <section className="party-panel">
          <div className="panel-heading"><div><span className="eyebrow">THE PARTY</span><h2>Five slots. One clear job.</h2></div><span>{build.pals.length}/5 Pals</span></div>
          <div className="detail-pal-grid">
            {build.pals.map((pal, index) => (
              <article className="detail-pal-card" key={`${pal.slug}-${index}`}>
                <div className={`detail-pal-art pal-tone-${pal.elements[0]?.toLowerCase() ?? "neutral"}`}><span className="slot-number">{index + 1}</span><img src={pal.imageUrl} alt={pal.name} /></div>
                <div className="detail-pal-copy"><h3>{pal.name}</h3><div className="element-list">{pal.elements.map((element) => <span key={element}>{element}</span>)}</div><strong>{pal.role}</strong><p>{pal.shortEffect}</p>{pal.stackNote && <div className="stack-note"><SparkIcon size={15} /> {pal.stackNote}</div>}</div>
              </article>
            ))}
          </div>
        </section>

        <div className="strategy-grid">
          <article className="strategy-main"><span className="eyebrow">HOW TO RUN IT</span><h2>The game plan</h2><p>{build.strategy}</p><div className="tag-row">{build.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
          <aside className="strategy-side"><section><span>RECOMMENDED PASSIVES</span><p>{build.passives || "No special passives required."}</p></section><section><span>BASE SUPPORT</span><p>{build.baseSupport || "No base setup required."}</p></section></aside>
        </div>

        <section className="copy-cta"><div><span className="eyebrow">TRIED THIS PARTY?</span><h2>Like it if it worked.</h2><p>Your vote helps the next player find the right build faster.</p></div><LikeButton buildId={build.id} initialLikes={build.likes} initialLiked={build.likedByViewer} large /></section>

        {related.length > 0 && <section className="related-builds"><div className="section-heading"><div><span className="eyebrow">KEEP BROWSING</span><h2>More {build.category.toLowerCase()} builds</h2></div><Link href="/#builds">View all <ArrowIcon size={17} /></Link></div><div className="mini-related-grid">{related.map((item) => <Link href={`/build/${item.slug}`} key={item.id}><PalLineup pals={item.pals} /><h3>{item.title}</h3><span>{item.likes.toLocaleString("en-US")} likes</span></Link>)}</div></section>}
      </div>
    </div>
  );
}
