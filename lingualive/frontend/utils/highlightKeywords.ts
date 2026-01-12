// Keyword highlighting utility for captions
// Highlights dates, numbers, and action words

const ACTION_WORDS = [
  'submit', 'deadline', 'important', 'remember', 'note', 'attention',
  'urgent', 'required', 'must', 'please', 'warning', 'caution',
  'complete', 'finish', 'start', 'begin', 'end', 'stop',
  'review', 'check', 'verify', 'confirm', 'update', 'change'
];

const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
  'today', 'tomorrow', 'yesterday'
];

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

export function highlightKeywords(text: string): string {
  if (!text) return text;

  let highlighted = text;

  // Highlight numbers (including dates like "23rd", "1st", times like "3:00")
  highlighted = highlighted.replace(
    /\b(\d{1,2}:\d{2}(?:\s?[ap]m)?|\d+(?:st|nd|rd|th)?|\d+)\b/gi,
    '<mark class="keyword-number">$1</mark>'
  );

  // Highlight days of the week
  const daysPattern = new RegExp(`\\b(${DAYS.join('|')})\\b`, 'gi');
  highlighted = highlighted.replace(
    daysPattern,
    '<mark class="keyword-date">$1</mark>'
  );

  // Highlight months
  const monthsPattern = new RegExp(`\\b(${MONTHS.join('|')})\\b`, 'gi');
  highlighted = highlighted.replace(
    monthsPattern,
    '<mark class="keyword-date">$1</mark>'
  );

  // Highlight action words
  const actionPattern = new RegExp(`\\b(${ACTION_WORDS.join('|')})\\b`, 'gi');
  highlighted = highlighted.replace(
    actionPattern,
    '<mark class="keyword-action">$1</mark>'
  );

  return highlighted;
}

export function stripHighlighting(text: string): string {
  return text.replace(/<\/?mark[^>]*>/g, '');
}
