import { useDashboardStore } from "../../stores/dashboardStore";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/select";

export function DashboardProfileSelect() {
  const { profiles, currentProfileId, setCurrentProfile } = useDashboardStore();

  if (profiles.length <= 1) return null;

  return (
    <Select
      value={currentProfileId}
      onValueChange={(value) => setCurrentProfile(value)}
    >
      <SelectTrigger className="w-[200px]">
        <span>
          {profiles.find((p) => p.id === currentProfileId)?.name ||
            "Default Layout"}
        </span>
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
