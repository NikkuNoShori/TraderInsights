import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function PageErrorFallback() {
  return (
    <div className="p-8 bg-background">
      <div className="max-w-2xl mx-auto bg-card rounded-lg p-6 border border-error/20">
        <h2 className="text-xl font-semibold text-error mb-2">Page Error</h2>
        <p className="text-text-muted">Failed to load page content</p>
      </div>
    </div>
  );
}

export function CardErrorFallback() {
  return (
    <div className="bg-card rounded-lg p-4 border border-error/20">
      <div className="text-error text-sm">Failed to load card</div>
    </div>
  );
}

export function InputErrorFallback() {
  return (
    <div className="bg-input rounded p-2 border border-error/20">
      <span className="text-error text-xs">Input error</span>
    </div>
  );
}

export function ButtonErrorFallback() {
  return (
    <button 
      disabled 
      className="bg-error/10 text-error rounded px-4 py-2 opacity-50 cursor-not-allowed"
    >
      Error
    </button>
  );
} 