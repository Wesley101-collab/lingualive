# Contributing to LinguaLive

Thank you for your interest in contributing to LinguaLive! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Setup
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lingualive.git
cd lingualive

# Add upstream remote
git remote add upstream https://github.com/Wesley101-collab/lingualive.git

# Install dependencies
cd lingualive/backend && npm install
cd ../frontend && npm install

# Copy environment files
cp .env.example .env
# Add your API keys to .env
```

### Development Workflow
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests
npm test

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request
```

## Coding Standards

### TypeScript
- Use strict mode
- Provide explicit types (avoid `any`)
- Use interfaces for object shapes
- Add JSDoc comments for public functions

```typescript
/**
 * Formats a caption with proper punctuation
 * @param text - Raw caption text
 * @returns Formatted caption string
 */
function formatCaption(text: string): string {
  // Implementation
}
```

### React Components
- Use functional components with hooks
- Keep components focused and small
- Use CSS Modules for styling
- Add proper accessibility attributes

```tsx
// Good
export function CaptionDisplay({ text, isHighlighted }: CaptionDisplayProps) {
  return (
    <p 
      className={styles.caption}
      role="status"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
```

### CSS
- Use CSS Modules (ComponentName.module.css)
- Use CSS variables for theming
- Mobile-first responsive design
- Follow BEM-like naming in modules

```css
/* Good */
.captionCard {
  background: var(--bg-card);
}

.captionCard_header {
  padding: 1rem;
}

.captionCard_body--highlighted {
  background: var(--primary-light);
}
```

### File Naming
- Components: PascalCase (`LiveCaptionPanel.tsx`)
- Hooks: camelCase with `use` prefix (`useWebSocket.ts`)
- Utils: camelCase (`highlightKeywords.ts`)
- Styles: Match component (`LiveCaptionPanel.module.css`)

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code change that neither fixes nor adds
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(viewer): add high contrast mode
fix(websocket): handle reconnection on network change
docs(api): add WebSocket event documentation
refactor(hooks): extract audio processing logic
```

## Pull Request Process

### Before Submitting
1. Update documentation if needed
2. Add/update tests for changes
3. Ensure all tests pass
4. Run linting and fix issues
5. Rebase on latest main

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility tested

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process
1. Automated checks must pass
2. At least one maintainer review
3. Address all feedback
4. Squash commits if requested

## Testing

### Running Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests
```typescript
// Example test
describe('formatCaption', () => {
  it('should capitalize first letter', () => {
    expect(formatCaption('hello')).toBe('Hello.');
  });

  it('should fix contractions', () => {
    expect(formatCaption('dont worry')).toBe("Don't worry.");
  });
});
```

### Test Coverage Requirements
- Minimum 70% coverage for new code
- Critical paths must have tests
- Edge cases should be covered

## Accessibility Guidelines

All contributions must maintain accessibility:

### Requirements
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Screen reader compatibility
- Color contrast 4.5:1 minimum
- Focus indicators visible

### Testing Accessibility
- Use browser accessibility tools
- Test with keyboard only
- Test with screen reader
- Check color contrast ratios

## Reporting Issues

### Bug Reports
Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Impact on existing features

## Questions?

- Open a GitHub Discussion
- Check existing issues first
- Be specific and provide context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
