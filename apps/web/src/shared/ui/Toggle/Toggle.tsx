interface ToggleProps {
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
}

export function Toggle({
  isChecked,
  onToggle,
  leftLabel = "Actives",
  rightLabel = "Officers",
}: ToggleProps) {
  const cell = "relative z-[1] px-4 py-2 text-center font-semibold transition-colors duration-300";

  return (
    <div className="flex items-center justify-center px-4">
      <input
        type="checkbox"
        id="member-directory-toggle"
        className="sr-only"
        checked={isChecked}
        onChange={(event) => onToggle(event.target.checked)}
      />
      <label
        htmlFor="member-directory-toggle"
        className="relative grid w-full max-w-[26rem] cursor-pointer grid-cols-2 rounded-full border-2 border-brand bg-brand"
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-all duration-300 ${
            isChecked ? "left-[calc(50%+0.125rem)]" : "left-1"
          }`}
        />
        <span className={`${cell} ${isChecked ? "text-white" : "text-brand"}`}>{leftLabel}</span>
        <span className={`${cell} ${isChecked ? "text-brand" : "text-white"}`}>{rightLabel}</span>
      </label>
    </div>
  );
}

export default Toggle;
