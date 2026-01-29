<div align="center">

# 🌍 LinguaLive

**Real-time multilingual captions powered by AI**

Break language barriers instantly with live transcription and translation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

[Demo Video](docs/DEMO.md) • [Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation)

</div>

---

## 🎯 What is LinguaLive?

LinguaLive transforms spoken words into **real-time captions** that viewers can read in **5 different languages**. Perfect for:

- 🎓 **Educators** teaching international students
- 🎤 **Conference speakers** reaching global audiences  
- 💼 **Corporate trainers** with multilingual teams
- ♿ **Accessibility** for deaf/hard-of-hearing individuals
- 🎥 **Content creators** generating transcripts

### How It Works

```
Speaker speaks → AI transcribes → Viewers read in their language
     ↓              ↓                      ↓
  English      Real-time AI         Spanish, French,
  Audio        Processing           German, Chinese
```

---

## ✨ Features

### 🚀 Core Capabilities
- **Real-time Transcription** - Sub-2-second latency using Speechmatics
- **5 Languages** - English, Spanish, French, German, Chinese
- **AI-Powered Formatting** - Smart punctuation and grammar correction
- **Room-Based Sessions** - Simple code sharing, no accounts needed
- **QR Code Sharing** - Instant mobile access

### 🤖 AI Features
- **Smart Formatting** - Automatic punctuation and capitalization
- **AI Summarization** - Generate summaries from transcripts
- **Key Points Extraction** - Identify important topics
- **Action Items** - Extract actionable tasks

### 🎨 User Experience
- **Mobile Responsive** - Works on all devices
- **Dark/Light Theme** - Comfortable viewing
- **Text-to-Speech** - Listen to captions
- **Keyword Highlighting** - Important terms stand out
- **Session History** - Save and search past sessions
- **Export Options** - Download transcripts

### ♿ Accessibility
- **High Contrast Mode** - Better visibility
- **Fullscreen Captions** - Distraction-free reading
- **Adjustable Font Size** - Customize text size
- **Keyboard Shortcuts** - Quick actions
- **Screen Reader Friendly** - WCAG 2.1 AA compliant

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# Run the setup script
npm run setup
```

The setup script will:
1. ✅ Check Node.js version
2. ✅ Install all dependencies
3. ✅ Create environment files
4. ✅ Guide you through API key setup
5. ✅ Verify configuration
6. ✅ Start the application

### Option 2: Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Prerequisites

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version (9+ required)
npm --version
```

#### 2. Clone Repository

```bash
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive
```

#### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 4. Get API Keys

**Speechmatics API Key** (Required)
1. Visit https://www.speechmatics.com/
2. Sign up for a free trial
3. Get your API key from the dashboard

**Groq API Key** (Required for AI features)
1. Visit https://console.groq.com/
2. Create an account
3. Generate an API key

#### 5. Configure Environment

**Create `.env` in project root:**
```bash
SPEECHMATICS_API_KEY=your_speechmatics_key_here
GROQ_API_KEY=your_groq_key_here
WS_PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
```

**Create `frontend/.env.local`:**
```bash
GROQ_API_KEY=your_groq_key_here
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

#### 6. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 7. Open Application

Visit http://localhost:3000

</details>

---

## 📱 Mobile Access

To access from mobile devices on your network:

```bash
# 1. Find your IP address
# Windows: ipconfig
# Mac/Linux: ifconfig

# 2. Update frontend/.env.local
NEXT_PUBLIC_WS_URL=ws://YOUR_IP:3001

# 3. Start frontend with network access
cd frontend
npm run dev -- -H 0.0.0.0

# 4. Access from mobile
# http://YOUR_IP:3000
```

---

## 🎮 Usage

### For Speakers

1. Go to http://localhost:3000/speaker
2. Click the microphone button
3. Share the room code with viewers
4. Start speaking - captions appear in real-time

**Controls:**
- **Format** - AI punctuation & grammar
- **Highlight** - Color-code keywords
- **Stats** - Session statistics
- **Clear** - Reset captions
- **Save** - Store to history
- **Export** - Download transcript

### For Viewers

1. Go to http://localhost:3000/viewer
2. Enter the room code
3. Select your language
4. Captions appear automatically

**Controls:**
- **Language** - Choose translation
- **Font Size** - Adjust text size
- **Listen** - Text-to-speech
- **Fullscreen** - Accessibility mode
- **Export** - Download captions

### Upload & Analyze

1. Go to http://localhost:3000/upload
2. Upload audio/video or paste text
3. Click "Analyze with AI"
4. View summary, key points, and action items

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Speaker  │  │  Viewer  │  │  Upload  │  │ History │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└───────┼─────────────┼─────────────┼─────────────┼──────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   WebSocket Server (3001)  │
        │      (Node.js + ws)        │
        └─────────────┬───────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
   ┌────▼────┐              ┌───────▼──────┐
   │Speechma-│              │   Groq AI    │
   │tics RT  │              │  (Llama 3)   │
   │   API   │              │              │
   └─────────┘              └──────────────┘
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](SETUP.md) | Detailed installation instructions |
| [Demo Guide](docs/DEMO.md) | Video walkthrough and scenarios |
| [Features](FEATURES.md) | Complete feature list |
| [API Docs](docs/API.md) | API endpoints and usage |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [Contributing](CONTRIBUTING.md) | How to contribute |

---

## 🎯 Project Structure

```
lingualive/
├── backend/              # Node.js WebSocket server
│   ├── services/        # Speechmatics, Translation
│   ├── ws/              # WebSocket handlers
│   ├── utils/           # Utilities
│   └── server.ts        # Entry point
├── frontend/            # Next.js application
│   ├── components/      # React components
│   ├── pages/           # Routes & API endpoints
│   ├── hooks/           # Custom hooks
│   ├── styles/          # CSS modules
│   └── utils/           # Utilities
├── shared/              # Shared TypeScript types
└── docs/                # Documentation
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `SPEECHMATICS_API_KEY` | Speechmatics RT API key | ✅ Yes |
| `GROQ_API_KEY` | Groq API key for AI | ✅ Yes |
| `WS_PORT` | WebSocket port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |

#### Frontend (`frontend/.env.local`)
| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI | ✅ Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | ✅ Yes |

**⚠️ Important:** Both backend and frontend need the Groq API key!

---

## 🎹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle microphone |
| `S` | Save session |
| `E` | Export transcript |
| `C` | Clear captions |
| `L` | Toggle language selector |
| `F` | Toggle fullscreen |

---

## 🔧 Troubleshooting

### No captions appearing?
```bash
# Check microphone permissions in browser
# Verify Speechmatics API key
# Check browser console (F12) for errors
# Ensure backend is running on port 3001
```

### AI features not working?
```bash
# Verify Groq API key in BOTH .env files
# Restart frontend server after adding key
# Test: curl -X POST http://localhost:3000/api/format-caption \
#   -H "Content-Type: application/json" \
#   -d '{"text": "hello world"}'
# Should return: {"formatted": "Hello world.", "source": "ai"}
```

### Port already in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Mobile not connecting?
```bash
# Ensure devices on same network
# Check firewall allows ports 3000 & 3001
# Use IP address, not localhost
# Update NEXT_PUBLIC_WS_URL with your IP
```

---

## 🚀 Recent Updates

### v1.2.0 (January 2026)
- ✅ Fixed AI features (Groq API integration)
- ✅ Fixed Speechmatics RT API (audio resampling)
- ✅ Added clear button for viewers
- ✅ Room code now clickable to copy
- ✅ Improved mobile responsiveness
- ✅ Added AI summary to history
- ✅ Enhanced documentation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Backend** | Node.js, WebSocket (ws) |
| **Styling** | CSS Modules, Custom Properties |
| **APIs** | Speechmatics, Groq/Llama, LibreTranslate |
| **Build** | npm, TypeScript Compiler |
| **Dev Tools** | Hot Reload, ESLint, Prettier |

---

## 📊 Performance

- **Caption Latency:** < 2 seconds
- **Translation Speed:** Near real-time (< 1s)
- **AI Formatting:** < 500ms per caption
- **Concurrent Viewers:** 50+ per room
- **Mobile Optimized:** Works on all devices

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit with descriptive message
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Speechmatics** - Real-time transcription API
- **Groq** - AI-powered text processing
- **LibreTranslate** - Open-source translation
- **Next.js** - React framework
- **WebSocket** - Real-time communication

---

## 📞 Support

- 📧 Email: support@lingualive.dev
- 🐛 Issues: [GitHub Issues](https://github.com/Wesley101-collab/lingualive/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Wesley101-collab/lingualive/discussions)
- 📖 Docs: [Documentation](docs/)

---

<div align="center">

**Made with ❤️ by Wesley**

[⭐ Star this repo](https://github.com/Wesley101-collab/lingualive) • [🐛 Report Bug](https://github.com/Wesley101-collab/lingualive/issues) • [✨ Request Feature](https://github.com/Wesley101-collab/lingualive/issues)

</div>
