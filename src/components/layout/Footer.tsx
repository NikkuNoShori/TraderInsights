import { Link } from "react-router-dom";
import { LineChart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <LineChart className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">
              TraderInsights
            </span>
          </div>

          {/* Links */}
          <div className="flex justify-center space-x-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TraderInsights. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 