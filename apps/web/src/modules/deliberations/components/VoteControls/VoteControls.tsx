import type { VoteChoice } from "@beach-theta-tau/contracts";
import { assetUrl } from "@/shared/lib/assets";

const VOTE_CHOICES = ["yes", "abstain", "no"] as const satisfies readonly VoteChoice[];

interface VoteControlsProps {
  currentVote: VoteChoice | null;
  disabled?: boolean;
  onVote: (choice: VoteChoice) => void;
}

export function VoteControls({ currentVote, disabled = false, onVote }: VoteControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {VOTE_CHOICES.map((choice) => (
        <button
          type="button"
          key={choice}
          className="flex-1 basis-0 max-w-[8rem] cursor-pointer rounded-lg border-0 bg-transparent p-1 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={() => onVote(choice)}
          aria-pressed={currentVote === choice}
        >
          <img
            className="block h-auto w-full object-contain"
            src={assetUrl(`${choice}${currentVote === choice ? "On" : "Off"}.png`)}
            alt={`${choice} vote`}
          />
        </button>
      ))}
    </div>
  );
}
