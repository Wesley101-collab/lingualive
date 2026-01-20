# LinguaLive

Real-time multilingual live captions for classrooms, talks, and meetings.

## 🎥 Demo

A comprehensive demo video is available locally at `lingualive/Lingualive Demo.mp4` showcasing all features in action.

**Quick Demo:**
1. Speaker starts session → Gets room code
2. Viewers join with code → Select language
3. Real-time captions appear in multiple languages
4. AI features: smart formatting, summaries, action items

See [docs/DEMO.md](docs/DEMO.md) for detailed demo guide and scenarios.

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

### Prerequisites
- Node.js 18+ and npm 9+
- Speechmatics API key (required)
- Groq API key (required for AI features)

### Installation

1. **Install dependencies:**
```bash
cd lingualive/backend && npm install
cd ../frontend && npm install
```

2. **Configure environment variables:**

Create `lingualive/.env`:
```bash
SPEECHMATICS_API_KEY=your_speechmatics_key_here
GROQ_API_KEY=your_groq_key_here
WS_PORT=3001
NODE_ENV=development
```

Create `lingualive/frontend/.env.local`:
```bash
GROQ_API_KEY=your_groq_key_here
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**Important:** The frontend needs its own `.env.local` file with the Groq API key for AI features to work.

3. **Start the backend:**
```bash
cd lingualive/backend
npm start
```

Backend runs on port 3001 (WebSocket server)

4. **Start the frontend:**
```bash
cd lingualive/frontend
npm run dev
```

Frontend runs on http://localhost:3000

**For network access (mobile testing):**
```bash
npm run dev -- -H 0.0.0.0
```

Access from mobile: http://YOUR_IP:3000 (e.g., http://192.168.1.4:3000)

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

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `SPEECHMATICS_API_KEY` | Speechmatics RT API key for transcription | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | Yes |
| `WS_PORT` | WebSocket server port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |

### Frontend (.env.local)
| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI features | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | Yes |

**Note:** Both backend and frontend need the Groq API key for AI features to work properly.

## Recent Updates

### v1.2.0 (January 2026)
- ✅ Fixed AI features (summarization, smart formatting) - requires Groq API key in both `.env` files
- ✅ Fixed clear button in Speaker page - now clears immediately without confirmation
- ✅ Added AI summary to History page sessions
- ✅ Improved mobile responsiveness across all pages
- ✅ Fixed Speechmatics RT API integration with proper audio resampling (48kHz → 16kHz)
- ✅ Speaker now receives own captions in real-time
- ✅ Room code is now clickable to copy with visual feedback
- ✅ Added clear button for viewers

## Documentation

- [Setup Guide](SETUP.md) - Installation and configuration
- [Demo Guide](docs/DEMO.md) - Demo video walkthrough and scenarios
- [Features](FEATURES.md) - Complete feature list
- [API Documentation](docs/API.md) - API endpoints and usage
- [Deployment](docs/DEPLOYMENT.md) - Production deployment guide
- [Contributing](CONTRIBUTING.md) - How to contribute

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, CSS Modules
- **Backend**: Node.js, WebSocket (ws), TypeScript
- **APIs**: Speechmatics (transcription), Groq (AI), LibreTranslate (translation)
