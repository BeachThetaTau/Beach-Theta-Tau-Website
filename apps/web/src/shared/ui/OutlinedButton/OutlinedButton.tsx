import type { HTMLAttributes } from "react";

interface OutlinedButtonProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  fontSize?: string;
}

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center rounded-full border-2 border-maroon bg-transparent px-4 py-1.5 font-semibold leading-none text-maroon transition-all duration-200 hover:bg-maroon hover:text-white";

export function OutlinedButton({
  text,
  fontSize = "0.75rem",
  className = "",
  style,
  ...props
}: OutlinedButtonProps) {
  return (
    <span
      className={`${baseClasses} ${className}`.trim()}
      style={{ fontSize, ...style }}
      {...props}
    >
      {text}
    </span>
  );
}

export default OutlinedButton;
