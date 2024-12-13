import { clsx } from "clsx";

export const cardHoverEffect = clsx(
  "border border-transparent hover:border-primary-500/20 dark:hover:border-primary-400/20",
  "shadow-sm hover:shadow-md transition-all duration-200",
  "hover:scale-[1.02]"
);
