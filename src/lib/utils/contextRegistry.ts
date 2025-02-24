/**
 * Registry to prevent duplicate context creation
 * This helps enforce the use of Zustand stores instead of React Context
 */
class ContextRegistry {
  private static instance: ContextRegistry;
  private registeredContexts: Set<string> = new Set();
  private allowedContexts: Set<string> = new Set([
    // Add any explicitly allowed contexts here
    "ThemeContext", // Theme context is allowed as it needs DOM updates
    "DeveloperContext", // Developer context is allowed for development tools
  ]);

  private constructor() {}

  public static getInstance(): ContextRegistry {
    if (!ContextRegistry.instance) {
      ContextRegistry.instance = new ContextRegistry();
    }
    return ContextRegistry.instance;
  }

  /**
   * Register a new context
   * @throws Error if context is already registered or not allowed
   */
  public registerContext(contextName: string): void {
    if (this.registeredContexts.has(contextName)) {
      throw new Error(
        `Duplicate context creation attempted: ${contextName}. Context already exists.`,
      );
    }

    if (!this.allowedContexts.has(contextName)) {
      throw new Error(
        `Context creation blocked: ${contextName}. Please use Zustand stores instead of React Context. ` +
          `If this context is required, add it to the allowedContexts list in contextRegistry.ts`,
      );
    }

    this.registeredContexts.add(contextName);
  }

  /**
   * Unregister a context (useful for testing)
   */
  public unregisterContext(contextName: string): void {
    this.registeredContexts.delete(contextName);
  }

  /**
   * Check if a context is registered
   */
  public isContextRegistered(contextName: string): boolean {
    return this.registeredContexts.has(contextName);
  }

  /**
   * Check if a context is allowed
   */
  public isContextAllowed(contextName: string): boolean {
    return this.allowedContexts.has(contextName);
  }

  /**
   * Add a new allowed context (for testing or dynamic updates)
   */
  public allowContext(contextName: string): void {
    this.allowedContexts.add(contextName);
  }
}

export const contextRegistry = ContextRegistry.getInstance();

/**
 * Decorator to enforce context registration
 * @throws Error if context is already registered or not allowed
 */
export function enforceContextRegistry(contextName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        contextRegistry.registerContext(contextName);
        super(...args);
      }
    };
  };
}

/**
 * Hook to create a context safely
 * @throws Error if context is already registered or not allowed
 */
export function useCreateContext(contextName: string) {
  if (!contextRegistry.isContextAllowed(contextName)) {
    throw new Error(
      `Context creation blocked: ${contextName}. Please use Zustand stores instead of React Context. ` +
        `If this context is required, add it to the allowedContexts list in contextRegistry.ts`,
    );
  }

  if (contextRegistry.isContextRegistered(contextName)) {
    throw new Error(
      `Duplicate context creation attempted: ${contextName}. Context already exists.`,
    );
  }

  contextRegistry.registerContext(contextName);
}
