import { useLocation } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { SettingsNav } from "../../components/navigation/SettingsNav";
import ProfileSettings from "./ProfileSettings";
import SecuritySettings from "./SecuritySettings";
import AppearanceSettings from "./AppearanceSettings";
import NotificationSettings from "./NotificationSettings";

export default function Settings() {
  const location = useLocation();
  const path = location.pathname.split("/").pop();

  const renderContent = () => {
    switch (path) {
      case "profile":
        return <ProfileSettings />;
      case "security":
        return <SecuritySettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="flex-grow p-6 bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences"
          className="mb-6"
        />

        <div className="flex gap-8">
          {/* Left sidebar with nav */}
          <div className="w-64 flex-shrink-0">
            <SettingsNav />
          </div>

          {/* Right content area */}
          <div className="flex-1">
            <div className="bg-card dark:bg-dark-paper rounded-lg border border-border dark:border-dark-border">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
