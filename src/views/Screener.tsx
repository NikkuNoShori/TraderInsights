import { useNavigate } from "react-router-dom";
import { useTheme } from "@/providers/ThemeProvider";
import { AuthGuard } from "../components/AuthGuard";

export function Screener() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <AuthGuard>
      <div className="flex-1 p-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card dark:bg-dark-paper rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground dark:text-dark-text mb-4">
              Stock Screener
            </h1>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-muted-foreground dark:text-dark-muted mb-4">
                <p className="text-lg">🚧 Site Under Construction 🚧</p>
                <p className="mt-2">
                  We're working hard to bring you a powerful stock screening
                  tool. Check back soon!
                </p>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground 
                         rounded-md transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
