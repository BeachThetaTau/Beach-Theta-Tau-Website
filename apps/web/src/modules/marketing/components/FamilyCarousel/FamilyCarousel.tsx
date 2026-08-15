import { Carousel } from "@/shared/ui/Carousel/Carousel";
import { familySlides } from "../../content/family-data";

export function FamilyCarousel() {
  return (
    <Carousel
      slides={[...familySlides]}
      defaultIntervalMs={1500}
      className="h-[25.1875rem] w-[33rem] max-[744px]:h-[15rem] max-[744px]:w-[20rem]"
      showControls={false}
      showIndicators={false}
    />
  );
}

export default FamilyCarousel;
