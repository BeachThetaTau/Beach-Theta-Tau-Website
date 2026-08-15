interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="grid min-h-[40vh] place-items-center px-6 py-16 text-center">
      <div className="max-w-md">
        <h2 className="subsection-title">{title}</h2>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
    </div>
  );
}

export default EmptyState;
