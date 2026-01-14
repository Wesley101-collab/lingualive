# Technical Architecture

## Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, CSS Modules
- **Backend**: Node.js, WebSocket (ws library), TypeScript
- **APIs**: 
  - Speechmatics (real-time transcription)
  - Groq/Llama (AI summarization, smart formatting)
  - LibreTranslate (translation)
- **Build Tools**: npm, tsc

## Architecture Overview
```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Speaker   │◄──────────────────►│   Backend   │
│  (Next.js)  │                    │  (Node.js)  │
└─────────────┘                    └──────┬──────┘
                                          │
┌─────────────┐     WebSocket             │
│   Viewer    │◄──────────────────────────┤
│  (Next.js)  │                           │
└─────────────┘                    ┌──────▼──────┐
                                   │ Speechmatics│
                                   │ Translation │
                                   │    Groq     │
                                   └─────────────┘
```

## Development Environment
- Node.js 18+
- npm 9+
- Environment variables in `.env` file
- Backend: `npm start` (port 3001)
- Frontend: `npm run dev` (port 3000)

## Code Standards
- TypeScript strict mode enabled
- React functional components with hooks
- CSS Modules for styling (ComponentName.module.css)
- PascalCase for components, camelCase for functions/variables
- No emojis in UI - use SVG icons instead
- Inline SVG icons preferred over icon libraries

## Testing Strategy

### Unit Testing (Planned)
- Jest for utility functions and hooks
- React Testing Library for component testing
- Target: 70% coverage for utilities

### Integration Testing
- WebSocket connection flow testing
- API endpoint testing with mock responses
- Translation service integration tests

### Manual Testing Checklist
- [ ] Speaker can start/stop recording
- [ ] Captions appear in real-time
- [ ] Viewers receive translated captions
- [ ] Room codes work for joining
- [ ] QR code scanning works on mobile
- [ ] Theme toggle persists
- [ ] Session history saves/loads correctly
- [ ] Export produces valid files

### Browser Testing
- Chrome (primary)
- Firefox
- Safari (iOS)
- Edge

### Tools
- Browser DevTools for WebSocket debugging
- Network tab for API monitoring
- Mobile testing via `npm run dev -- -H 0.0.0.0`
- Lighthouse for performance audits

## Deployment Process
- Git push to main branch
- GitHub repository: Wesley101-collab/lingualive

## Performance Requirements
- Caption latency: <2 seconds
- WebSocket reconnection: automatic with exponential backoff
- Caption history: last 50 captions in memory
- Session storage: localStorage for persistence

## Security Considerations
- API keys stored in environment variables only
- No sensitive data in client-side code
- WebSocket connections validated by role (speaker/viewer)
- Rate limiting on API endpoints
