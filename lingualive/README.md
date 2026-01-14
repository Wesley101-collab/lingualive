# LinguaLive

Real-time multilingual live captions for classrooms, talks, and meetings.

## Features

### Core
- Real-time speech transcription via Speechmatics
- Live translation to 5 languages (English, Spanish, French, German, Chinese)
- WebSocket-based caption streaming
- Room-based sessions with shareable codes

### AI-Powered
- Smart punctuation & grammar correction
- AI-generated session summaries
- Keyword highlighting (numbers, dates, action words)
- Action item extraction

### User Experience
- QR code sharing for easy room joining
- Dark/Light theme toggle
- Text-to-speech for captions (Listen mode)
- Session history with search
- Export transcripts (TXT)
- Adjustable font sizes
- Auto-scroll toggle

### Accessibility
- Mobile-responsive design
- Keyboard shortcuts
- High contrast support
- Screen reader friendly

## Project Structure

```
/lingualive
  /frontend          # Next.js React application
    /components      # React UI components
    /pages           # Next.js pages/routes
    /pages/api       # API routes (summarize, format-caption, transcribe)
    /hooks           # Custom React hooks
    /styles          # CSS modules
    /utils           # Utilities (constants, highlightKeywords)
  /backend           # Node.js WebSocket server
    /ws              # WebSocket handlers
    /services        # Speechmatics, Translation services
    server.ts        # Entry point
  /shared            # Shared TypeScript types
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

Required keys:
- `SPEECHMATICS_API_KEY` - For real-time transcription
- `GROQ_API_KEY` - For AI features (summarization, smart formatting)

3. Start the backend:
```bash
cd backend && npm start
```

4. Start the frontend:
```bash
cd frontend && npm run dev
```

For network access (mobile testing):
```bash
cd frontend && npm run dev -- -H 0.0.0.0
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/speaker` | Start a live session, share room code |
| `/viewer` | Join a session, view captions |
| `/upload` | Upload audio/video for transcription |
| `/history` | View past sessions |

## Speaker Controls

- **Format** - AI punctuation & grammar correction
- **Highlight** - Color-code keywords
- **Stats** - Session statistics
- **Sound** - Notification sounds
- **Scroll** - Auto-scroll captions

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle microphone |
| `S` | Save session |
| `E` | Export transcript |
| `C` | Clear captions |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPEECHMATICS_API_KEY` | Speechmatics API key | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | Optional |
| `WS_PORT` | WebSocket port (default: 3001) | No |

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, CSS Modules
- **Backend**: Node.js, WebSocket (ws), TypeScript
- **APIs**: Speechmatics (transcription), Groq (AI), LibreTranslate (translation)
