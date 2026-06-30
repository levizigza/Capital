// Game Moderation and Safety System
// Ensures user-created games are safe and appropriate

interface ModerationResult {
  approved: boolean;
  reason: string;
  issues: string[];
  filteredContent?: string;
}

interface GameContent {
  title: string;
  description: string;
  tags: string[];
  creatorName: string;
}

export class GameModerator {
  private bannedWords: Set<string>;
  private inappropriateContent: RegExp[];

  constructor() {
    // Initialize with safe defaults
    this.bannedWords = new Set([
      // Add any inappropriate words that should be filtered
      // Keeping this empty for now, but structure ready for content moderation
    ]);

    this.inappropriateContent = [
      /\b(hack|cheat|exploit)\b/gi, // Words that might indicate harmful content
      /\b(violence|weapon|dangerous)\b/gi, // Potentially inappropriate themes
    ];
  }

  moderateGame(game: GameContent): ModerationResult {
    const issues: string[] = [];
    let approved = true;

    // Check title
    const titleCheck = this.checkText(game.title, 'title');
    if (!titleCheck.clean) {
      issues.push(...titleCheck.issues);
      approved = false;
    }

    // Check description
    const descCheck = this.checkText(game.description, 'description');
    if (!descCheck.clean) {
      issues.push(...descCheck.issues);
      approved = false;
    }

    // Check tags
    const tagCheck = this.checkText(game.tags.join(' '), 'tags');
    if (!tagCheck.clean) {
      issues.push(...tagCheck.issues);
      approved = false;
    }

    // Additional safety checks
    if (this.isInappropriate(game.title + ' ' + game.description)) {
      issues.push('Content may not be appropriate for all ages');
      approved = false;
    }

    // Length checks (prevent spam/abuse)
    if (game.title.length > 100) {
      issues.push('Title is too long (max 100 characters)');
      approved = false;
    }

    if (game.description.length > 500) {
      issues.push('Description is too long (max 500 characters)');
      approved = false;
    }

    // Creator name check
    const creatorCheck = this.checkText(game.creatorName, 'creator name');
    if (!creatorCheck.clean) {
      issues.push('Creator name contains inappropriate content');
      approved = false;
    }

    return {
      approved,
      reason: approved ? 'Game approved for publication' : 'Game requires review',
      issues,
      filteredContent: approved ? undefined : this.filterContent(game.title + ' ' + game.description)
    };
  }

  private checkText(text: string, context: string): { clean: boolean; issues: string[] } {
    const issues: string[] = [];
    let clean = true;

    // Check for banned words
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (this.bannedWords.has(word)) {
        issues.push(`Inappropriate word found in ${context}: ${word}`);
        clean = false;
      }
    }

    // Check for inappropriate content patterns
    for (const pattern of this.inappropriateContent) {
      if (pattern.test(text)) {
        issues.push(`Potentially inappropriate content in ${context}`);
        clean = false;
      }
    }

    // Check for personal information (simplified)
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    if (emailPattern.test(text)) {
      issues.push(`Personal information (email) found in ${context}`);
      clean = false;
    }

    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    if (phonePattern.test(text)) {
      issues.push(`Personal information (phone) found in ${context}`);
      clean = false;
    }

    return { clean, issues };
  }

  private isInappropriate(text: string): boolean {
    const suspiciousKeywords = [
      'bad', 'stupid', 'hate', 'kill', 'die', 'scary',
      'inappropriate', 'violent', 'dangerous'
    ];

    const lowerText = text.toLowerCase();
    return suspiciousKeywords.some(keyword => lowerText.includes(keyword));
  }

  private filterContent(text: string): string {
    let filtered = text;

    // Replace banned words with asterisks
    this.bannedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });

    return filtered;
  }

  // Safety check for user-provided images or assets
  static validateAsset(asset: string): boolean {
    // In a real implementation, this would scan images for inappropriate content
    // For now, just check file extensions and basic safety
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const extension = asset.toLowerCase().substring(asset.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  }

  // Rate limiting check
  static checkRateLimit(userId: string, action: 'create' | 'publish'): boolean {
    // In a real implementation, this would check against a database
    // For now, just return true (no rate limiting)
    return true;
  }
}

// Content rating system
export class ContentRating {
  static calculateRating(game: {
    difficulty: string;
    category: string;
    contentLength: number;
  }): {
    ageRating: 'E' | 'E10+' | 'T' | 'M';
    educationalValue: number;
    funFactor: number;
  } {
    let ageRating: 'E' | 'E10+' | 'T' | 'M' = 'E';
    let educationalValue = 0;
    let funFactor = 0;

    // Educational value based on category
    switch (game.category) {
      case 'savings':
      case 'budgeting':
      case 'investing':
        educationalValue = 9;
        break;
      case 'business':
      case 'credit':
        educationalValue = 8;
        break;
      default:
        educationalValue = 6;
    }

    // Fun factor based on difficulty and content
    if (game.difficulty === 'easy') {
      funFactor = 8;
      ageRating = 'E';
    } else if (game.difficulty === 'medium') {
      funFactor = 7;
      ageRating = 'E10+';
    } else {
      funFactor = 6;
      ageRating = 'T';
    }

    // Adjust based on content length (longer games might be more complex)
    if (game.contentLength > 500) {
      educationalValue = Math.min(10, educationalValue + 1);
    }

    return { ageRating, educationalValue, funFactor };
  }
}

// Game analytics and community insights
export class GameAnalytics {
  static calculateEngagementScore(game: {
    likes: number;
    plays: number;
    completionRate: number;
    averagePlayTime: number;
  }): number {
    const likeRate = game.plays > 0 ? game.likes / game.plays : 0;
    const completionBonus = game.completionRate > 0.5 ? 2 : game.completionRate > 0.25 ? 1 : 0;
    const timeBonus = game.averagePlayTime > 120 ? 2 : game.averagePlayTime > 60 ? 1 : 0;

    return Math.round((likeRate * 50) + (completionBonus * 25) + (timeBonus * 25));
  }

  static getTrendingGames(games: Array<{
    plays: number;
    likes: number;
    createdAt: Date;
  }>, timeframe: 'day' | 'week' | 'month'): Array<{ game: any; score: number }> {
    const now = new Date();
    const cutoffTime = new Date();

    switch (timeframe) {
      case 'day':
        cutoffTime.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffTime.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffTime.setMonth(now.getMonth() - 1);
        break;
    }

    return games
      .filter(game => game.createdAt > cutoffTime)
      .map(game => ({
        game,
        score: game.plays * 2 + game.likes // Weight plays more heavily
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export default GameModerator;