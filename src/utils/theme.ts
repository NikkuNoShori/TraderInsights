export const getThemeClass = (baseClass: string, theme: string): string => {
  const themeClasses = {
    dark: {
      background: "bg-dark-100",
      text: "text-gray-200",
      border: "border-dark-300",
      hover: "hover:bg-dark-200",
    },
    light: {
      background: "bg-white",
      text: "text-gray-800",
      border: "border-gray-200",
      hover: "hover:bg-gray-50",
    },
  };

  return `${baseClass} ${themeClasses[theme as keyof typeof themeClasses]?.background || themeClasses.dark.background}`;
};
