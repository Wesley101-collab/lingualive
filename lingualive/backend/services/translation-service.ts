type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh';

// Simple translation cache to reduce API calls
const translationCache = new Map<string, Map<LanguageCode, string>>();
const CACHE_MAX_SIZE = 1000;

// MyMemory language code mapping
const MYMEMORY_CODES: Record<LanguageCode, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  zh: 'zh-CN',
};

export class TranslationService {
  constructor(_apiKey?: string) {}

  async translate(text: string, targetLang: LanguageCode): Promise<string> {
    if (targetLang === 'en') return text;
    if (!text.trim()) return text;

    // Check cache
    const cached = translationCache.get(text)?.get(targetLang);
    if (cached) return cached;

    try {
      const translated = await this.callTranslationAPI(text, targetLang);
      this.cacheTranslation(text, targetLang, translated);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  private async callTranslationAPI(text: string, targetLang: LanguageCode): Promise<string> {
    try {
      // Using MyMemory free translation API
      const langPair = `en|${MYMEMORY_CODES[targetLang]}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      
      return text;
    } catch (error) {
      console.error('MyMemory API error:', error);
      return text;
    }
  }

  private cacheTranslation(text: string, lang: LanguageCode, translated: string): void {
    if (translationCache.size >= CACHE_MAX_SIZE) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey) translationCache.delete(firstKey);
    }
    
    if (!translationCache.has(text)) {
      translationCache.set(text, new Map());
    }
    translationCache.get(text)!.set(lang, translated);
  }

  async translateBatch(text: string, languages: LanguageCode[]): Promise<Map<LanguageCode, string>> {
    const results = new Map<LanguageCode, string>();
    
    // Translate sequentially to avoid rate limits
    for (const lang of languages) {
      const translated = await this.translate(text, lang);
      results.set(lang, translated);
    }
    
    return results;
  }
}
