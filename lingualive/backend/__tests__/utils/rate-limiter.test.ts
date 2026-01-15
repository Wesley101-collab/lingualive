import { RateLimiter } from '../../utils/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1 second window
      maxRequests: 3,
    });
  });

  describe('isAllowed', () => {
    it('should allow requests under the limit', () => {
      const clientId = 'test-client';
      expect(rateLimiter.isAllowed(clientId)).toBe(true);
      expect(rateLimiter.isAllowed(clientId)).toBe(true);
      expect(rateLimiter.isAllowed(clientId)).toBe(true);
    });

    it('should block requests over the limit', () => {
      const clientId = 'test-client';
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      expect(rateLimiter.isAllowed(clientId)).toBe(false);
    });

    it('should track different clients separately', () => {
      const client1 = 'client-1';
      const client2 = 'client-2';

      // Max out client1
      rateLimiter.isAllowed(client1);
      rateLimiter.isAllowed(client1);
      rateLimiter.isAllowed(client1);
      expect(rateLimiter.isAllowed(client1)).toBe(false);

      // Client2 should still be allowed
      expect(rateLimiter.isAllowed(client2)).toBe(true);
    });

    it('should reset after window expires', async () => {
      const clientId = 'test-client';
      
      // Max out requests
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      expect(rateLimiter.isAllowed(clientId)).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      expect(rateLimiter.isAllowed(clientId)).toBe(true);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return max requests for new client', () => {
      expect(rateLimiter.getRemainingRequests('new-client')).toBe(3);
    });

    it('should decrease with each request', () => {
      const clientId = 'test-client';
      rateLimiter.isAllowed(clientId);
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(2);
      rateLimiter.isAllowed(clientId);
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(1);
    });

    it('should return 0 when limit reached', () => {
      const clientId = 'test-client';
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset a specific client', () => {
      const clientId = 'test-client';
      rateLimiter.isAllowed(clientId);
      rateLimiter.isAllowed(clientId);
      rateLimiter.reset(clientId);
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(3);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const clientId = 'test-client';
      rateLimiter.isAllowed(clientId);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      rateLimiter.cleanup();
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(3);
    });
  });
});
