# 🚀 LinguaLive Quick Start Guide

Get up and running in **5 minutes**!

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm 9+** - Comes with Node.js
- **Speechmatics API Key** - [Get free trial](https://www.speechmatics.com/)
- **Groq API Key** - [Sign up free](https://console.groq.com/)

## Installation

### Option 1: Automated Setup (Easiest) ⭐

```bash
# 1. Clone the repository
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# 2. Run setup wizard
npm run setup
```

The wizard will:
- ✅ Check your Node.js version
- ✅ Install all dependencies
- ✅ Ask for your API keys
- ✅ Create configuration files
- ✅ Start the application

**That's it!** Open http://localhost:3000

---

### Option 2: Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Create .env file in project root
cat > .env << EOF
SPEECHMATICS_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
WS_PORT=3001
NODE_ENV=development
EOF

# 4. Create frontend/.env.local
cat > frontend/.env.local << EOF
GROQ_API_KEY=your_key_here
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF

# 5. Start backend (Terminal 1)
cd backend
npm start

# 6. Start frontend (Terminal 2)
cd frontend
npm run dev

# 7. Open browser
# http://localhost:3000
```

---

## First Steps

### 1. Test as Speaker

1. Go to http://localhost:3000/speaker
2. Click the microphone button
3. Allow microphone access
4. Start speaking
5. See captions appear in real-time!

### 2. Test as Viewer

1. Open a new browser tab/window
2. Go to http://localhost:3000/viewer
3. Enter the room code from speaker page
4. Select a language (try Spanish!)
5. See translated captions

### 3. Test AI Features

1. Go to http://localhost:3000/upload
2. Paste some text:
   ```
   hello world this is a test we need to finish the project by friday
   ```
3. Click "Analyze with AI"
4. See summary, key points, and action items!

---

## Mobile Testing

Want to test on your phone?

```bash
# 1. Find your computer's IP address
# Windows: ipconfig
# Mac: ifconfig | grep "inet "
# Linux: hostname -I

# 2. Update frontend/.env.local
NEXT_PUBLIC_WS_URL=ws://YOUR_IP:3001

# 3. Restart frontend with network access
cd frontend
npm run dev -- -H 0.0.0.0

# 4. On your phone, open:
# http://YOUR_IP:3000
```

---

## Troubleshooting

### "Cannot find module"
```bash
# Delete node_modules and reinstall
rm -rf backend/node_modules frontend/node_modules
cd backend && npm install
cd ../frontend && npm install
```

### "Port already in use"
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### "No captions appearing"
- Check microphone permissions in browser
- Verify Speechmatics API key is correct
- Check browser console (F12) for errors
- Make sure backend is running

### "AI features not working"
- Verify Groq API key in BOTH .env files
- Restart frontend server after adding key
- Test API: `curl -X POST http://localhost:3000/api/format-caption -H "Content-Type: application/json" -d '{"text": "hello"}'`

---

## Next Steps

- 📖 Read the [full README](README.md)
- 🎥 Watch the [demo video](docs/DEMO.md)
- 📚 Explore [all features](FEATURES.md)
- 🚀 Deploy to [production](docs/DEPLOYMENT.md)

---

## Need Help?

- 🐛 [Report a bug](https://github.com/Wesley101-collab/lingualive/issues)
- 💬 [Ask a question](https://github.com/Wesley101-collab/lingualive/discussions)
- 📧 Email: support@lingualive.dev

---

**Enjoy using LinguaLive!** 🎉
