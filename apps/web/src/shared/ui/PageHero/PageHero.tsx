import { Parallax, type ParallaxProps } from "react-parallax";
import { assetUrl } from "@/shared/lib/assets";

interface PageHeroProps {
  fileName: string;
  title: string;
  eyebrow?: string;
}

export function PageHero({ fileName, title, eyebrow }: PageHeroProps) {
  const props: ParallaxProps = {
    bgImage: assetUrl(fileName),
    strength: 300,
    bgClassName: "object-cover",
  };

  return (
    <Parallax {...props}>
      {/*
        react-parallax sizes the background image from the height of this
        content wrapper (contentHeight + strength). This element must be in
        normal flow with a real height — if every child is absolutely
        positioned the wrapper collapses to 0 and the image is sized to just
        `strength`px, so it can't cover the viewport.
      */}
      <div className="relative flex min-h-[100dvh] items-end">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

        <div className="container-page relative pb-10 md:pb-14">
          {eyebrow && <p className="eyebrow eyebrow-invert">{eyebrow}</p>}
          <h1 className="mt-2 text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
        </div>
      </div>
    </Parallax>
  );
}

export default PageHero;
