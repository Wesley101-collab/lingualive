import { highlightKeywords } from '../../utils/highlightKeywords';

describe('highlightKeywords', () => {
  describe('number highlighting', () => {
    it('should highlight standalone numbers', () => {
      const result = highlightKeywords('There are 5 items');
      expect(result).toContain('<span');
      expect(result).toContain('5');
    });

    it('should highlight decimal numbers', () => {
      const result = highlightKeywords('The price is 19.99 dollars');
      expect(result).toContain('19.99');
    });

    it('should highlight percentages', () => {
      const result = highlightKeywords('Growth of 25%');
      expect(result).toContain('25%');
    });

    it('should highlight currency amounts', () => {
      const result = highlightKeywords('Cost is $100');
      expect(result).toContain('$100');
    });
  });

  describe('date highlighting', () => {
    it('should highlight month names', () => {
      const result = highlightKeywords('Meeting in January');
      expect(result).toContain('January');
      expect(result).toContain('<span');
    });

    it('should highlight day names', () => {
      const result = highlightKeywords('See you Monday');
      expect(result).toContain('Monday');
    });

    it('should highlight time references', () => {
      const result = highlightKeywords('Due tomorrow');
      expect(result).toContain('tomorrow');
    });
  });

  describe('action word highlighting', () => {
    it('should highlight important action words', () => {
      const result = highlightKeywords('Please remember to submit');
      expect(result).toContain('remember');
    });

    it('should highlight deadline words', () => {
      const result = highlightKeywords('The deadline is Friday');
      expect(result).toContain('deadline');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = highlightKeywords('');
      expect(result).toBe('');
    });

    it('should handle text with no keywords', () => {
      const result = highlightKeywords('Hello world');
      expect(result).toBe('Hello world');
    });

    it('should handle multiple keywords', () => {
      const result = highlightKeywords('Meeting on Monday at 3pm costs $50');
      expect(result).toContain('Monday');
      expect(result).toContain('3');
      expect(result).toContain('$50');
    });

    it('should preserve original text structure', () => {
      const result = highlightKeywords('Test 123 test');
      expect(result).toContain('Test');
      expect(result).toContain('test');
    });
  });
});
