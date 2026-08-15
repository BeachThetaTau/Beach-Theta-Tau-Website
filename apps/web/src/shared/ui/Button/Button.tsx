import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: ReactNode;
}

const baseClasses =
  "cursor-pointer rounded-full border-0 bg-brand px-5 py-2.5 text-base text-white transition-colors hover:bg-brand-dark";

export function Button({ text, children, className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={`${baseClasses} ${className}`.trim()} {...props}>
      {children ?? text}
    </button>
  );
}

export default Button;
