import { SUPPORTED_LANGUAGES, WS_EVENTS, getWebSocketUrl } from '../../utils/constants';

describe('constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should have English as default', () => {
      expect(SUPPORTED_LANGUAGES.en).toBe('English');
    });

    it('should have all 5 supported languages', () => {
      expect(Object.keys(SUPPORTED_LANGUAGES)).toHaveLength(5);
      expect(SUPPORTED_LANGUAGES.en).toBeDefined();
      expect(SUPPORTED_LANGUAGES.es).toBeDefined();
      expect(SUPPORTED_LANGUAGES.fr).toBeDefined();
      expect(SUPPORTED_LANGUAGES.de).toBeDefined();
      expect(SUPPORTED_LANGUAGES.zh).toBeDefined();
    });

    it('should have correct language names', () => {
      expect(SUPPORTED_LANGUAGES.es).toBe('Spanish');
      expect(SUPPORTED_LANGUAGES.fr).toBe('French');
      expect(SUPPORTED_LANGUAGES.de).toBe('German');
      expect(SUPPORTED_LANGUAGES.zh).toBe('Chinese');
    });
  });

  describe('WS_EVENTS', () => {
    it('should have all required event types', () => {
      expect(WS_EVENTS.AUDIO_DATA).toBe('AUDIO_DATA');
      expect(WS_EVENTS.CAPTION_UPDATE).toBe('CAPTION_UPDATE');
      expect(WS_EVENTS.LANGUAGE_SELECT).toBe('LANGUAGE_SELECT');
      expect(WS_EVENTS.CONNECTION_STATUS).toBe('CONNECTION_STATUS');
      expect(WS_EVENTS.SPEAKER_START).toBe('SPEAKER_START');
      expect(WS_EVENTS.SPEAKER_STOP).toBe('SPEAKER_STOP');
    });

    it('should use UPPER_SNAKE_CASE naming', () => {
      Object.values(WS_EVENTS).forEach(event => {
        expect(event).toMatch(/^[A-Z_]+$/);
      });
    });
  });

  describe('getWebSocketUrl', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      // @ts-ignore
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should return fallback URL when window is undefined', () => {
      const url = getWebSocketUrl();
      expect(url).toBe('ws://localhost:3001');
    });

    it('should use ws:// for http protocol', () => {
      // @ts-ignore
      global.window = {
        location: {
          protocol: 'http:',
          hostname: 'example.com',
        },
      };
      const url = getWebSocketUrl();
      expect(url).toContain('ws://');
      expect(url).toContain('example.com');
    });

    it('should use wss:// for https protocol', () => {
      // @ts-ignore
      global.window = {
        location: {
          protocol: 'https:',
          hostname: 'example.com',
        },
      };
      const url = getWebSocketUrl();
      expect(url).toContain('wss://');
    });
  });
});
