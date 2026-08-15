import { Link } from "react-router-dom";
import { EmptyState } from "@/shared/ui/EmptyState/EmptyState";

export function NotFoundPage() {
  return (
    <div>
      <EmptyState title="Page not found" description="The page you requested does not exist." />
      <p style={{ textAlign: "center" }}>
        <Link to="/">Return home</Link>
      </p>
    </div>
  );
}
