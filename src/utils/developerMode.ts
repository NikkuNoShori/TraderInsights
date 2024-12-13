const DEV_MODE_KEY = 'dev_mode_hash';

export const setDeveloperMode = (enabled: boolean) => {
  try {
    if (enabled) {
      const hash = btoa(String(Date.now()));
      // Use both localStorage and sessionStorage for better cross-browser support
      localStorage.setItem(DEV_MODE_KEY, hash);
      sessionStorage.setItem(DEV_MODE_KEY, hash);
    } else {
      localStorage.removeItem(DEV_MODE_KEY);
      sessionStorage.removeItem(DEV_MODE_KEY);
    }
  } catch (error) {
    console.error('Error setting developer mode:', error);
    return false;
  }
};

export const isDeveloperMode = (): boolean => {
  try {
    // Check both storage types
    const localHash = localStorage.getItem(DEV_MODE_KEY);
    const sessionHash = sessionStorage.getItem(DEV_MODE_KEY);
    return !!(localHash || sessionHash);
  } catch (error) {
    console.error('Error checking developer mode:', error);
    return false;
  }
};

export const validateDevModeAccess = (): boolean => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    
    // Add Firefox-specific check
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    if (isFirefox) {
      // Ensure Firefox has the necessary permissions
      return true; // We'll always allow it in Firefox for development
    }

    return true;
  } catch (error) {
    console.error('Error validating developer mode access:', error);
    return false;
  }
};

export const toggleDeveloperMode = (): void => {
  const current = isDeveloperMode();
  localStorage.setItem('developer-mode', (!current).toString());
  console.log('Developer mode toggled:', !current);
  window.location.reload();
};