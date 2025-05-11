import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ 
  message, 
  className = '',
  variant = 'error'
}: ErrorMessageProps) {
  if (!message) return null;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          bg: 'bg-background border-destructive/30',
          text: 'text-destructive',
          icon: <XCircle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-background border-yellow-500/30',
          text: 'text-yellow-600 dark:text-yellow-500',
          icon: <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0" />
        };
      case 'info':
        return {
          bg: 'bg-background border-blue-500/30',
          text: 'text-blue-600 dark:text-blue-500',
          icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-500 mr-2 flex-shrink-0" />
        };
      default:
        return {
          bg: 'bg-background border-destructive/30',
          text: 'text-destructive',
          icon: <XCircle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
        };
    }
  };
  
  const styles = getVariantStyles();
  
  return (
    <div className={`${styles.bg} p-3 rounded-md text-sm border shadow-sm flex items-center ${className}`}>
      {styles.icon}
      <p className={styles.text}>{message}</p>
    </div>
  );
}

export function ErrorCard({ 
  message, 
  className = '',
  variant = 'error'
}: ErrorMessageProps) {
  if (!message) return null;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          bg: 'bg-background border-destructive/30',
          text: 'text-destructive',
          title: 'Error',
          icon: <XCircle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-background border-yellow-500/30',
          text: 'text-yellow-600 dark:text-yellow-500',
          title: 'Warning',
          icon: <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0" />
        };
      case 'info':
        return {
          bg: 'bg-background border-blue-500/30',
          text: 'text-blue-600 dark:text-blue-500',
          title: 'Information',
          icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-500 mr-2 flex-shrink-0" />
        };
      default:
        return {
          bg: 'bg-background border-destructive/30',
          text: 'text-destructive',
          title: 'Error',
          icon: <XCircle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
        };
    }
  };
  
  const styles = getVariantStyles();
  
  return (
    <div className={`${styles.bg} p-4 rounded-md text-sm border shadow-sm ${className}`}>
      <div className="flex items-center mb-1">
        {styles.icon}
        <h4 className={`font-medium ${styles.text}`}>{styles.title}</h4>
      </div>
      <p className={`${styles.text}/90 ml-6`}>{message}</p>
    </div>
  );
} 