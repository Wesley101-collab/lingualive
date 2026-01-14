interface TimestampedCaption {
  text: string;
  timestamp: Date;
  speaker?: string;
}

// Export to SRT format (for video subtitles)
export function exportToSRT(captions: TimestampedCaption[]): string {
  return captions.map((caption, index) => {
    const startTime = formatSRTTime(caption.timestamp);
    const endTime = formatSRTTime(new Date(caption.timestamp.getTime() + 3000)); // 3 second duration
    
    return `${index + 1}
${startTime} --> ${endTime}
${caption.text}
`;
  }).join('\n');
}

// Export to VTT format (WebVTT for web video)
export function exportToVTT(captions: TimestampedCaption[]): string {
  const header = 'WEBVTT\n\n';
  const content = captions.map((caption, index) => {
    const startTime = formatVTTTime(caption.timestamp);
    const endTime = formatVTTTime(new Date(caption.timestamp.getTime() + 3000));
    
    return `${index + 1}
${startTime} --> ${endTime}
${caption.text}
`;
  }).join('\n');
  
  return header + content;
}

// Export to plain text with timestamps
export function exportToText(captions: TimestampedCaption[], includeTimestamps = true): string {
  return captions.map((caption) => {
    const time = caption.timestamp.toLocaleTimeString();
    const speaker = caption.speaker ? `[${caption.speaker}] ` : '';
    return includeTimestamps 
      ? `[${time}] ${speaker}${caption.text}`
      : `${speaker}${caption.text}`;
  }).join('\n\n');
}

// Export to JSON
export function exportToJSON(captions: TimestampedCaption[]): string {
  return JSON.stringify(captions.map(c => ({
    text: c.text,
    timestamp: c.timestamp.toISOString(),
    speaker: c.speaker,
  })), null, 2);
}

// Helper functions
function formatSRTTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${ms}`;
}

function formatVTTTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
