import "@testing-library/jest-dom";

// Mock environment variables
process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID = "test-client-id";
process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY = "test-consumer-key";
process.env.NEXT_PUBLIC_SNAPTRADE_ENVIRONMENT = "sandbox";
process.env.NEXT_PUBLIC_SNAPTRADE_ENCRYPTION_KEY = "test-encryption-key";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock window.open
window.open = jest.fn();

// Mock fetch
global.fetch = jest.fn();

// Add any other global mocks or setup here
