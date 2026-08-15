export interface RushEvent {
  name: string;
  date: string;
  location: string;
  description: string;
}

export const rushSchedule: RushEvent[] = [
  {
    name: "INFO NIGHT",
    date: "9/8 - 7:00 PM",
    location: "TBD",
    description:
      "Discover the opportunities and benefits offered by Theta Tau, learn about our community, and see how to become part of it.",
  },
  {
    name: "ENGINEERING NIGHT",
    date: "9/9 - 7:00 PM",
    location: "TBD",
    description:
      "Connect with fellow rushees and collaborate with our brothers while showcasing engineering skills and teamwork.",
  },
  {
    name: "PROFESSIONAL NIGHT",
    date: "9/10 - 7:00 PM",
    location: "TBD",
    description:
      "Join friendly speed interviews, hear how Theta Tau supports professional growth, and practice career-readiness skills.",
  },
  {
    name: "GAME NIGHT",
    date: "9/11 - 7:00 PM",
    location: "Horn Center",
    description:
      "Meet members in a relaxed setting through board games, card games, and collaborative activities.",
  },
  {
    name: "SOCIAL NIGHT",
    date: "9/12 - 7:00 PM",
    location: "TBD",
    description: "Spend an evening getting to know the members of Theta Tau over a shared meal.",
  },
];
