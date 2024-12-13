import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/select';
import { Button } from '../ui/button';
import { useDashboard } from '../../contexts/DashboardContext';
import { Plus, Settings } from 'lucide-react';

export function DashboardProfileSelect() {
  const { 
    currentProfile, 
    profiles, 
    switchProfile,
    setIsEditing 
  } = useDashboard();

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentProfile?.id || ''}
        onValueChange={(id: string) => switchProfile(id)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select dashboard" />
        </SelectTrigger>
        <SelectContent>
          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name} {profile.isDefault && '(Default)'}
            </SelectItem>
          ))}
          <SelectItem value="new">
            <div className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className="p-2"
        onClick={() => setIsEditing(true)}
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
} 