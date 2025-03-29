import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleAuthStateChange } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          throw new Error("Missing required tokens");
        }

        // Set the session in Supabase
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        // Handle the auth state change
        await handleAuthStateChange("SIGNED_IN", session);

        // Show success message
        toast({
          title: "Email confirmed",
          description: "Your account has been successfully verified.",
        });

        // Redirect to the dashboard
        navigate("/app/dashboard");
      } catch (error) {
        console.error("Error handling auth callback:", error);
        toast({
          title: "Verification failed",
          description: "There was an error verifying your email. Please try again.",
          variant: "destructive",
        });
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [navigate, handleAuthStateChange, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Verifying your email</CardTitle>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your account...</p>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
} 