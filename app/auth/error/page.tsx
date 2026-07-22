import Link from "next/link";
import { DiscordIcon } from "@/components/icons";

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const notConfigured = reason === "not-configured";
  return <div className="simple-page auth-error-page"><div className="auth-error-card"><DiscordIcon size={42} /><span className="eyebrow">DISCORD SIGN IN</span><h1>{notConfigured ? "Almost ready." : "Sign in did not finish."}</h1><p>{notConfigured ? "The site is running in preview mode. Add the Discord Client ID and Secret in Cloudflare before public launch." : "The authorization window expired or could not be verified. Please return home and try again."}</p><Link href="/" className="button button-primary">Back to builds</Link></div></div>;
}
