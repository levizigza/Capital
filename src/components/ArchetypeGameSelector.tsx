import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Target, Zap, Heart, Gamepad2, Trophy, Clock,
  Filter, Search, TrendingUp, Award, Brain, Users,
  BookOpen, Rocket, Sparkles, ChevronRight, Play
} from '@/lib/lucide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { UserProfile, GameScore } from '@/App';
import { getRecommendedGames, type GameArchetypeAlignment } from '@/data/gameArchetypes';
import { AgeTier, getAgeTierConfig } from '@/data/ageTierSystem';

interface ArchetypeGameSelectorProps {
  userProfile: UserProfile;
  gameScores: GameScore[];
  onPlayGame: (gameId: string) => void;
  userAge?: number;
}

interface FilteredGame {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimatedTime: number;
  ageTier: AgeTier;
  archetypeAlignment: Record<'navigator' | 'strategist' | 'creator' | 'guardian', number>;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  rating: number;
  plays: number;
  isNew: boolean;
  isFeatured: boolean;
  thumbnail: string;
  completionRate: number;
  userProgress?: {
    bestScore: number;
    timesPlayed: number;
    lastPlayed: Date;
    completed: boolean;
  };
}

// Enhanced game data with archetype alignments
const GAMES_DATABASE: FilteredGame[] = [
  // Navigator-focused games (Visual/Kinesthetic learners)
  {
    id: 'collect-game-2d',
    title: 'Treasure Hunt Collector',
    description: 'Navigate through exciting mazes collecting coins while avoiding obstacles!',
    category: 'savings',
    difficulty: 2,
    estimatedTime: 10,
    ageTier: 'elementary',
    archetypeAlignment: {
      navigator: 0.9,
      strategist: 0.3,
      creator: 0.5,
      guardian: 0.2
    },
    learningObjectives: ['Quick decision making', 'Pattern recognition', 'Hand-eye coordination', 'Saving discipline'],
    prerequisites: [],
    tags: ['adventure', 'collection', 'maze', 'reflexes'],
    rating: 4.7,
    plays: 3420,
    isNew: false,
    isFeatured: true,
    thumbnail: '/games/treasure-hunt.png',
    completionRate: 78
  },
  {
    id: 'coin-catcher-game',
    title: 'Coin Catcher Challenge',
    description: 'Test your reflexes by catching the right coins while avoiding the wrong ones!',
    category: 'budgeting',
    difficulty: 3,
    estimatedTime: 15,
    ageTier: 'elementary',
    archetypeAlignment: {
      navigator: 0.85,
      strategist: 0.4,
      creator: 0.3,
      guardian: 0.3
    },
    learningObjectives: ['Distinguishing needs vs wants', 'Quick financial decisions', 'Priority setting'],
    prerequisites: ['Basic counting skills'],
    tags: ['reflexes', 'prioritization', 'speed', 'choices'],
    rating: 4.5,
    plays: 2180,
    isNew: false,
    isFeatured: false,
    thumbnail: '/games/coin-catcher.png',
    completionRate: 72
  },
  {
    id: 'team-savings-challenge',
    title: 'Team Savings Quest',
    description: 'Work with friends to achieve collective savings goals in multiplayer adventures!',
    category: 'collaborative',
    difficulty: 4,
    estimatedTime: 20,
    ageTier: 'middle-school',
    archetypeAlignment: {
      navigator: 0.8,
      strategist: 0.6,
      creator: 0.4,
      guardian: 0.7
    },
    learningObjectives: ['Team collaboration', 'Shared goal setting', 'Communication', 'Group budgeting'],
    prerequisites: ['Basic savings concepts'],
    tags: ['multiplayer', 'teamwork', 'collaboration', 'social'],
    rating: 4.8,
    plays: 1560,
    isNew: true,
    isFeatured: true,
    thumbnail: '/games/team-savings.png',
    completionRate: 85
  },

  // Strategist-focused games (Reading/Writing learners)
  {
    id: 'budget-balancer-game',
    title: 'Budget Balancer Pro',
    description: 'Master complex budgeting through strategic resource allocation and planning.',
    category: 'budgeting',
    difficulty: 6,
    estimatedTime: 25,
    ageTier: 'middle-school',
    archetypeAlignment: {
      navigator: 0.3,
      strategist: 0.95,
      creator: 0.4,
      guardian: 0.5
    },
    learningObjectives: ['Strategic planning', 'Resource allocation', 'Long-term thinking', 'Data analysis'],
    prerequisites: ['Basic math skills', 'Understanding of income/expenses'],
    tags: ['strategy', 'planning', 'analytics', 'optimization'],
    rating: 4.6,
    plays: 1890,
    isNew: false,
    isFeatured: true,
    thumbnail: '/games/budget-balancer.png',
    completionRate: 68
  },
  {
    id: 'portfolio-optimizer',
    title: 'Investment Portfolio Master',
    description: 'Build and optimize investment portfolios using real market principles.',
    category: 'investing',
    difficulty: 8,
    estimatedTime: 30,
    ageTier: 'high-school',
    archetypeAlignment: {
      navigator: 0.2,
      strategist: 0.9,
      creator: 0.6,
      guardian: 0.4
    },
    learningObjectives: ['Portfolio diversification', 'Risk management', 'Market analysis', 'Long-term planning'],
    prerequisites: ['Basic investment knowledge', 'Understanding of risk/return'],
    tags: ['investing', 'portfolio', 'strategy', 'analysis'],
    rating: 4.9,
    plays: 890,
    isNew: false,
    isFeatured: true,
    thumbnail: '/games/portfolio-optimizer.png',
    completionRate: 61
  },
  {
    id: 'pixel-market-trader',
    title: 'Pixel Market Trader',
    description: 'Trade assets in a retro gaming economy to learn investment principles.',
    category: 'investing',
    difficulty: 7,
    estimatedTime: 25,
    ageTier: 'middle-school',
    archetypeAlignment: {
      navigator: 0.4,
      strategist: 0.85,
      creator: 0.5,
      guardian: 0.3
    },
    learningObjectives: ['Market timing', 'Risk assessment', 'Profit calculation', 'Market psychology'],
    prerequisites: ['Basic game economy understanding'],
    tags: ['trading', 'retro', 'market', 'gaming'],
    rating: 4.7,
    plays: 1240,
    isNew: true,
    isFeatured: true,
    thumbnail: '/games/pixel-market.png',
    completionRate: 74
  },

  // Creator-focused games (Kinesthetic/Visual learners)
  {
    id: 'business-builder-2d',
    title: 'Business Empire Builder',
    description: 'Create and grow your own business empire through strategic decisions!',
    category: 'entrepreneurship',
    difficulty: 6,
    estimatedTime: 20,
    ageTier: 'middle-school',
    archetypeAlignment: {
      navigator: 0.5,
      strategist: 0.6,
      creator: 0.9,
      guardian: 0.4
    },
    learningObjectives: ['Business management', 'Decision making', 'Risk taking', 'Growth strategies'],
    prerequisites: ['Understanding of basic business concepts'],
    tags: ['business', 'strategy', 'growth', 'decisions'],
    rating: 4.8,
    plays: 1670,
    isNew: false,
    isFeatured: true,
    thumbnail: '/games/business-builder.png',
    completionRate: 71
  },
  {
    id: 'habit-builder-game',
    title: 'Financial Habit Simulator',
    description: 'Build positive financial habits through interactive daily choices and consequences.',
    category: 'habits',
    difficulty: 5,
    estimatedTime: 15,
    ageTier: 'elementary',
    archetypeAlignment: {
      navigator: 0.4,
      strategist: 0.5,
      creator: 0.85,
      guardian: 0.7
    },
    learningObjectives: ['Habit formation', 'Consistency', 'Consequences of choices', 'Daily financial practices'],
    prerequisites: ['Basic understanding of routines'],
    tags: ['habits', 'daily', 'consequences', 'practice'],
    rating: 4.6,
    plays: 2130,
    isNew: true,
    isFeatured: false,
    thumbnail: '/games/habit-builder.png',
    completionRate: 83
  },
  {
    id: 'creative-financial-stories',
    title: 'Financial Story Creator',
    description: 'Write and illustrate your own financial stories to share and learn from others.',
    category: 'creative',
    difficulty: 4,
    estimatedTime: 30,
    ageTier: 'middle-school',
    archetypeAlignment: {
      navigator: 0.3,
      strategist: 0.4,
      creator: 0.95,
      guardian: 0.5
    },
    learningObjectives: ['Creative expression', 'Financial storytelling', 'Peer learning', 'Communication'],
    prerequisites: ['Basic writing skills'],
    tags: ['creative', 'storytelling', 'writing', 'sharing'],
    rating: 4.4,
    plays: 780,
    isNew: true,
    isFeatured: false,
    thumbnail: '/games/story-creator.png',
    completionRate: 66
  },

  // Guardian-focused games (Reading/Auditory learners)
  {
    id: 'credit-defender-2d',
    title: 'Credit Score Guardian',
    description: 'Protect and build your credit score through responsible financial decisions.',
    category: 'credit',
    difficulty: 5,
    estimatedTime: 18,
    ageTier: 'high-school',
    archetypeAlignment: {
      navigator: 0.3,
      strategist: 0.6,
      creator: 0.4,
      guardian: 0.9
    },
    learningObjectives: ['Credit management', 'Responsible borrowing', 'Score protection', 'Long-term planning'],
    prerequisites: ['Understanding of credit basics'],
    tags: ['credit', 'responsibility', 'protection', 'planning'],
    rating: 4.7,
    plays: 1450,
    isNew: false,
    isFeatured: true,
    thumbnail: '/games/credit-defender.png',
    completionRate: 79
  },
  {
    id: 'family-budget-planner',
    title: 'Family Budget Planner',
    description: 'Help families plan and manage their budgets through collaborative decision making.',
    category: 'family',
    difficulty: 4,
    estimatedTime: 22,
    ageTier: 'elementary',
    archetypeAlignment: {
      navigator: 0.5,
      strategist: 0.5,
      creator: 0.4,
      guardian: 0.85
    },
    learningObjectives: ['Family budgeting', 'Collaborative planning', 'Needs assessment', 'Resource sharing'],
    prerequisites: ['Understanding of family finances'],
    tags: ['family', 'collaborative', 'planning', 'sharing'],
    rating: 4.5,
    plays: 1980,
    isNew: false,
    isFeatured: false,
    thumbnail: '/games/family-budget.png',
    completionRate: 81
  },
  {
    id: 'emergency-fund-challenge',
    title: 'Emergency Fund Protector',
    description: 'Build and protect emergency funds through careful planning and smart decisions.',
    category: 'savings',
    difficulty: 6,
    estimatedTime: 20,
    ageTier: 'high-school',
    archetypeAlignment: {
      navigator: 0.4,
      strategist: 0.7,
      creator: 0.3,
      guardian: 0.9
    },
    learningObjectives: ['Emergency preparedness', 'Risk management', 'Saving discipline', 'Future planning'],
    prerequisites: ['Understanding of savings goals'],
    tags: ['emergency', 'protection', 'planning', 'security'],
    rating: 4.8,
    plays: 1120,
    isNew: true,
    isFeatured: true,
    thumbnail: '/games/emergency-fund.png',
    completionRate: 77
  }
];

export default function ArchetypeGameSelector({ userProfile, gameScores, onPlayGame, userAge = 10 }: ArchetypeGameSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeTier, setSelectedAgeTier] = useState<AgeTier>(getAgeTierConfig(userAge).id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'newest' | 'rating' | 'popular'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get user's archetype (mock for now, would come from quiz results)
  const userArchetype = 'navigator'; // This would come from quiz results

  // Get recommended games based on archetype
  const recommendedGameIds = useMemo(() => {
    return getRecommendedGames(userArchetype).map(game => game.id);
  }, [userArchetype]);

  // Calculate user progress for each game
  const gamesWithProgress = useMemo(() => {
    return GAMES_DATABASE.map(game => {
      const userGameScores = gameScores.filter(score => score.gameId === game.id);
      const userProgress = userGameScores.length > 0 ? {
        bestScore: Math.max(...userGameScores.map(s => s.score)),
        timesPlayed: userGameScores.length,
        lastPlayed: new Date(Math.max(...userGameScores.map(s => new Date(s.date).getTime()))),
        completed: userGameScores.some(s => s.score >= 80)
      } : undefined;

      return {
        ...game,
        userProgress
      };
    });
  }, [gameScores]);

  // Filter games based on user selections
  const filteredGames = useMemo(() => {
    let filtered = gamesWithProgress.filter(game => {
      const matchesSearch = searchQuery === '' ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAgeTier = game.ageTier === selectedAgeTier;
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' ||
        (selectedDifficulty === 'easy' && game.difficulty <= 3) ||
        (selectedDifficulty === 'medium' && game.difficulty >= 4 && game.difficulty <= 6) ||
        (selectedDifficulty === 'hard' && game.difficulty >= 7);

      return matchesSearch && matchesAgeTier && matchesCategory && matchesDifficulty;
    });

    // Sort games
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recommended':
          const aScore = recommendedGameIds.includes(a.id) ? a.archetypeAlignment[userArchetype] : 0;
          const bScore = recommendedGameIds.includes(b.id) ? b.archetypeAlignment[userArchetype] : 0;
          return bScore - aScore;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.plays - a.plays;
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [gamesWithProgress, searchQuery, selectedAgeTier, selectedCategory, selectedDifficulty, sortBy, recommendedGameIds, userArchetype]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(gamesWithProgress.map(game => game.category))];
    return ['all', ...cats];
  }, [gamesWithProgress]);

  const ageTierConfig = getAgeTierConfig(userAge);

  const getArchetypeMatchScore = (game: FilteredGame) => {
    const alignment = game.archetypeAlignment[userArchetype];
    if (alignment >= 0.8) return { score: alignment, color: 'text-green-600', label: 'Perfect Match' };
    if (alignment >= 0.6) return { score: alignment, color: 'text-yellow-600', label: 'Great Match' };
    if (alignment >= 0.4) return { score: alignment, color: 'text-orange-600', label: 'Good Match' };
    return { score: alignment, color: 'text-gray-600', label: 'Try Something Else' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Gamepad2 className="w-8 h-8 text-purple-600" />
            Your Personalized Game Library
          </h1>
          <p className="text-lg text-gray-600">
            Games specifically selected for your {userArchetype} learning style and age group
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Games</h2>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search games, tags, or concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Age Tier Filter */}
            <div>
              <label htmlFor="age-tier-filter" className="block text-sm font-medium text-gray-700 mb-2">Age Level</label>
              <select
                id="age-tier-filter"
                value={selectedAgeTier}
                onChange={(e) => setSelectedAgeTier(e.target.value as AgeTier)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="elementary">Elementary (6-11)</option>
                <option value="middle-school">Middle School (11-14)</option>
                <option value="high-school">High School (14-18)</option>
                <option value="adult">Adult (18+)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                id="difficulty-filter"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy (1-3)</option>
                <option value="medium">Medium (4-6)</option>
                <option value="hard">Hard (7-10)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="recommended">Recommended for You</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Games</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredGames.length} games
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
              >
                List
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Games Display */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredGames.map((game, idx) => {
                const matchInfo = getArchetypeMatchScore(game);
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/90">
                      {/* Game Header */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl">🎮</div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-2">
                          {game.isFeatured && (
                            <Badge className="bg-yellow-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {game.isNew && (
                            <Badge className="bg-green-500 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Archetype Match */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className={`bg-white/90 ${matchInfo.color}`}>
                            {Math.round(matchInfo.score * 100)}% Match
                          </Badge>
                        </div>
                      </div>

                      {/* Game Content */}
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {game.description}
                        </p>

                        {/* Learning Objectives */}
                        <div className="mb-4">
                          <div className="text-xs font-medium text-gray-700 mb-1">You'll learn:</div>
                          <div className="flex flex-wrap gap-1">
                            {game.learningObjectives.slice(0, 2).map((objective, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {objective}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Game Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {game.estimatedTime}min
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Level {game.difficulty}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {game.rating}
                          </div>
                        </div>

                        {/* User Progress */}
                        {game.userProgress && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Your Progress</span>
                              <span>{game.userProgress.bestScore}%</span>
                            </div>
                            <Progress value={game.userProgress.bestScore} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              Played {game.userProgress.timesPlayed} times
                            </div>
                          </div>
                        )}

                        {/* Play Button */}
                        <Button
                          onClick={() => onPlayGame(game.id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Game
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredGames.map((game, idx) => {
                const matchInfo = getArchetypeMatchScore(game);
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Game Icon */}
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="text-3xl">🎮</div>
                          </div>

                          {/* Game Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-xl text-gray-900 mb-1">
                                  {game.title}
                                </h3>
                                <p className="text-gray-600 mb-2">{game.description}</p>
                              </div>
                              <div className="flex gap-2">
                                {game.isFeatured && (
                                  <Badge className="bg-yellow-500 text-white">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                <Badge variant="outline" className={`bg-white/90 ${matchInfo.color}`}>
                                  {Math.round(matchInfo.score * 100)}% Match
                                </Badge>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {game.tags.map((tag, tagIdx) => (
                                <Badge key={tagIdx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {game.estimatedTime}min
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                Level {game.difficulty}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                {game.rating}
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-purple-500" />
                                {game.completionRate}% complete
                              </div>
                            </div>

                            {/* User Progress */}
                            {game.userProgress && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium">Your Progress</span>
                                  <span>{game.userProgress.bestScore}%</span>
                                </div>
                                <Progress value={game.userProgress.bestScore} className="h-2" />
                              </div>
                            )}
                          </div>

                          {/* Play Button */}
                          <div className="flex-shrink-0">
                            <Button
                              onClick={() => onPlayGame(game.id)}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Play
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}