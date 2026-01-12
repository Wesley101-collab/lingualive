# LinguaLive

Real-time multilingual live captions for classrooms, talks, and meetings.

## Features

- Real-time speech transcription via Speechmatics
- Live translation to multiple languages
- WebSocket-based caption streaming
- Accessibility-first UI design
- Mobile-responsive layout

## Project Structure

```
/lingualive
  /frontend          # Next.js React application
    /components      # React UI components (PascalCase)
    /pages           # Next.js pages/routes
    /hooks           # Custom React hooks (useXxx)
    /styles          # Global styles and CSS modules
    /utils           # Frontend utilities
  /backend           # Node.js WebSocket server
    /ws              # WebSocket handlers
    /services        # External API integrations (kebab-case)
    /utils           # Backend utilities
    server.ts        # Entry point
  /shared            # Shared types between frontend/backend
    types.ts
```

## Setup

1. Install dependencies:
```bash
cd lingualive/backend && npm install
cd ../frontend && npm install
```

2. Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

3. Start the backend:
```bash
cd backend && npm run dev
```

4. Start the frontend:
```bash
cd frontend && npm run dev
```

## Environment Variables

- `SPEECHMATICS_API_KEY` - Speechmatics real-time API key
- `TRANSLATION_API_KEY` - Translation service API key
- `WS_PORT` - WebSocket server port (default: 3001)

## Usage

### Speaker View
1. Open http://localhost:3000
2. Click "Start Speaking"
3. Speak into your microphone

### Viewer View
1. Open http://localhost:3000/viewer
2. Select your preferred language
3. Read live captions

## Supported Languages

- English (source)
- Spanish
- French
- German
- Chinese (Simplified)
