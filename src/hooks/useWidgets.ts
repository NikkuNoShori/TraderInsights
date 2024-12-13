import { useState } from 'react';
import type { Widget } from '../types/stock';

export function useWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      position: {
        width: 6,
        height: 4
      },
      isMinimized: false
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const toggleMinimize = (id: string) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === id
          ? { ...widget, isMinimized: !widget.isMinimized }
          : widget
      )
    );
  };

  return {
    widgets,
    addWidget,
    removeWidget,
    toggleMinimize
  };
}