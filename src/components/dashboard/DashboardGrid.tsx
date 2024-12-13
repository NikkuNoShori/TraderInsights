import React, { useCallback, useRef, useEffect, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard } from '../../contexts/DashboardContext';
import { GRID_CONFIG } from '../../config/dashboardLayouts';
import type { Trade } from '../../types/trade';

interface DashboardGridProps {
  children: React.ReactNode;
  trades: Trade[];
  isEditing: boolean;
}

export function DashboardGrid({ children, isEditing }: DashboardGridProps) {
  const { layouts, updateLayouts } = useDashboard();
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    updateLayouts(newLayout);
  }, [updateLayouts]);

  return (
    <div ref={containerRef} className="dashboard-container">
      <GridLayout
        className={`layout ${isEditing ? 'editing' : ''}`}
        layout={layouts}
        cols={GRID_CONFIG.cols}
        rowHeight={GRID_CONFIG.rowHeight}
        width={width}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        margin={GRID_CONFIG.margin as [number, number]}
        containerPadding={GRID_CONFIG.containerPadding as [number, number]}
        compactType="vertical"
        preventCollision={false}
        resizeHandles={['se']}
        draggableHandle=".card-header"
      >
        {children}
      </GridLayout>
    </div>
  );
} 