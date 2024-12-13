import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { Widget } from '../types/stock';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  widgets: Widget[];
  children: React.ReactNode[];
  onLayoutChange: (layout: any) => void;
}

export function WidgetGrid({ widgets, children, onLayoutChange }: WidgetGridProps) {
  const layouts = {
    lg: widgets.map((widget, i) => ({
      i: widget.id,
      x: (i * 4) % 12,
      y: Math.floor(i / 3) * 4,
      w: widget.position.width,
      h: widget.position.height,
      minW: 3,
      minH: 3,
    })),
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      onLayoutChange={(layout) => onLayoutChange(layout)}
      isDraggable
      isResizable
      draggableHandle=".widget-header"
    >
      {children.map((child, i) => (
        <div key={widgets[i].id} className="widget">
          {child}
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}