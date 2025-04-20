import { Link } from "react-router-dom";
import { IconType } from "react-icons";
import { FiUser, FiDatabase, FiLock, FiLink } from "react-icons/fi";

interface SettingsLink {
  to: string;
  label: string;
  icon: IconType;
  description: string;
}

const settingsLinks: SettingsLink[] = [
  {
    to: "/app/settings/profile",
    label: "Profile",
    icon: FiUser,
    description: "Manage your account settings and preferences"
  },
  {
    to: "/app/settings/data",
    label: "Data",
    icon: FiDatabase,
    description: "Import, export and manage your trade data"
  },
  {
    to: "/app/settings/security",
    label: "Security",
    icon: FiLock,
    description: "Configure security settings and authentication"
  },
  {
    to: "/app/settings/snaptrade",
    label: "SnapTrade",
    icon: FiLink,
    description: "Configure SnapTrade API integration settings"
  }
];

export default function SettingsNav() {
  return (
    <nav className="space-y-1">
      {settingsLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <link.icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium text-foreground">{link.label}</div>
            <div className="text-sm text-muted-foreground">{link.description}</div>
          </div>
        </Link>
      ))}
    </nav>
  );
}
