// Jest setup file
import 'jest';

// Global test configuration
beforeEach(() => {
    // Reset any global state before each test
    jest.clearAllMocks();
});

// Custom matchers or global test utilities can be added here
declare global {
    namespace jest {
        interface Matchers<R> {
            // Add custom matcher types if needed
        }
    }
}