import type { NextApiRequest, NextApiResponse } from 'next';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Cache for recent corrections to avoid re-processing
const correctionCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

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

// Local punctuation rules as fallback
function localFormat(text: string): string {
  let result = text.trim();
  
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  // Add period if no ending punctuation
  if (!/[.!?]$/.test(result)) {
    result += '.';
  }
  
  // Fix common speech-to-text issues
  const fixes: [RegExp, string][] = [
    [/\bi\b/g, 'I'],
    [/\bi'm\b/gi, "I'm"],
    [/\bi've\b/gi, "I've"],
    [/\bi'll\b/gi, "I'll"],
    [/\bi'd\b/gi, "I'd"],
    [/\bim\b/g, "I'm"],
    [/\bdont\b/gi, "don't"],
    [/\bwont\b/gi, "won't"],
    [/\bcant\b/gi, "can't"],
    [/\bwouldnt\b/gi, "wouldn't"],
    [/\bcouldnt\b/gi, "couldn't"],
    [/\bshouldnt\b/gi, "shouldn't"],
    [/\bdidnt\b/gi, "didn't"],
    [/\bisnt\b/gi, "isn't"],
    [/\barent\b/gi, "aren't"],
    [/\bwasnt\b/gi, "wasn't"],
    [/\bwerent\b/gi, "weren't"],
    [/\bhasnt\b/gi, "hasn't"],
    [/\bhavent\b/gi, "haven't"],
    [/\bhadnt\b/gi, "hadn't"],
    [/\bthats\b/gi, "that's"],
    [/\bwhats\b/gi, "what's"],
    [/\bheres\b/gi, "here's"],
    [/\btheres\b/gi, "there's"],
    [/\bits\b(?!\s+(?:own|self))/gi, "it's"], // "its" -> "it's" except before "own" or "self"
    [/\blets\b/gi, "let's"],
    [/\byoure\b/gi, "you're"],
    [/\btheyre\b/gi, "they're"],
    [/\bwere\b(?=\s+(?:going|doing|talking|working|looking|trying))/gi, "we're"],
    [/\bgonna\b/gi, "going to"],
    [/\bwanna\b/gi, "want to"],
    [/\bgotta\b/gi, "got to"],
    [/\bkinda\b/gi, "kind of"],
    [/\bsorta\b/gi, "sort of"],
    [/\bdunno\b/gi, "don't know"],
    [/\bcuz\b/gi, "because"],
    [/\bcause\b(?!\s)/gi, "because"],
    [/\bok\b/gi, "okay"],
    [/\bu\b/g, "you"],
    [/\bur\b/g, "your"],
    [/\br\b/g, "are"],
    [/\bn\b/g, "and"],
    [/\bw\b/g, "with"],
    // Fix spacing around punctuation
    [/\s+([.,!?;:])/g, '$1'],
    [/([.,!?;:])(?=[A-Za-z])/g, '$1 '],
    // Fix multiple spaces
    [/\s{2,}/g, ' '],
  ];
  
  for (const [pattern, replacement] of fixes) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

async function formatWithGroq(text: string): Promise<string | null> {
  if (!GROQ_API_KEY) return null;
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast model for real-time
        messages: [
          { 
            role: 'system', 
            content: `You are a caption formatter. Fix grammar, add punctuation, and correct common speech-to-text errors. Keep the meaning exactly the same. Return ONLY the corrected text, nothing else. Be fast and concise.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) return null;

    const data: GroqResponse = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();
    
    // Validate result isn't too different (AI hallucination check)
    if (result && result.length < text.length * 3 && result.length > text.length * 0.3) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, useAI = true } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  const trimmed = text.trim();
  if (trimmed.length < 2) {
    return res.status(200).json({ formatted: trimmed, source: 'passthrough' });
  }

  // Check cache first
  if (correctionCache.has(trimmed)) {
    return res.status(200).json({ 
      formatted: correctionCache.get(trimmed), 
      source: 'cache' 
    });
  }

  let formatted: string;
  let source: string;

  if (useAI) {
    const aiResult = await formatWithGroq(trimmed);
    if (aiResult) {
      formatted = aiResult;
      source = 'ai';
    } else {
      formatted = localFormat(trimmed);
      source = 'local';
    }
  } else {
    formatted = localFormat(trimmed);
    source = 'local';
  }

  // Update cache
  if (correctionCache.size >= MAX_CACHE_SIZE) {
    const firstKey = correctionCache.keys().next().value;
    if (firstKey) correctionCache.delete(firstKey);
  }
  correctionCache.set(trimmed, formatted);

  res.status(200).json({ formatted, source });
}
