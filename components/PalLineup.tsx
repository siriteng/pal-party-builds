import type { BuildPal } from "@/lib/types";

type PalLineupProps = {
  pals: BuildPal[];
  detailed?: boolean;
};

export function PalLineup({ pals, detailed = false }: PalLineupProps) {
  return (
    <div className={`pal-lineup${detailed ? " pal-lineup-detailed" : ""}`}>
      {pals.map((pal, index) => (
        <div className="pal-slot" key={`${pal.slug}-${index}`}>
          <div className={`pal-portrait pal-tone-${pal.elements[0]?.toLowerCase() ?? "neutral"}`}>
            <span className="slot-number">{index + 1}</span>
            <img src={pal.imageUrl} alt={pal.name} loading="lazy" />
          </div>
          <strong title={pal.name}>{pal.name}</strong>
          {detailed && <span>{pal.role}</span>}
        </div>
      ))}
    </div>
  );
}
