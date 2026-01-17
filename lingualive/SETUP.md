# LinguaLive Setup Guide

## Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# Backend
cd lingualive/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables
```bash
# In lingualive/.env
SPEECHMATICS_API_KEY=D0sBvcjT5q3TR9W6FQ69ZVQ3DhJ1jG58
GROQ_API_KEY=your_groq_key_here
WS_PORT=3001
NODE_ENV=development
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd lingualive/backend
npm start
# Server running on ws://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd lingualive/frontend
npm run dev
# App running on http://localhost:3000
```

### 4. Test the App
- Open http://localhost:3000
- Click "Live Speaker"
- Click the microphone button to start speaking
- Captions should appear in real-time!

---

## API Keys

### Speechmatics (Required for Live Transcription)
- **Status**: ✅ Configured
- **API Key**: `D0sBvcjT5q3TR9W6FQ69ZVQ3DhJ1jG58`
- **What it does**: Converts speech to text in real-time
- **Docs**: https://docs.speechmatics.com/

### Groq (Optional - AI Features)
- **Status**: Optional (has fallbacks)
- **What it does**: Summarization, smart formatting, transcription
- **Get key**: https://console.groq.com/keys
- **Fallback**: Local algorithms work without key

---

## Features Enabled

### ✅ Live Transcription
- Real-time speech-to-text via Speechmatics
- Supports English (other languages available)
- <2 second latency

### ✅ Multi-language Translation
- Automatic translation to 5 languages
- English, Spanish, French, German, Chinese
- Free API (no key needed)

### ✅ AI Features (with Groq key)
- Session summarization
- Smart punctuation & grammar
- Audio file transcription
- Sentiment analysis

### ✅ Accessibility
- High contrast mode (WCAG AAA)
- Full-screen caption mode
- Keyword highlighting
- Text-to-speech

### ✅ Session Management
- Save sessions to history
- Export as TXT, SRT, JSON
- Search past sessions

---

## Troubleshooting

### "WebSocket connection failed"
1. Check backend is running: `npm start` in `lingualive/backend`
2. Check port 3001 is not blocked
3. Check firewall settings

### "No captions appearing"
1. Check microphone permissions (browser will ask)
2. Check Speechmatics API key in `.env`
3. Check browser console for errors (F12)
4. Check backend logs for connection errors

### "Translation not working"
- Translation uses free API, may be rate-limited
- Fallback to English if translation fails
- No API key needed

### "AI features not working"
- Add Groq API key to `.env`
- Or use local fallbacks (no key needed)
- Check `GROQ_API_KEY` is set correctly

---

## Development

### Run Tests
```bash
# Frontend tests
cd lingualive/frontend
npm test

# Backend tests
cd lingualive/backend
npm test
```

### Build for Production
```bash
# Frontend
cd lingualive/frontend
npm run build
npm start

# Backend
cd lingualive/backend
npm run build
npm start
```

### Code Quality
```bash
# Type checking
cd lingualive/backend
npm run build

cd ../frontend
npm run build
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Components (Speaker, Viewer, History)    │   │
│  │  - Microphone input                             │   │
│  │  - Real-time captions                           │   │
│  │  - Session management                           │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↕ WebSocket                      │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              Node.js Backend (WebSocket)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Connection Manager                             │   │
│  │  - Speaker/Viewer routing                       │   │
│  │  - Language preferences                         │   │
│  │  - Viewer count tracking                        │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↕                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Message Handler                                │   │
│  │  - Audio processing                             │   │
│  │  - Transcript routing                           │   │
│  │  - Translation coordination                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↕                    ↕                    ↕
    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
    │Speechmatics│    │ Translation  │    │    Groq      │
    │  (Speech)  │    │   (5 langs)  │    │  (AI/Groq)   │
    └────────────┘    └──────────────┘    └──────────────┘
```

---

## Deployment

See `lingualive/docs/DEPLOYMENT.md` for:
- Docker deployment
- Vercel + Railway setup
- AWS EC2 configuration
- SSL/TLS setup
- Production monitoring

---

## Support

- **Docs**: See `lingualive/docs/` folder
- **API Reference**: `lingualive/docs/API.md`
- **Contributing**: `lingualive/CONTRIBUTING.md`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## Next Steps

1. ✅ Start the app (see Quick Start above)
2. Test live transcription
3. Try multi-language translation
4. Explore accessibility features
5. Save and export sessions
6. Deploy to production (see DEPLOYMENT.md)
