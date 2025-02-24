import { useDeveloperStore } from "@/stores/developerStore";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function DeveloperModeToggle() {
  const { isDeveloperMode, setDeveloperMode } = useDeveloperStore();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="developer-mode"
        checked={isDeveloperMode}
        onCheckedChange={setDeveloperMode}
      />
      <Label htmlFor="developer-mode">Developer Mode</Label>
    </div>
  );
}
