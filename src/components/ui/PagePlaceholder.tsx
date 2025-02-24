import { Construction, LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PagePlaceholder({
  title,
  description,
  icon: Icon = Construction,
}: PagePlaceholderProps) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">{description}</p>
    </div>
  );
}
