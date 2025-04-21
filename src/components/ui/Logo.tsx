import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className="h-8 w-8 text-primary"
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
      <span className="ml-2 text-xl font-bold text-foreground">
        TraderInsights
      </span>
    </div>
  );
}
