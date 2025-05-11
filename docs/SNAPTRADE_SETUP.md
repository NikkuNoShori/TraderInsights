# SnapTrade Integration Setup Guide

## Current Status

The SnapTrade integration is partially working:
- ✅ Successfully connecting to SnapTrade API
- ✅ Successfully fetching broker list
- ❌ User registration failing with 401 errors

## Understanding the Error

Your SnapTrade API credentials are valid for basic operations like listing brokerages, but are being rejected with a 401 "Invalid clientId provided" error when attempting user operations like registration or login.

This is typically because:

1. Your SnapTrade account has read-only permissions
2. Your account needs to be upgraded to enable user management
3. There could be a clientId mismatch between what you're using and what SnapTrade expects

## Resolution Steps

### 1. Verify Your SnapTrade Credentials

Double-check that the credentials in your `.env` file match exactly what SnapTrade provided:

```env
VITE_SNAPTRADE_CLIENT_ID=your-exact-client-id
VITE_SNAPTRADE_CONSUMER_KEY=your-exact-consumer-key
```

Ensure there are no extra spaces, case differences, or other inconsistencies.

### 2. Upgrade Your SnapTrade API Access

Contact SnapTrade support to upgrade your API credentials to enable:
- User registration
- User login
- Trading operations

You will need to explain that you're getting a 401 Unauthorized error when trying to register users, but can successfully list brokerages.

### 3. Consider Using Demo Credentials

SnapTrade often provides separate demo credentials that have full permissions but operate in a sandbox environment. If you have these, you can use them for development:

```env
VITE_SNAPTRADE_CLIENT_ID=your-demo-client-id
VITE_SNAPTRADE_CONSUMER_KEY=your-demo-consumer-key
```

### 4. Testing Specific Endpoints

You can use the test script to verify which specific operations are authorized with your credentials:

```bash
npm run test:snaptrade
```

This will show exactly which operations work and which fail with your current credentials.

## SnapTrade API Permission Levels

SnapTrade typically offers these permission levels:

1. **Read-Only**: Can only list brokerages and read public data
2. **Basic**: Can register users but not perform trading operations
3. **Trading**: Full permissions including trading operations
4. **Demo/Sandbox**: Full permissions but in a test environment

Your account appears to be at the **Read-Only** level and needs to be upgraded to at least **Basic** to enable user registration. 