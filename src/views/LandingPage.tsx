import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "@/lib/react";
import { clearDeveloperMode } from "@/lib/utils/auth";

const AppIcon = () => (
  <svg
    className="text-primary"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="256" cy="256" r="256" fill="currentColor" fillOpacity="0.1"/>
    <path
      d="M128 384L192 256L256 320L320 192L384 128"
      stroke="currentColor"
      strokeWidth="48"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="320"
      cy="192"
      r="64"
      stroke="currentColor"
      strokeWidth="32"
      fill="none"
    />
    <line
      x1="365"
      y1="237"
      x2="416"
      y2="288"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinecap="round"
    />
    <circle cx="192" cy="256" r="16" fill="currentColor"/>
    <circle cx="256" cy="320" r="16" fill="currentColor"/>
    <circle cx="320" cy="192" r="16" fill="currentColor"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();

  // Clear any developer mode state when component mounts
  useEffect(() => {
    clearDeveloperMode();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              Master Your Trading Journey
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Track, analyze, and improve your trading performance with powerful
              analytics and insights.
            </p>
            <div className="mt-8">
              <Button
                onClick={() => navigate("/auth/login")}
                className="text-lg px-8 py-4 rounded-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive tools designed for serious traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6">
                  <AppIcon />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Performance Tracking
              </h3>
              <p className="text-muted-foreground">
                Monitor your trading performance with detailed metrics and
                analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Trading Journal
              </h3>
              <p className="text-muted-foreground">
                Document your trades and learn from your experiences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Advanced Analytics
              </h3>
              <p className="text-muted-foreground">
                Gain insights with comprehensive statistical analysis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Portfolio Management
              </h3>
              <p className="text-muted-foreground">
                Track and optimize your portfolio performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Ready to Take Control of Your Trading?
          </h2>
          <Button
            onClick={() => navigate("/auth/login")}
            className="text-lg px-8 py-4 rounded-full"
          >
            Start Trading Smarter
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6">
                  <AppIcon />
                </div>
                <span className="font-semibold text-foreground">
                  TraderInsights
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate("/contact")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact Us
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TraderInsights. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
