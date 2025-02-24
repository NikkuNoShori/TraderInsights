import { useState, useEffect } from "react";

export function useColorBlindMode() {
  const [isColorBlindMode, setIsColorBlindMode] = useState(() => {
    const saved = localStorage.getItem("colorBlindMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isColorBlindMode) {
      document.documentElement.classList.add("color-blind");
    } else {
      document.documentElement.classList.remove("color-blind");
    }
    localStorage.setItem("colorBlindMode", JSON.stringify(isColorBlindMode));
  }, [isColorBlindMode]);

  const toggleColorBlindMode = () =>
    setIsColorBlindMode((prev: boolean) => !prev);

  return { isColorBlindMode, toggleColorBlindMode };
}
