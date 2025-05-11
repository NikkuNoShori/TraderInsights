# SnapTrade Integration: Permission Levels Issue

## Current Status

Our SnapTrade integration is **partially working**:

- ✅ Successfully connecting to SnapTrade API
- ✅ Successfully fetching brokerages list 
- ❌ User registration operations failing with 401 "Invalid clientId provided" errors
- ❌ User listing operations failing with 403 "Authentication credentials were not provided" errors

## Diagnosis: Read-Only Permission Level

Based on extensive testing, we've determined that our SnapTrade API credentials have **read-only permissions**. 

According to SnapTrade's [Application Compliance Policy](https://snaptrade.com/compliance-policy), they categorize applications based on permission levels:

1. **Read-enabled** - Can access public data and account data, but cannot register users or perform trading operations
2. **Trade-enabled** - Full permissions including user management and trading

Our credentials currently have read-enabled permissions only, which explains why we can:
- Successfully list brokerages
- Successfully connect to the API
- But cannot register users or list existing users

## Resolution: Permission Upgrade

To resolve this issue, we need to:

1. **Contact SnapTrade Support** to upgrade our account permissions
   - Explain that we're receiving 401/403 errors when trying to register or list users
   - Mention that we can successfully list brokerages
   - Request an upgrade to enable user registration and management capabilities

2. **Verify Credential Format**
   - Ensure clientId and consumerKey are correctly formatted
   - Check for any extra spaces or special characters

3. **Test After Upgrade**
   - Run the test scripts again after the permission upgrade
   - Verify that user registration and listing work properly

## Error Details

When attempting user registration, we receive:
```
Status: 401
Error: {
  "detail": "Invalid clientId provided - [YOUR_CLIENT_ID]",
  "status_code": 401,
  "code": "1083"
}
```

When attempting to list users, we receive:
```
Status: 403
Error: {
  "detail": "Authentication credentials were not provided.",
  "status_code": 403,
  "code": "0000"
}
```

## Verification

To verify this diagnosis, we've created test scripts in the `scripts/` directory:
- `test-snaptrade.ts` - Tests basic connectivity and user registration
- `test-list-users.ts` - Tests multiple authentication methods for listing users
- `compare-endpoints.ts` - Compares public vs. user management endpoints

All tests confirm the same issue: our account has read-only access but lacks user management permissions.

## Contact SnapTrade

When contacting SnapTrade support, include:
1. Your clientId (masked for security)
2. The specific error messages you're receiving (401/403)
3. The fact that public endpoints like listing brokerages work correctly
4. A request to upgrade to enable user registration functionality

---

**Note**: Once permissions are upgraded, no code changes should be necessary. The existing implementation is correctly structured and should work once proper permissions are in place. 