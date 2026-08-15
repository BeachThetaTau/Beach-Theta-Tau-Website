import { rushSchedule } from "../../content/rush-schedule";

export function RushTimeline() {
  return (
    <ol className="mt-6 max-w-3xl list-none space-y-8 border-l-2 border-gold pl-8">
      {rushSchedule.map((event) => (
        <li
          key={`${event.name}-${event.date}`}
          className="relative before:absolute before:-left-[2.55rem] before:top-1 before:h-4 before:w-4 before:rounded-full before:border-2 before:border-white before:bg-gold before:shadow-sm before:content-['']"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-gold-ink">{event.date}</p>
          <p className="mt-1 text-xl font-bold text-ink">{event.name}</p>
          {event.location && <p className="text-sm font-semibold text-muted">{event.location}</p>}
          {event.description && <p className="prose-body mt-1">{event.description}</p>}
        </li>
      ))}
    </ol>
  );
}

export default RushTimeline;
