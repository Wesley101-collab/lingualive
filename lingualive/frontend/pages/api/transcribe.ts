import type { NextApiRequest, NextApiResponse } from 'next';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audio, mimeType, fileName } = req.body;

  if (!audio) {
    return res.status(400).json({ error: 'No audio data provided' });
  }

  try {
    // Decode base64 audio to buffer
    const audioBuffer = Buffer.from(audio, 'base64');
    
    // Determine file extension and content type
    let ext = 'wav';
    let contentType = 'audio/wav';
    if (mimeType?.includes('mp3') || fileName?.endsWith('.mp3')) {
      ext = 'mp3';
      contentType = 'audio/mpeg';
    } else if (mimeType?.includes('mp4') || fileName?.endsWith('.mp4')) {
      ext = 'mp4';
      contentType = 'video/mp4';
    } else if (mimeType?.includes('webm') || fileName?.endsWith('.webm')) {
      ext = 'webm';
      contentType = 'audio/webm';
    } else if (mimeType?.includes('ogg') || fileName?.endsWith('.ogg')) {
      ext = 'ogg';
      contentType = 'audio/ogg';
    } else if (mimeType?.includes('m4a') || fileName?.endsWith('.m4a')) {
      ext = 'm4a';
      contentType = 'audio/m4a';
    } else if (mimeType?.includes('flac') || fileName?.endsWith('.flac')) {
      ext = 'flac';
      contentType = 'audio/flac';
    }

    // Create FormData for Groq Whisper API
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: contentType });
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'text');

    const response = await fetch(GROQ_WHISPER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq Whisper error:', response.status, errorText);
      return res.status(500).json({ 
        error: 'Transcription failed',
        details: errorText
      });
    }

    const transcript = await response.text();

    if (!transcript || transcript.trim().length < 5) {
      return res.status(400).json({ 
        error: 'Could not extract meaningful text from audio. The audio may be too short or unclear.' 
      });
    }

    res.status(200).json({ transcript: transcript.trim() });

  } catch (error) {
    console.error('Transcription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Transcription failed',
      details: errorMessage
    });
  }
}
