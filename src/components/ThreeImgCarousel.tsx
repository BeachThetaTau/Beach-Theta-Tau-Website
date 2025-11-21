// DisplayCarousel.tsx
import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "./ThreeImgCarousel.css";

type Slide =
  | string
  | {
      src: string;
      alt?: string;
      captionTitle?: string;
      captionText?: string;
      intervalMs?: number; // per-slide override (defaults to 1000)
    };

interface DisplayCarouselProps {
  slides: Slide[]; // must be length >= 2
  defaultIntervalMs?: number; // default per-slide interval (ms)
  className?: string; // optional extra classes for the <Carousel>
}

const toSlideObj = (s: Slide) => (typeof s === "string" ? { src: s } : s);

const DisplayCarousel: React.FC<DisplayCarouselProps> = ({
  slides,
  defaultIntervalMs = 1000,
  className = "",
}) => {
  const normalized = slides.map(toSlideObj).filter(Boolean);

  // Require at least 2 images
  if (normalized.length < 2) {
    console.warn("DisplayCarousel requires at least 2 slides.");
    return null;
  }

  return (
    <Carousel fade className={`carousel-img ${className}`.trim()}>
      {normalized.map((s, idx) => (
        <Carousel.Item
          key={s.src + idx}
          interval={s.intervalMs ?? defaultIntervalMs}
        >
          <img
            src={s.src}
            alt={s.alt ?? `Slide ${idx + 1}`}
            className="carousel-img"
          />
          {(s.captionTitle || s.captionText) && (
            <Carousel.Caption>
              {s.captionTitle && <h3>{s.captionTitle}</h3>}
              {s.captionText && <p>{s.captionText}</p>}
            </Carousel.Caption>
          )}
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default DisplayCarousel;
