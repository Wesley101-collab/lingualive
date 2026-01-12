import type { NextApiRequest, NextApiResponse } from 'next';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
  };
}

// Fallback local summarization when API is unavailable
function localSummarize(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const summary = sentences.slice(0, 3).join(' ').trim() || text.slice(0, 300);
  
  const keywordPatterns = ['important', 'key', 'main', 'need', 'should', 'must', 'will', 'plan', 'goal', 'focus', 'priority', 'decision', 'agree'];
  const keyPoints = sentences
    .filter(s => keywordPatterns.some(kw => s.toLowerCase().includes(kw)))
    .slice(0, 5)
    .map(s => s.trim());
  
  if (keyPoints.length === 0) {
    keyPoints.push(...sentences.slice(0, 3).map(s => s.trim()));
  }
  
  const actionPatterns = ['will', 'need to', 'should', 'must', 'going to', 'plan to', 'has to', 'deadline', 'by friday', 'by monday', 'next week', 'tomorrow'];
  const actionItems = sentences
    .filter(s => actionPatterns.some(p => s.toLowerCase().includes(p)))
    .slice(0, 5)
    .map(s => s.trim().replace(/^(and |so |then |also )/i, ''));
  
  const positiveWords = ['good', 'great', 'excellent', 'success', 'happy', 'agree', 'progress', 'achieved', 'wonderful'];
  const negativeWords = ['bad', 'problem', 'issue', 'fail', 'wrong', 'concern', 'worried', 'difficult', 'challenge'];
  
  const lower = text.toLowerCase();
  let sentimentScore = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) sentimentScore++; });
  negativeWords.forEach(w => { if (lower.includes(w)) sentimentScore--; });
  
  const sentiment = sentimentScore > 1 ? 'positive' : sentimentScore < -1 ? 'negative' : 'neutral';
  
  return { summary, keyPoints, actionItems, sentiment };
}

async function generateWithGroq(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      console.error('Groq request failed:', response.status);
      return null;
    }

    const data: GroqResponse = await response.json();
    
    if (data.error) {
      console.error('Groq error:', data.error.message);
      return null;
    }

    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq request failed:', error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  if (transcript.length < 30) {
    return res.status(400).json({ error: 'Transcript too short for analysis' });
  }

  const summaryPrompt = `Analyze this transcript and provide a JSON response with exactly this structure (no markdown, just raw JSON):
{
  "summary": "A concise 2-3 sentence summary of the main points",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "actionItems": ["action item 1", "action item 2"],
  "sentiment": "positive" or "neutral" or "negative"
}

Transcript:
${transcript.slice(0, 3000)}

Return ONLY valid JSON, no other text.`;

  const groqResponse = await generateWithGroq(summaryPrompt);
  
  if (groqResponse) {
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanResponse = groqResponse.trim();
      if (cleanResponse.startsWith('```json')) cleanResponse = cleanResponse.slice(7);
      if (cleanResponse.startsWith('```')) cleanResponse = cleanResponse.slice(3);
      if (cleanResponse.endsWith('```')) cleanResponse = cleanResponse.slice(0, -3);
      
      // Try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        return res.status(200).json({
          summary: result.summary || 'Summary not available',
          keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
          actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
          sentiment: ['positive', 'neutral', 'negative'].includes(result.sentiment) ? result.sentiment : 'neutral',
        });
      }
    } catch (e) {
      console.error('Failed to parse Groq response:', e);
    }
  }

  // Fallback to local summarization
  console.log('Using local summarization (Groq unavailable or response invalid)');
  const localResult = localSummarize(transcript);
  res.status(200).json(localResult);
}
