# LinguaLive

Real-time multilingual captions for classrooms, conferences, and meetings.

**Break language barriers instantly** - Speak in one language, viewers read in theirs.

---

## What is LinguaLive?

A web app that turns your speech into live captions that viewers can read in 5 different languages:
- 🇬🇧 English
- 🇪🇸 Spanish  
- 🇫🇷 French
- 🇩🇪 German
- 🇨🇳 Chinese

Perfect for teachers, speakers, and anyone who needs real-time multilingual captions.

---

## Quick Start (2 Steps)

### Step 1: Get API Keys (Free)

You need 2 free API keys:

**Speechmatics** (for speech-to-text):
1. Go to https://www.speechmatics.com/
2. Sign up for free trial
3. Copy your API key

**Groq** (for AI features):
1. Go to https://console.groq.com/
2. Sign up free
3. Copy your API key

### Step 2: Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# 2. Run the setup wizard
npm run setup
```

The wizard will:
- Install everything automatically
- Ask for your API keys
- Start the app

**That's it!** Open http://localhost:3000

---

## How to Use

### As a Speaker:
1. Go to http://localhost:3000/speaker
2. Click the microphone button
3. Share the room code with viewers
4. Start speaking - captions appear instantly

### As a Viewer:
1. Go to http://localhost:3000/viewer
2. Enter the room code
3. Pick your language
4. Read captions in real-time

---

## Features

### Core
- Real-time speech transcription (< 2 second delay)
- Live translation to 5 languages
- Room codes for easy sharing
- QR codes for mobile access
- Works on phones, tablets, and computers

### AI Features
- Smart punctuation and grammar
- Generate summaries of sessions
- Extract action items automatically
- Highlight important keywords

### Accessibility
- High contrast mode (black & white)
- Fullscreen caption mode
- Adjustable text size
- Text-to-speech (listen to captions)
- Keyboard shortcuts

### Other
- Dark/Light theme
- Save session history
- Export transcripts
- Upload audio/video files for transcription

---

## Manual Installation (If Setup Wizard Fails)

### 1. Install Dependencies

```bash
# Backend
cd lingualive/backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Create Environment Files

**Create `lingualive/.env`:**
```
SPEECHMATICS_API_KEY=your_speechmatics_key_here
GROQ_API_KEY=your_groq_key_here
WS_PORT=3001
NODE_ENV=development
```

**Create `lingualive/frontend/.env.local`:**
```
GROQ_API_KEY=your_groq_key_here
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Start Servers

**Terminal 1 - Backend:**
```bash
cd lingualive/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd lingualive/frontend
npm run dev
```

**Open:** http://localhost:3000

---

## Mobile Access

Want to use it on your phone?

```bash
# 1. Find your computer's IP address
# Windows: Run "ipconfig" in Command Prompt
# Mac: Run "ifconfig" in Terminal
# Look for something like 192.168.1.4

# 2. Update lingualive/frontend/.env.local
NEXT_PUBLIC_WS_URL=ws://YOUR_IP:3001

# 3. Start frontend with network access
cd lingualive/frontend
npm run dev -- -H 0.0.0.0

# 4. On your phone, open:
http://YOUR_IP:3000
```

---

## Troubleshooting

### "No captions appearing"
- Check microphone permissions in browser
- Make sure backend is running (Terminal 1)
- Verify Speechmatics API key is correct

### "AI features not working"
- Make sure Groq API key is in BOTH .env files
- Restart frontend server after adding key

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Can't connect from mobile"
- Make sure phone and computer are on same WiFi
- Check firewall allows ports 3000 and 3001
- Use IP address, not "localhost"

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Node.js, WebSocket
- **APIs:** Speechmatics (transcription), Groq (AI), LibreTranslate (translation)

---

## Project Structure

```
lingualive/
├── backend/          # WebSocket server
│   ├── services/     # Speechmatics, Translation
│   ├── ws/           # WebSocket handlers
│   └── server.ts     # Entry point
├── frontend/         # Next.js app
│   ├── components/   # React components
│   ├── pages/        # Routes
│   └── hooks/        # Custom hooks
└── shared/           # Shared types
```

---

## Documentation

- **Setup Guide:** `lingualive/SETUP.md`
- **Demo Guide:** `lingualive/docs/DEMO.md`
- **Features:** `lingualive/FEATURES.md`
- **API Docs:** `lingualive/docs/API.md`

---

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- Speechmatics API key (free trial available)
- Groq API key (free)

---

## License

MIT License - See LICENSE file

---

## Support

- GitHub Issues: https://github.com/Wesley101-collab/lingualive/issues
- Email: support@lingualive.dev

---

**Built with ❤️ using Kiro AI**
