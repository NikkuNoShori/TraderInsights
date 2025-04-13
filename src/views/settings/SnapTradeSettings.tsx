import React from 'react';
import { SnapTradeTest } from '@/components/test/SnapTradeTest';

export default function SnapTradeSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">SnapTrade Integration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your SnapTrade integration settings and test the connection
        </p>
      </div>

      <div className="border-t border-border dark:border-dark-border pt-6">
        <h3 className="text-md font-medium text-foreground mb-4">Connection Test</h3>
        <SnapTradeTest />
      </div>

      <div className="border-t border-border dark:border-dark-border pt-6">
        <h3 className="text-md font-medium text-foreground mb-2">Current Configuration</h3>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div>
            <span className="text-sm font-medium text-foreground">Client ID: </span>
            <span className="text-sm text-muted-foreground">
              {import.meta.env.VITE_SNAPTRADE_CLIENT_ID || 'Not configured'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">Redirect URI: </span>
            <span className="text-sm text-muted-foreground">
              {import.meta.env.VITE_SNAPTRADE_REDIRECT_URI || window.location.origin + '/broker-callback'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground">Environment: </span>
            <span className="text-sm text-muted-foreground">
              {import.meta.env.MODE}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border dark:border-dark-border pt-6">
        <h3 className="text-md font-medium text-foreground mb-4">Documentation</h3>
        <div className="space-y-2">
          <a
            href="https://docs.snaptrade.com/reference/Authentication/Authentication_registerSnapTradeUser"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline block"
          >
            SnapTrade API Documentation
          </a>
          <a
            href="https://snaptrade.com/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline block"
          >
            Getting Started Guide
          </a>
        </div>
      </div>
    </div>
  );
} 