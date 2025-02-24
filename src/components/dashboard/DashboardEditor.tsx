import { Plus, Save } from "lucide-react";
import { useState, useEffect, type FC } from "@/lib/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { toast } from "react-hot-toast";
import { DASHBOARD_CARDS } from "../../config/dashboardCards";
import { useDashboardStore } from "../../stores/dashboardStore";
import type { DashboardCardType } from "../../types/dashboard";
import { useAuthStore } from "../../stores/authStore";
import { DEFAULT_DASHBOARD_LAYOUT } from "../../config/dashboardTheme";

interface DashboardEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple Label component
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {children}
    </label>
  );
}

export function DashboardEditor({ isOpen, onClose }: DashboardEditorProps) {
  const user = useAuthStore((state) => state.user);
  const {
    currentProfile,
    currentProfileId,
    profiles,
    createProfile,
    setCurrentProfile,
    updateProfile,
  } = useDashboardStore();

  const [selectedProfileId, setSelectedProfileId] = useState(currentProfileId);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<DashboardCardType>>(
    new Set(currentProfile?.enabledCards || [])
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProfileId(currentProfileId);
      setProfileName(currentProfile?.name || "");
      setSelectedCards(new Set(currentProfile?.enabledCards || []));
      setIsCreatingNew(false);
    }
  }, [isOpen, currentProfile, currentProfileId]);

  const handleToggleCard = (cardType: DashboardCardType) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardType)) {
      newSelected.delete(cardType);
    } else {
      newSelected.add(cardType);
    }
    setSelectedCards(newSelected);
  };

  const handleProfileChange = (profileId: string) => {
    if (profileId === "new") {
      setIsCreatingNew(true);
      setProfileName("");
      setSelectedCards(new Set(currentProfile?.enabledCards || []));
    } else {
      setIsCreatingNew(false);
      const profile = profiles.find((p) => p.id === profileId);
      if (profile) {
        setSelectedProfileId(profileId);
        setProfileName(profile.name);
        setSelectedCards(new Set(profile.enabledCards));
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!profileName.trim()) {
        toast.error("Please enter a dashboard name");
        return;
      }

      if (selectedCards.size === 0) {
        toast.error("Please select at least one card");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to save a dashboard");
        return;
      }

      if (isCreatingNew) {
        await createProfile({
          userId: user.id,
          name: profileName.trim(),
          isDefault: profiles.length === 0,
          enabledCards: Array.from(selectedCards),
          layout: DEFAULT_DASHBOARD_LAYOUT,
        });
        toast.success("Dashboard created successfully");
      } else {
        await updateProfile(selectedProfileId, {
          name: profileName.trim(),
          enabledCards: Array.from(selectedCards),
        });
        toast.success("Dashboard updated successfully");
      }

      // Switch to the dashboard if it's not currently selected
      if (selectedProfileId !== currentProfileId) {
        setCurrentProfile(selectedProfileId);
      }

      onClose();
    } catch (error) {
      console.error("Error saving dashboard:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save dashboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Dashboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Dashboard</Label>
            <Select
              value={isCreatingNew ? "new" : selectedProfileId}
              onValueChange={handleProfileChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a dashboard" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} {profile.isDefault && "(Default)"}
                  </SelectItem>
                ))}
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Dashboard
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Dashboard Name</Label>
            <Input
              id="name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter dashboard name"
            />
          </div>

          <div className="space-y-2">
            <Label>Available Cards</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(DASHBOARD_CARDS).map(([type, card]) => (
                <Card
                  key={type}
                  className={`cursor-pointer transition-colors ${
                    selectedCards.has(type as DashboardCardType)
                      ? "border-primary"
                      : "hover:border-muted-foreground"
                  }`}
                  onClick={() => handleToggleCard(type as DashboardCardType)}
                >
                  <div className="p-4">
                    <h3 className="text-sm font-medium">{card.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!profileName.trim() || selectedCards.size === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreatingNew ? "Create Dashboard" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
