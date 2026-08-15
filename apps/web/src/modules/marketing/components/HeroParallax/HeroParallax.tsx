import { Parallax, type ParallaxProps } from "react-parallax";
import { assetUrl } from "@/shared/lib/assets";

export function HeroParallax() {
  const props: ParallaxProps = {
    bgImage: assetUrl("Scenery.jpg"),
    strength: 300,
    bgClassName: "object-cover",
  };

  return (
    <Parallax {...props}>
      {/*
        The content wrapper must be in normal flow with a real height so
        react-parallax sizes the background image to cover the viewport
        (image height = contentHeight + strength). Absolutely-positioned
        children alone collapse it to 0, capping the image at `strength`px.
      */}
      <div className="relative flex min-h-[100dvh] items-end">
        {/* Legibility scrim over the photo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

        <div className="container-page relative pb-14 md:pb-20">
          <p className="eyebrow eyebrow-invert animate-rise">Theta Tau at Long Beach</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.12] text-white animate-rise sm:text-4xl md:text-5xl">
            The first and foremost professional engineering fraternity at Long Beach.
          </h1>
        </div>
      </div>
    </Parallax>
  );
}

export default HeroParallax;
