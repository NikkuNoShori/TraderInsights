import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DebugSettings } from '@/components/settings/DebugSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Manage your account and preferences</p>
        
        <Tabs defaultValue="profile">
          <div className="bg-muted/30 rounded-lg p-1">
            <TabsList className="w-full grid grid-cols-7 gap-1">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="snaptrade">SnapTrade</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-muted-foreground">Profile settings coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-muted-foreground">Data management settings coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="snaptrade">
              <Card>
                <CardHeader>
                  <CardTitle>SnapTrade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-muted-foreground">SnapTrade settings coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-muted-foreground">Appearance settings coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-muted-foreground">Notification settings coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debug">
              <DebugSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 