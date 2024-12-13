import { sleep } from './async';

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;
const MAX_DELAY = 5000;

const isNetworkError = (error: any): boolean => {
  return !!(
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('failed to fetch') ||
    error?.message?.toLowerCase().includes('abort') ||
    error?.message?.toLowerCase().includes('timeout') ||
    error?.code === 20 || // AbortError code
    error?.code === 'ECONNABORTED' ||
    error?.response?.status === 429 // Rate limit
  );
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    onError?: (error: any) => void;
    retryIf?: (error: any) => boolean;
  } = {}
): Promise<T> => {
  const {
    retries = MAX_RETRIES,
    delay = INITIAL_DELAY,
    onError,
    retryIf = isNetworkError
  } = options;

  let lastError: any;
  let attempt = 1;

  while (attempt <= retries) {
    try {
      const result = await operation();
      if (result === null) {
        throw new Error('Operation returned null');
      }
      return result;
    } catch (error) {
      lastError = error;
      
      if (retryIf(error) && attempt < retries) {
        const backoffDelay = Math.min(delay * Math.pow(2, attempt - 1), MAX_DELAY);
        console.debug(`Attempt ${attempt}/${retries} failed, retrying in ${backoffDelay}ms`);
        await sleep(backoffDelay);
        attempt++;
        continue;
      }

      if (onError) {
        onError(error);
      }
      break;
    }
  }
  
  throw lastError;
};