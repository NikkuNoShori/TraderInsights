import React from "react";
import { PageHeader } from "@/components/ui";
import { AuthMonitoring } from "@/components/admin/AuthMonitoring";
import { Shield } from "lucide-react";

export default function SecurityMonitoring() {
  return (
    <div className="flex-grow p-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-primary" />
        <PageHeader
          title="Security Monitoring"
          subtitle="Monitor authentication attempts and security metrics"
        />
      </div>
      <div className="mt-6">
        <AuthMonitoring />
      </div>
    </div>
  );
}
