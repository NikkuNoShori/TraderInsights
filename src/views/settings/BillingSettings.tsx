import { Eye, EyeOff, Download } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "@/lib/react";
import { PageHeader } from "@/components/ui";
import { Button } from "@/components/ui/button";

interface SensitiveDataProps {
  value: string;
  label: string;
  type: "card" | "bank" | "ssn" | "tax";
}

function SensitiveData({ value, label, type }: SensitiveDataProps) {
  const [isVisible, setIsVisible] = useState(false);

  const formatValue = (val: string) => {
    if (!isVisible) {
      switch (type) {
        case "card":
          return `****-****-****-${val.slice(-4)}`;
        case "bank":
          return `****${val.slice(-4)}`;
        case "ssn":
          return `***-**-${val.slice(-4)}`;
        case "tax":
          return `**-***${val.slice(-4)}`;
        default:
          return "****";
      }
    }
    return val;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{formatValue(value)}</p>
      </div>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="p-2 text-gray-400 hover:text-gray-600"
      >
        {isVisible ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // TODO: Implement upgrade logic
    } catch (error) {
      console.error("Failed to upgrade:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription and billing information"
      />

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-medium">Current Plan</h3>
        <p className="text-muted-foreground mt-1">Free Tier</p>

        <div className="mt-6">
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? "Processing..." : "Upgrade to Pro"}
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="pb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Billing Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your billing information and payment methods.
          </p>
        </div>

        <div className="space-y-4">
          <SensitiveData
            label="Credit Card"
            value="4242424242424242"
            type="card"
          />
          <SensitiveData label="Bank Account" value="9876543210" type="bank" />
          <SensitiveData label="Tax ID" value="12-3456789" type="tax" />
        </div>

        <div className="mt-6">
          <button
            disabled={loading}
            className={clsx(
              "inline-flex items-center px-4 py-2 border border-transparent",
              "text-sm font-medium rounded-md shadow-sm",
              "text-white bg-indigo-600 hover:bg-indigo-700",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              loading && "opacity-50 cursor-not-allowed",
            )}
          >
            Add Payment Method
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="pb-6">
          <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
          <p className="mt-1 text-sm text-gray-500">
            Download your past billing statements.
          </p>
        </div>

        <div className="space-y-4">
          {["March 2024", "February 2024", "January 2024"].map((month) => (
            <div
              key={month}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{month}</p>
                <p className="text-sm text-gray-500">$49.99</p>
              </div>
              <button className="p-2 text-indigo-600 hover:text-indigo-700">
                <Download className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
