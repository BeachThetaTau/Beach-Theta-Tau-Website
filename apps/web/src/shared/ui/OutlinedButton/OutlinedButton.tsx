import type { HTMLAttributes } from "react";

interface OutlinedButtonProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  fontSize?: string;
}

const baseClasses = "button-outlined";

export function OutlinedButton({
  text,
  fontSize,
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
