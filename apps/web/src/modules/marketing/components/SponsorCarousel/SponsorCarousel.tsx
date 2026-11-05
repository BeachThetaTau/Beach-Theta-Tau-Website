import { sponsorLogos } from "../../content/site-content";
import { assetUrl } from "@/shared/lib/assets";

function LogoStrip({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      className="m-0 flex shrink-0 list-none items-center motion-safe:animate-marquee motion-safe:group-hover:[animation-play-state:paused]"
      aria-hidden={duplicate || undefined}
    >
      {sponsorLogos.map(([src, alt]) => (
        <li key={src} className="flex h-28 w-56 shrink-0 items-center justify-center px-8">
          <img
            src={assetUrl(src)}
            alt={duplicate ? "" : alt}
            className="max-h-20 w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );
}

export function SponsorCarousel() {
  return (
    <div
      className="group hidden overflow-hidden max-[1000px]:flex motion-reduce:overflow-x-auto"
      aria-label="Companies where members have worked"
    >
      <LogoStrip />
      <div className="flex shrink-0 motion-reduce:hidden" aria-hidden="true">
        <LogoStrip duplicate />
      </div>
    </div>
  );
}

export default SponsorCarousel;
