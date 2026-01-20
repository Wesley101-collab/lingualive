# LinguaLive Demo

## Demo Video

A comprehensive demo video is available locally at `lingualive/Lingualive Demo.mp4` (not included in git due to file size).

The demo showcases:

### 1. Speaker Experience
- Starting a live session
- Real-time speech transcription
- Room code sharing (clickable to copy)
- QR code generation for easy mobile access
- AI-powered smart formatting
- Keyword highlighting
- Session controls (Format, Highlight, Stats, Sound, Scroll)
- Export and save functionality
- Clear button to reset captions

### 2. Viewer Experience
- Joining via room code
- Real-time caption display in multiple languages
- Language selection (English, Spanish, French, German, Chinese)
- Font size adjustment
- Auto-scroll toggle
- Keyword highlighting
- High contrast mode
- Fullscreen accessibility mode
- Text-to-speech (Listen mode)
- Export captions
- Clear button to reset view

### 3. AI Features
- **Smart Formatting**: Automatic punctuation and grammar correction
- **AI Summarization**: Generate summaries from transcripts
- **Key Points Extraction**: Identify important topics
- **Action Items**: Extract actionable tasks from conversations

### 4. Upload & Analyze
- Upload audio/video files for transcription
- Paste text for AI analysis
- Generate summaries, key points, and action items
- Export analysis as Markdown

### 5. Session History
- View past sessions
- Search through transcripts
- Generate AI summaries for saved sessions
- Export historical transcripts
- Delete old sessions

## Quick Start Demo

### For Speakers:
1. Navigate to http://localhost:3000/speaker
2. Click the microphone button to start
3. Speak clearly - captions appear in real-time
4. Share the room code with viewers
5. Use controls to customize the experience

### For Viewers:
1. Navigate to http://localhost:3000/viewer
2. Enter the room code from the speaker
3. Select your preferred language
4. Adjust font size and enable features as needed
5. Captions appear automatically

### For Upload & Analysis:
1. Navigate to http://localhost:3000/upload
2. Paste text or upload an audio/video file
3. Click "Analyze with AI"
4. View summary, key points, and action items
5. Export results as Markdown

## Demo Script

A detailed demo script is available at `DEMO_SCRIPT.md` in the root directory, which includes:
- Step-by-step walkthrough
- Feature demonstrations
- Testing scenarios
- Troubleshooting tips

## Network Demo (Mobile Testing)

To demo on mobile devices:

1. **Start servers with network access:**
```bash
# Backend (in lingualive/backend)
npm start

# Frontend (in lingualive/frontend)
npm run dev -- -H 0.0.0.0
```

2. **Find your IP address:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

3. **Access from mobile:**
- Speaker: http://YOUR_IP:3000/speaker
- Viewer: http://YOUR_IP:3000/viewer

4. **Scan QR code:**
- Click QR button on speaker page
- Scan with mobile camera
- Automatically joins the session

## Performance Metrics

Expected performance during demo:

- **Caption Latency**: < 2 seconds from speech to display
- **Translation Speed**: Near real-time (< 1 second)
- **AI Formatting**: < 500ms per caption
- **Concurrent Viewers**: Supports 50+ viewers per room
- **Mobile Responsiveness**: Optimized for all screen sizes

## Demo Tips

### For Best Results:
- Use a good quality microphone
- Speak clearly and at a moderate pace
- Ensure stable internet connection
- Test audio levels before starting
- Use Chrome or Firefox for best compatibility

### Common Demo Scenarios:
1. **Classroom**: Teacher speaks, students view in their language
2. **Conference**: Speaker presents, attendees follow along
3. **Meeting**: Record and analyze for action items
4. **Accessibility**: Deaf/hard-of-hearing users read captions
5. **Language Learning**: View captions in multiple languages

## Troubleshooting Demo Issues

### No captions appearing:
- Check microphone permissions in browser
- Verify Speechmatics API key is configured
- Check browser console for errors
- Ensure backend server is running

### AI features not working:
- Verify Groq API key in both `.env` files
- Check `/api/format-caption` endpoint
- Restart frontend server to load env vars

### Mobile connection issues:
- Ensure firewall allows port 3000 and 3001
- Use correct IP address (not localhost)
- Check that devices are on same network

## Recording Your Own Demo

To record a demo video:

1. Use screen recording software (OBS, QuickTime, etc.)
2. Record at 1080p or higher resolution
3. Include audio narration explaining features
4. Show both speaker and viewer perspectives
5. Demonstrate key features and AI capabilities
6. Keep video under 5 minutes for best engagement

## Demo Feedback

After watching the demo, consider:
- Which features are most impressive?
- What use cases resonate most?
- Are there any confusing aspects?
- What additional features would be valuable?
- How can the UX be improved?

---

For more information, see:
- [README.md](../README.md) - Project overview
- [SETUP.md](../SETUP.md) - Installation guide
- [FEATURES.md](../FEATURES.md) - Complete feature list
- [API.md](API.md) - API documentation
