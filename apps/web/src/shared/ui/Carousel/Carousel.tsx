import { useEffect, useState } from "react";
import { assetUrl } from "../../lib/assets";

export interface CarouselSlide {
  src: string;
  alt?: string;
  captionTitle?: string;
  captionText?: string;
  intervalMs?: number;
}

interface CarouselProps {
  slides: Array<string | CarouselSlide>;
  defaultIntervalMs?: number;
  className?: string;
  showControls?: boolean;
  showIndicators?: boolean;
}

export function Carousel({
  slides,
  defaultIntervalMs = 3000,
  className = "",
  showControls = true,
  showIndicators = true,
}: CarouselProps) {
  const normalized: CarouselSlide[] = slides.map((slide) =>
    typeof slide === "string" ? { src: slide } : slide,
  );
  const count = normalized.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused) return;
    const interval = normalized[active]?.intervalMs ?? defaultIntervalMs;
    const timer = window.setTimeout(() => setActive((prev) => (prev + 1) % count), interval);
    return () => window.clearTimeout(timer);
  }, [active, paused, count, defaultIntervalMs, normalized]);

  const first = normalized[0];
  if (!first) return null;

  const go = (next: number) => setActive(((next % count) + count) % count);

  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
    >
      {normalized.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={index !== active}
        >
          <img
            src={assetUrl(slide.src)}
            alt={slide.alt ?? `Slide ${index + 1}`}
            className="h-full w-full object-cover"
          />
          {(slide.captionTitle || slide.captionText) && (
            <div className="absolute inset-x-0 bottom-4 text-center text-white drop-shadow">
              {slide.captionTitle && (
                <h3 className="text-lg font-semibold">{slide.captionTitle}</h3>
              )}
              {slide.captionText && <p className="text-sm">{slide.captionText}</p>}
            </div>
          )}
        </div>
      ))}

      {/* Keep the intrinsic size of the first slide so the container has height */}
      <img
        src={assetUrl(first.src)}
        alt=""
        aria-hidden="true"
        className="invisible h-full w-full object-cover"
      />

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-lg text-white transition-colors hover:bg-black/50"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-lg text-white transition-colors hover:bg-black/50"
          >
            ›
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
          {normalized.map((slide, index) => (
            <button
              key={`dot-${slide.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === active ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
