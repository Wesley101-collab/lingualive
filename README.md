# 🌐 LinguaLive

Real-time multilingual captioning and translation web app powered by AI.

## Features

- 🎤 **Live Transcription** - Real-time speech-to-text using Speechmatics
- 🌍 **Multi-language Translation** - Translate captions to English, Spanish, French, German, Chinese
- 🎧 **Listen Mode** - Text-to-speech reads captions aloud in your selected language
- 📹 **Video Upload** - Upload audio/video files for transcription (Groq Whisper)
- 🤖 **AI Summaries** - Generate summaries, key points, and action items (Groq Llama)
- 📜 **Session History** - Save and review past transcription sessions
- 📱 **Mobile Friendly** - Works on phones via local network
- 🌙 **Dark Mode** - Modern UI with dark/light theme toggle
- ♿ **Accessibility Mode** - Full-screen captions for better visibility

## Tech Stack

- **Frontend**: Next.js, TypeScript, CSS Modules
- **Backend**: Node.js, WebSocket, TypeScript
- **AI**: Groq (Llama 3.3 70B, Whisper Large V3)
- **Speech**: Speechmatics Real-time API
- **Translation**: MyMemory API (free)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Wesley101-collab/lingualive.git
cd lingualive

# Install backend
cd lingualive/backend
npm install

# Install frontend
cd ../frontend
npm install
