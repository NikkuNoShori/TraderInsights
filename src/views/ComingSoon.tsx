import { useNavigate } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Construction className="h-16 w-16 text-primary" />
        </div>

        <PageHeader
          title="Coming Soon"
          subtitle="This feature is currently under development"
          className="text-center"
        />

        <p className="mt-4 text-muted-foreground">
          We're working hard to bring you this exciting new feature. Stay tuned
          for updates!
        </p>

        <div className="mt-8">
          <Button
            onClick={() => navigate("/app/dashboard")}
            variant="outline"
            className="min-w-[200px]"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
