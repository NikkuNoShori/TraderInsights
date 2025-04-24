# SnapTrade Authentication Flow

## Overview
This document outlines the authentication flow between our application and SnapTrade's API. The flow involves user registration, broker portal access, and session management.

## Flow Steps

1. **User Registration**
   - Application sends `clientId` and `consumerKey` to SnapTrade
   - SnapTrade registers the user and returns a `userSecret`
   - The `userSecret` is a one-time generated credential required for subsequent API calls

2. **Broker Portal Access**
   - Application uses the `userSecret` to request a broker portal URL
   - SnapTrade returns:
     - A `redirectUrl` for the broker login page
     - A `sessionId` for tracking the authentication session

3. **Broker Authentication**
   - User is redirected to the provided `redirectUrl`
   - User enters their broker credentials on SnapTrade's portal
   - After successful authentication, user is redirected back to our application

4. **Session Management**
   - The `sessionId` is stored for tracking the authenticated session
   - This session can be used for subsequent API calls to access broker data

## Implementation Notes
- `userSecret` is generated once per user and should be securely stored
- `sessionId` is generated per authentication attempt
- The redirect flow maintains security by handling sensitive credentials through SnapTrade's portal
- No direct broker credentials are stored in our application

## Security Considerations
- `userSecret` should be treated as a sensitive credential
- `sessionId` should be validated and managed securely
- All redirect URLs should be validated to prevent open redirect vulnerabilities
- HTTPS should be enforced for all communications 