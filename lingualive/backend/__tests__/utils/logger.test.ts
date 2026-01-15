import { logger } from '../../utils/logger';

describe('logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should log info messages', () => {
      logger.info('Test message');
      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('info');
      expect(output).toContain('Test message');
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
      const output = consoleSpy.warn.mock.calls[0][0];
      expect(output).toContain('warn');
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalled();
      const output = consoleSpy.error.mock.calls[0][0];
      expect(output).toContain('error');
    });
  });

  describe('context', () => {
    it('should include context in log output', () => {
      logger.info('Test', { userId: '123', action: 'login' });
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('userId');
      expect(output).toContain('123');
    });
  });

  describe('child logger', () => {
    it('should create child logger with base context', () => {
      const childLogger = logger.child({ service: 'TestService' });
      childLogger.info('Child message');
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('TestService');
      expect(output).toContain('Child message');
    });

    it('should merge child context with additional context', () => {
      const childLogger = logger.child({ service: 'TestService' });
      childLogger.info('Message', { extra: 'data' });
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('TestService');
      expect(output).toContain('extra');
    });
  });

  describe('JSON format', () => {
    it('should output valid JSON', () => {
      logger.info('Test');
      const output = consoleSpy.log.mock.calls[0][0];
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should include timestamp', () => {
      logger.info('Test');
      const output = JSON.parse(consoleSpy.log.mock.calls[0][0]);
      expect(output.timestamp).toBeDefined();
      expect(new Date(output.timestamp).getTime()).not.toBeNaN();
    });

    it('should include level', () => {
      logger.info('Test');
      const output = JSON.parse(consoleSpy.log.mock.calls[0][0]);
      expect(output.level).toBe('info');
    });

    it('should include message', () => {
      logger.info('Test message');
      const output = JSON.parse(consoleSpy.log.mock.calls[0][0]);
      expect(output.message).toBe('Test message');
    });
  });
});
