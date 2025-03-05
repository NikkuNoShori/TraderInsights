import { useNavigate } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow p-6">
      {/* Back Button */}
      <Button
        onClick={() => navigate("/app/dashboard")}
        variant="ghost"
        className="mb-6 -ml-2 text-muted hover:text-default"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Construction className="h-16 w-16 text-primary" />
        </div>

        <PageHeader
          title="Coming Soon"
          subtitle="This feature is currently under development"
          className="text-center"
        />

        <p className="mt-4 text-muted">
          We're working hard to bring you this exciting new feature. Stay tuned
          for updates!
        </p>
      </div>
    </div>
  );
}
