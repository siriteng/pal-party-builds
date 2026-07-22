import Link from "next/link";
import { HomeFeed } from "@/components/HomeFeed";
import { PalLineup } from "@/components/PalLineup";
import { ArrowIcon, DiscordIcon, HeartIcon, SparkIcon } from "@/components/icons";
import { seedBuilds } from "@/lib/seed-builds";

export default function Home() {
  const spotlight = seedBuilds[0];
  return (
    <>
      <section className="hero">
        <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
        <div className="page-shell hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker"><SparkIcon size={16} /> BUILT BY PLAYERS. RANKED BY PLAYERS.</span>
            <h1>Stop guessing.<br /><em>Copy what works.</em></h1>
            <p>Find Palworld parties for bosses, fishing, breeding, farming, and exploration—then like the builds that actually deliver.</p>
            <div className="hero-actions">
              <Link href="#builds" className="button button-primary">Explore top builds <ArrowIcon size={19} /></Link>
              <Link href="/build/new" className="button button-ghost">Share your build</Link>
            </div>
            <div className="hero-proof">
              <span><HeartIcon size={18} filled /> <strong>4,200+</strong> community likes</span>
              <span className="proof-divider" />
              <span><DiscordIcon size={18} /> One-click Discord sign in</span>
            </div>
          </div>

          <div className="hero-showcase" aria-label="Featured fishing party">
            <div className="showcase-label"><span>TOP FISHING BUILD</span><strong>{spotlight.likes.toLocaleString("en-US")} likes</strong></div>
            <h2>{spotlight.title}</h2>
            <p>{spotlight.summary}</p>
            <PalLineup pals={spotlight.pals} detailed />
            <Link href={`/build/${spotlight.slug}`} className="showcase-link">See why it works <ArrowIcon size={18} /></Link>
          </div>
        </div>
      </section>

      <div className="page-shell"><HomeFeed initialBuilds={seedBuilds} /></div>

      <section className="contribute-strip">
        <div className="page-shell contribute-inner">
          <div><span className="eyebrow">KNOW A BETTER COMBO?</span><h2>Your party could be someone&apos;s shortcut.</h2><p>Share the five Pals, explain the trick, and let the community decide.</p></div>
          <Link href="/build/new" className="button button-light">Create a build <ArrowIcon size={19} /></Link>
        </div>
      </section>
    </>
  );
}
