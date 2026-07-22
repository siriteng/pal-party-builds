import Link from "next/link";
import { ArrowIcon, DiscordIcon, HeartIcon, SparkIcon } from "@/components/icons";

export default function AboutPage() {
  return (
    <div className="simple-page"><div className="narrow-shell">
      <span className="hero-kicker"><SparkIcon size={16} /> HOW IT WORKS</span>
      <h1>Good builds should be easy to copy.</h1>
      <p className="simple-lead">Pal Party turns scattered Palworld tricks into visual party cards. You see the Pals first, understand each job, and use community likes as a shortcut to the builds worth trying.</p>
      <div className="how-grid"><article><span>01</span><h2>See the party</h2><p>Every build leads with large Pal images and names. No decoding mystery slot numbers.</p></article><article><span>02</span><h2>Read the trick</h2><p>Roles, stacking exceptions, passives, and base support stay attached to the exact slot they affect.</p></article><article><span>03</span><h2>Trust the crowd</h2><p><HeartIcon filled /> Likes reveal which ideas players would actually recommend.</p></article></div>
      <section className="discord-explainer"><DiscordIcon size={32} /><div><h2>Discord only when you need it</h2><p>Browse anonymously. Sign in only to like or publish. We request the basic <strong>identify</strong> scope—no email, server list, or bot.</p></div></section>
      <Link href="/build/new" className="button button-primary">Share a build <ArrowIcon size={18} /></Link>
    </div></div>
  );
}
