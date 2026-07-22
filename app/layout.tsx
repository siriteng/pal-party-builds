import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://palbuilds.iterationx.cloud"),
  title: { default: "Pal Party Builds — Community Palworld Teams", template: "%s · Pal Party Builds" },
  description: "Discover, like, and share Palworld party builds made by players. See the full Pal lineup before you copy a build.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Pal Party Builds",
    description: "Community-tested Palworld parties worth copying.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Pal Party Builds", description: "Community-tested Palworld parties worth copying.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-shell">
            <div><strong>PAL PARTY</strong><p>Built by players, for players.</p></div>
            <nav aria-label="Footer navigation"><Link href="/about">How it works</Link><Link href="/privacy">Privacy</Link><a href="https://paldb.cc/en/Partner_Skill" target="_blank" rel="noreferrer">Pal data source</a></nav>
            <p className="fan-disclaimer">Unofficial fan project. Palworld and related assets belong to their respective owners.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
