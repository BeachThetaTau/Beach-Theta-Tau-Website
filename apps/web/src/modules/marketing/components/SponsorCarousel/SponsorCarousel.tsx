import { sponsorLogos } from "../../content/site-content";
import { assetUrl } from "@/shared/lib/assets";

function LogoStrip() {
  return (
    <div className="inline-block animate-marquee group-hover:[animation-play-state:paused]">
      {sponsorLogos.map(([src, alt]) => (
        <img key={src} src={assetUrl(src)} alt={alt} className="mx-8 h-auto w-[225px]" />
      ))}
    </div>
  );
}

export function SponsorCarousel() {
  return (
    <div
      className="group relative hidden overflow-hidden whitespace-nowrap bg-white max-[1000px]:block"
      aria-label="Companies where members have worked"
    >
      <LogoStrip />
      <LogoStrip />
    </div>
  );
}

export default SponsorCarousel;
