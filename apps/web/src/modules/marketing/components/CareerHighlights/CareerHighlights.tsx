import { useEffect, useRef, useState } from "react";
import { assetUrl } from "@/shared/lib/assets";
import { sponsorLogos } from "../../content/site-content";

const rowDelays = [
  "[transition-delay:0.25s]",
  "[transition-delay:0.5s]",
  "[transition-delay:0.75s]",
  "[transition-delay:1s]",
];

export function CareerHighlights() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const rows = Array.from({ length: 4 }, (_, index) =>
    sponsorLogos.slice(index * 4, index * 4 + 4),
  );

  return (
    <div className="max-[1000px]:hidden">
      <div
        className={`transition-opacity duration-[250ms] ease-in-out ${isInView ? "opacity-100" : "opacity-0"}`}
        ref={sectionRef}
      >
        {rows.map((row, index) => (
          <ul
            className={`m-0 flex list-none items-baseline justify-evenly pb-8 transition-opacity duration-[250ms] ease-in-out ${rowDelays[index]} ${isInView ? "opacity-100" : "opacity-0"}`}
            key={index}
          >
            {row.map(([src, alt]) => (
              <li key={src} className="mr-4 last:mr-0">
                <img src={assetUrl(src)} alt={alt} className="h-auto w-[200px]" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default CareerHighlights;
