# WebUll Integration - Troubleshooting Guide

This guide provides solutions for common issues encountered when using the WebUll API integration.

## Common Issues

### Authentication Issues

#### Issue: Login fails with "Invalid credentials"

**Possible causes:**
- Incorrect username or password
- Account is locked or requires additional verification
- MFA code is required but not provided

**Solutions:**
1. Double-check your username and password
2. Check if your account is locked by logging in to the WebUll website
3. If your account has MFA enabled, provide the MFA code in the credentials object:
   ```typescript
   const credentials = {
     username: 'your_username',
     password: 'your_password',
     mfaCode: '123456'
   };
   ```

#### Issue: "Device ID is required" error

**Possible causes:**
- The WebUll API requires a device ID for authentication
- The device ID is not being stored correctly

**Solutions:**
1. Provide a device ID in the credentials object:
   ```typescript
   const credentials = {
     username: 'your_username',
     password: 'your_password',
     deviceId: 'your_device_id'
   };
   ```
2. If using the WebullService, it should generate and store a device ID automatically. Check if the storage adapter is working correctly.

### Storage Issues

#### Issue: "localStorage is not defined" error in Node.js environment

**Possible causes:**
- The code is running in a Node.js environment where `localStorage` is not available
- The storage adapter is not being used correctly

**Solutions:**
1. Make sure you're importing and using the storage adapter:
   ```typescript
   import { StorageHelpers } from '@/lib/webull/storage';
   
   // Use StorageHelpers instead of localStorage directly
   const auth = StorageHelpers.getAuth();
   ```
2. If you're creating a new component that uses the WebUll integration, add environment detection:
   ```typescript
   const [isBrowser, setIsBrowser] = useState(false);
   
   useEffect(() => {
     setIsBrowser(typeof window !== 'undefined');
   }, []);
   
   if (!isBrowser) {
     return <div>This component requires a browser environment</div>;
   }
   ```

#### Issue: Data is not persisting between sessions

**Possible causes:**
- The storage adapter is not saving data correctly
- The data is being cleared unexpectedly

**Solutions:**
1. Check if the storage adapter is being used correctly:
   ```typescript
   // Save data
   StorageHelpers.saveAuth(auth);
   StorageHelpers.saveTrade(trade);
   
   // Retrieve data
   const auth = StorageHelpers.getAuth();
   const trades = StorageHelpers.getTrades();
   ```
2. Check if `clearAllData()` or similar methods are being called unexpectedly

### API Issues

#### Issue: "Failed to fetch" errors

**Possible causes:**
- Network connectivity issues
- CORS issues
- API rate limiting

**Solutions:**
1. Check your network connectivity
2. If testing in a browser, check the browser console for CORS errors
3. If you're making many API calls in a short period, you might be hitting rate limits. Add delays between calls or implement rate limiting in your code.

#### Issue: API returns unexpected data format

**Possible causes:**
- The WebUll API has changed
- The `webull-api-ts` package is outdated

**Solutions:**
1. Check if there's an updated version of the `webull-api-ts` package:
   ```bash
   npm update webull-api-ts
   ```
2. If the issue persists, you might need to modify the client implementation to handle the new data format

### Testing Issues

#### Issue: Tests fail in CI/CD environment

**Possible causes:**
- The CI/CD environment doesn't have access to the WebUll API
- The tests are trying to use `localStorage` in a Node.js environment
- Environment variables for credentials are not set

**Solutions:**
1. Use the `--mock-only` flag to run tests with mock data:
   ```bash
   npm run test:webull -- --mock-only
   ```
2. Make sure the storage adapter is being used correctly
3. Set environment variables for credentials in your CI/CD configuration:
   ```
   WEBULL_USERNAME=your_username
   WEBULL_PASSWORD=your_password
   ```

## Debugging Tips

### Enable Debug Logging

To enable debug logging for the WebUll integration, set the `DEBUG` environment variable:

```bash
# In development
DEBUG=webull:* npm run dev

# For tests
DEBUG=webull:* npm run test:webull
```

### Inspect Network Requests

To inspect the network requests made to the WebUll API:

1. In a browser, open the developer tools (F12) and go to the Network tab
2. Filter requests by "webull" to see only requests to the WebUll API
3. Look for request/response details to identify issues

### Check Storage State

To check the current state of the storage:

```typescript
// In browser console
console.log(localStorage.getItem('webull_auth'));
console.log(localStorage.getItem('webull_trades'));

// In code
console.log(StorageHelpers.getAuth());
console.log(StorageHelpers.getTrades());
```

## Reporting Issues

If you encounter an issue that isn't covered in this guide, please report it with the following information:

1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Error messages (if any)
6. Environment details (browser/Node.js version, OS, etc.)

## Contact

For additional support, please contact the TraderInsights development team. 