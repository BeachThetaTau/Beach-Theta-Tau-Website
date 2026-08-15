export function Logo() {
  return (
    <div className="flex items-center justify-start">
      <img src="/Logo.png" alt="Theta Tau" className="h-11 w-11 object-contain" />
      <div className="flex flex-col pl-3 text-left">
        <p className="m-0 text-[1.05rem] font-bold leading-[1.15] tracking-[-0.01em] text-ink">
          Theta Tau
        </p>
        <p className="m-0 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">
          Long Beach State • Xi Epsilon
        </p>
      </div>
    </div>
  );
}

export default Logo;
