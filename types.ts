export enum Tone {
  CINEMATIC = 'Cinematic',
  FUNNY = 'Funny',
  SERIOUS = 'Serious',
  MYSTERY = 'Mystery'
}

export enum ScriptLength {
  SHORT = 'Short (8-12 lines)',
  MEDIUM = 'Medium (12-15 lines)',
  LONG = 'Long (15-18 lines)'
}

export enum Platform {
  TIKTOK = 'TikTok',
  SHORTS = 'Shorts',
  REELS = 'Reels',
  YOUTUBE = 'YouTube'
}

export interface GenerationOptions {
  tone: Tone;
  length: ScriptLength;
  platform: Platform;
}

export interface ScriptResult {
  title?: string;
  content: string;
}
