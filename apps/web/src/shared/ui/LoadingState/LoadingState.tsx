interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div
      className="grid min-h-[40vh] place-items-center px-6 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-brand"
          aria-hidden="true"
        />
        <p className="text-muted">{label}</p>
      </div>
    </div>
  );
}

export default LoadingState;
