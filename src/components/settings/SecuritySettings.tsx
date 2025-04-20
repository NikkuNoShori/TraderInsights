import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SecuritySettings() {
  const { register, handleSubmit } = useForm<SecurityFormData>();

  const onSubmit = async (data: SecurityFormData) => {
    // TODO: Implement password change
    console.log('Password change:', data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Change Password</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                placeholder="Enter your new password"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm your new password"
                autoComplete="new-password"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Change Password</Button>
            </div>
          </form>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={false}
              onCheckedChange={() => {
                // TODO: Implement 2FA toggle
                console.log('Toggle 2FA');
              }}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Session Management</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of all other browser sessions
          </p>
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement session clear
              console.log('Clear other sessions');
            }}
          >
            Sign Out Other Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 