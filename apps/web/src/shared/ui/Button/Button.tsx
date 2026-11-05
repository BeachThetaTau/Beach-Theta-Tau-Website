import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: ReactNode;
}

const baseClasses = "button";

export function Button({ text, children, className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={`${baseClasses} ${className}`.trim()} {...props}>
      {children ?? text}
    </button>
  );
}

export default Button;
