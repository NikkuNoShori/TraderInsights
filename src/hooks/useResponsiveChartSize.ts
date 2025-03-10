import { useState, useEffect } from "@/lib/react";
import { useChartStore, ChartSection, ScreenSize } from "@/stores/chartStore";

/**
 * Hook to get responsive chart height that updates on window resize
 *
 * @param section The chart section to get height for
 * @returns The responsive chart height
 */
export function useResponsiveChartSize(section?: ChartSection) {
  const getChartHeight = useChartStore((state) => state.getChartHeight);
  const getCurrentScreenSize = useChartStore(
    (state) => state.getCurrentScreenSize
  );
  const [screenSize, setScreenSize] = useState<ScreenSize>(
    getCurrentScreenSize()
  );
  const [chartHeight, setChartHeight] = useState<number>(
    getChartHeight(section)
  );

  useEffect(() => {
    // Update chart height when screen size changes
    const handleResize = () => {
      const newScreenSize = getCurrentScreenSize();
      if (newScreenSize !== screenSize) {
        setScreenSize(newScreenSize);
        setChartHeight(getChartHeight(section));
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [section, screenSize, getCurrentScreenSize, getChartHeight]);

  return chartHeight;
}
