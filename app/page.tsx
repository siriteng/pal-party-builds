import Link from "next/link";
import { HomeFeed } from "@/components/HomeFeed";
import { ArrowIcon } from "@/components/icons";
import { seedBuilds } from "@/lib/seed-builds";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="page-shell">
          <div className="hero-copy">
            <h1>Palworld community builds</h1>
            <div className="hero-actions">
              <Link href="#builds" className="button button-primary">Browse builds <ArrowIcon size={18} /></Link>
              <Link href="/build/new" className="button button-ghost">Create a build</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell"><HomeFeed initialBuilds={seedBuilds} /></div>
    </>
  );
}
