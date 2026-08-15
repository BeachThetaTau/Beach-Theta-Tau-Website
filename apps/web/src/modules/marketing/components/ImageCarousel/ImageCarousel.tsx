import { Carousel, type CarouselSlide } from "@/shared/ui/Carousel/Carousel";

interface ImageCarouselProps {
  slides: Array<string | CarouselSlide>;
  defaultIntervalMs?: number;
  className?: string;
}

export function ImageCarousel({
  slides,
  defaultIntervalMs = 1000,
  className = "",
}: ImageCarouselProps) {
  if (slides.length < 2) return null;
  return (
    <Carousel
      slides={slides}
      defaultIntervalMs={defaultIntervalMs}
      className={`h-[18.75rem] w-[25rem] object-cover max-[766px]:h-[14.0625rem] max-[766px]:w-[18.75rem] ${className}`.trim()}
    />
  );
}

export default ImageCarousel;
