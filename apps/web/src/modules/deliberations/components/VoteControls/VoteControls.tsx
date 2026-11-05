import type { VoteChoice } from "@beach-theta-tau/contracts";
import { LuCircleCheck, LuCircleX, LuCircleMinus } from "react-icons/lu";

const VOTE_CHOICES = [
  {
    choice: "yes",
    icon: LuCircleCheck,
    selected: "border-transparent bg-green-700 text-white",
    unselected:
      "border-line bg-white text-green-700 enabled:hover:border-green-600 enabled:hover:bg-green-50",
  },
  {
    choice: "abstain",
    icon: LuCircleMinus,
    selected: "border-transparent bg-gray-700 text-white",
    unselected:
      "border-line bg-white text-gray-600 enabled:hover:border-gray-500 enabled:hover:bg-gray-50",
  },
  {
    choice: "no",
    icon: LuCircleX,
    selected: "border-transparent bg-red-700 text-white",
    unselected:
      "border-line bg-white text-red-700 enabled:hover:border-red-600 enabled:hover:bg-red-50",
  },
] as const;

interface VoteControlsProps {
  currentVote: VoteChoice | null;
  disabled?: boolean;
  onVote: (choice: VoteChoice) => void;
}

export function VoteControls({ currentVote, disabled = false, onVote }: VoteControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {VOTE_CHOICES.map(({ choice, icon: Icon, selected, unselected }) => (
        <button
          type="button"
          key={choice}
          className={`flex max-w-[8rem] flex-1 basis-0 items-center justify-center rounded-lg border-2 px-3 py-4 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-gray-900 cursor-pointer disabled:cursor-default ${
            currentVote === choice ? selected : unselected
          }`}
          disabled={disabled}
          onClick={() => onVote(choice)}
          aria-label={`${choice} vote`}
          aria-pressed={currentVote === choice}
        >
          <Icon className="h-8 w-8" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
