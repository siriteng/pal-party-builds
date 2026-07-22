import type { Metadata } from "next";
import { BuildComposer } from "./BuildComposer";

export const metadata: Metadata = { title: "Create a party build", description: "Share a Palworld party with the community." };

export default function NewBuildPage() {
  return <BuildComposer />;
}
