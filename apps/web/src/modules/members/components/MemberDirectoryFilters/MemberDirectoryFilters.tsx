import Toggle from "@/shared/ui/Toggle/Toggle";

interface MemberDirectoryFiltersProps {
  showingOfficers: boolean;
  onChange: (showingOfficers: boolean) => void;
}

export function MemberDirectoryFilters({ showingOfficers, onChange }: MemberDirectoryFiltersProps) {
  return <Toggle isChecked={showingOfficers} onToggle={onChange} />;
}
