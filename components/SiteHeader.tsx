"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/types";
import { DiscordIcon, PlusIcon } from "./icons";

export function SiteHeader() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setUser(payload?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const signInHref = `/auth/discord?return_to=${encodeURIComponent(pathname || "/")}`;

  return (
    <header className="site-header">
      <div className="header-shell">
        <Link href="/" className="brand" aria-label="Pal Party Builds home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><strong>PAL PARTY</strong><small>COMMUNITY BUILDS</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/#builds">Discover</Link>
          <Link href="/build/new">Create</Link>
          <Link href="/about">How it works</Link>
        </nav>

        <div className="header-actions">
          <Link href="/build/new" className="button button-primary button-compact"><PlusIcon size={17} /> Build a party</Link>
          {user ? (
            <button className="user-chip" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}>
              <img src={user.avatarUrl} alt="" />
              <span>{user.displayName}</span>
            </button>
          ) : (
            <Link href={signInHref} className="button button-discord button-compact"><DiscordIcon size={18} /> Sign in</Link>
          )}
          <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span /><span />
          </button>
        </div>

        {menuOpen && (
          <div className="account-menu">
            <Link href="/#builds" onClick={() => setMenuOpen(false)}>Discover builds</Link>
            <Link href="/build/new" onClick={() => setMenuOpen(false)}>Create a build</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>How it works</Link>
            {user && <a href="/auth/logout">Sign out</a>}
            {!user && <Link href={signInHref}>Continue with Discord</Link>}
          </div>
        )}
      </div>
    </header>
  );
}
