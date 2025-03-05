import { useNavigate } from "react-router-dom";
import { LineChart, TrendingUp, BookOpen, GraduationCap, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui";

export default function Playbook() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Strategy Library",
      description: "Access and customize proven trading strategies",
    },
    {
      icon: TrendingUp,
      title: "Backtesting Engine",
      description: "Test your strategies against historical data",
    },
    {
      icon: LineChart,
      title: "Performance Analytics",
      description: "Track and analyze your strategy performance",
    },
    {
      icon: GraduationCap,
      title: "Strategy Builder",
      description: "Create and optimize your trading strategies",
    },
  ];

  return (
    <div className="flex-grow p-6 bg-background">
      {/* Back Button */}
      <Button
        onClick={() => navigate("/app/dashboard")}
        variant="ghost"
        className="mb-6 -ml-2 text-muted hover:text-default"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Clock className="h-16 w-16 text-primary animate-pulse" />
          </div>

          <PageHeader
            title="Strategy Playbook"
            subtitle="Your Trading Strategy Command Center"
            className="text-center"
          />

          <p className="mt-4 text-muted max-w-2xl mx-auto">
            We're building a comprehensive strategy development platform to help you create,
            test, and optimize your trading strategies. Combine technical analysis with
            your trading rules to create a winning playbook.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-card border border-border hover:border-border-hover
                         transition-all duration-200 group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-primary-10 text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-default mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex flex-col items-center mt-8 space-y-6">
          <div className="w-full max-w-md bg-card rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full w-1/2 animate-progress" />
          </div>
          <p className="text-muted text-sm">
            Development Progress: 50% Complete
          </p>
        </div>
      </div>
    </div>
  );
} 