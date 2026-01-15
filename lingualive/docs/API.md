# API Documentation

## Overview

LinguaLive has two types of APIs:
1. **WebSocket API** - Real-time communication for live captions
2. **REST API** - HTTP endpoints for AI features and file processing

## WebSocket API

### Connection

```
ws://localhost:3001?role={speaker|viewer}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role | string | Yes | Either "speaker" or "viewer" |

### Message Format

All messages are JSON with the following base structure:
```typescript
interface WSMessage {
  type: string;
  timestamp?: number;
  [key: string]: unknown;
}
```

### Events

#### SPEAKER_START
Sent by speaker to begin transcription session.

```json
{
  "type": "SPEAKER_START"
}
```

#### SPEAKER_STOP
Sent by speaker to end transcription session.

```json
{
  "type": "SPEAKER_STOP"
}
```

#### AUDIO_DATA
Sent by speaker with audio chunk for transcription.

```json
{
  "type": "AUDIO_DATA",
  "data": "base64_encoded_audio_data"
}
```

**Audio Format:**
- Sample rate: 16000 Hz
- Channels: 1 (mono)
- Format: PCM 16-bit
- Encoding: Base64

#### CAPTION_UPDATE
Received by clients with transcribed/translated text.

```json
{
  "type": "CAPTION_UPDATE",
  "text": "Hello, this is a caption",
  "isFinal": true,
  "language": "en"
}
```

| Field | Type | Description |
|-------|------|-------------|
| text | string | Transcribed/translated text |
| isFinal | boolean | True if final transcript, false if interim |
| language | string | Language code of the caption |

#### LANGUAGE_SELECT
Sent by viewer to select preferred language.

```json
{
  "type": "LANGUAGE_SELECT",
  "language": "es"
}
```

**Supported Languages:**
| Code | Language |
|------|----------|
| en | English |
| es | Spanish |
| fr | French |
| de | German |
| zh | Chinese (Simplified) |

#### CONNECTION_STATUS
Received by clients with connection information.

```json
{
  "type": "CONNECTION_STATUS",
  "viewerCount": 5,
  "speakerConnected": true
}
```

#### ERROR
Received when an error occurs.

```json
{
  "type": "ERROR",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Connection Flow

```
Speaker                    Server                    Viewer
   |                          |                         |
   |-- Connect (role=speaker) |                         |
   |<-- CONNECTION_STATUS ----|                         |
   |                          |                         |
   |                          |<-- Connect (role=viewer)|
   |                          |--- CONNECTION_STATUS -->|
   |<-- CONNECTION_STATUS ----|                         |
   |                          |                         |
   |-- SPEAKER_START -------->|                         |
   |                          |                         |
   |-- AUDIO_DATA ----------->|                         |
   |                          |--- CAPTION_UPDATE ----->|
   |<-- CAPTION_UPDATE -------|                         |
   |                          |                         |
   |-- SPEAKER_STOP --------->|                         |
```

---

## REST API

Base URL: `http://localhost:3000/api`

### POST /api/summarize

Generate AI summary of transcript.

**Request:**
```json
{
  "transcript": "Full transcript text to summarize..."
}
```

**Response:**
```json
{
  "summary": "Brief summary of the content",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "actionItems": [
    "Action item 1",
    "Action item 2"
  ],
  "sentiment": "positive"
}
```

| Field | Type | Description |
|-------|------|-------------|
| summary | string | 2-3 sentence summary |
| keyPoints | string[] | List of key points (max 5) |
| actionItems | string[] | Extracted action items |
| sentiment | string | "positive", "neutral", or "negative" |

**Error Response:**
```json
{
  "error": "Transcript too short for analysis"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid request (missing/short transcript) |
| 405 | Method not allowed |
| 500 | Server error |

---

### POST /api/format-caption

Apply smart punctuation and grammar correction.

**Request:**
```json
{
  "text": "hello how are you doing today",
  "useAI": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to format |
| useAI | boolean | No | Use AI formatting (default: true) |

**Response:**
```json
{
  "formatted": "Hello, how are you doing today?",
  "source": "ai"
}
```

| Field | Type | Description |
|-------|------|-------------|
| formatted | string | Formatted text |
| source | string | "ai", "local", or "cache" |

**Formatting Rules (Local Fallback):**
- Capitalizes first letter
- Adds ending punctuation
- Fixes contractions (dont → don't)
- Expands informal speech (gonna → going to)
- Fixes spacing around punctuation

---

### POST /api/transcribe

Transcribe uploaded audio/video file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (audio/video file)

**Supported Formats:**
- Audio: MP3, WAV, M4A, OGG, FLAC
- Video: MP4, WebM, MOV

**Response:**
```json
{
  "transcript": "Full transcribed text...",
  "duration": 125.5,
  "language": "en"
}
```

| Field | Type | Description |
|-------|------|-------------|
| transcript | string | Full transcribed text |
| duration | number | Audio duration in seconds |
| language | string | Detected language |

**Error Response:**
```json
{
  "error": "Unsupported file format"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid file or format |
| 413 | File too large (max 100MB) |
| 500 | Transcription failed |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| WebSocket connections | 100 per IP |
| /api/summarize | 10 requests/minute |
| /api/format-caption | 60 requests/minute |
| /api/transcribe | 5 requests/minute |

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_ROLE | Invalid WebSocket role parameter |
| CONNECTION_LIMIT | Too many connections |
| RATE_LIMITED | Request rate limit exceeded |
| INVALID_MESSAGE | Malformed WebSocket message |
| TRANSCRIPTION_ERROR | Speech-to-text service error |
| TRANSLATION_ERROR | Translation service error |
| AI_SERVICE_ERROR | AI service unavailable |

## TypeScript Types

```typescript
// Shared types from lingualive/shared/types.ts

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh';

interface CaptionUpdate {
  type: 'CAPTION_UPDATE';
  text: string;
  isFinal: boolean;
  language: LanguageCode;
}

interface ConnectionStatus {
  type: 'CONNECTION_STATUS';
  viewerCount: number;
  speakerConnected: boolean;
}

interface AudioData {
  type: 'AUDIO_DATA';
  data: string; // Base64 encoded
}

interface LanguageSelect {
  type: 'LANGUAGE_SELECT';
  language: LanguageCode;
}
```
