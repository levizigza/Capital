import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Filter, Heart, Play, Users, Star, TrendingUp, Clock, Award } from '@/lib/lucide';
import { motion } from 'framer-motion';

interface CommunityGamesHubProps {
  onExit: () => void;
  userProfile: any;
  onPlayGame: (game: CommunityGame) => void;
}

interface CommunityGame {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorId: string;
  creatorAvatar: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  tags: string[];
  likes: number;
  plays: number;
  rating: number;
  createdAt: Date;
  featured: boolean;
  isNew: boolean;
}

// Mock community games data
const mockCommunityGames: CommunityGame[] = [
  {
    id: 'game-1',
    title: 'Super Saver Adventure',
    description: 'Help Max save money for his dream bike! Collect coins and avoid shopping monsters.',
    creatorName: 'AlexBuilder',
    creatorId: 'user-123',
    creatorAvatar: '🧑‍💻',
    thumbnail: '/game-thumbnails/super-saver.png',
    category: 'savings',
    difficulty: 'easy',
    tags: ['savings', 'adventure', 'fun'],
    likes: 142,
    plays: 1250,
    rating: 4.7,
    createdAt: new Date('2024-01-15'),
    featured: true,
    isNew: false
  },
  {
    id: 'game-2',
    title: 'Investment Island',
    description: 'Build your investment portfolio on a tropical island! Watch your money grow!',
    creatorName: 'MoneyMaker22',
    creatorId: 'user-456',
    creatorAvatar: '💼',
    thumbnail: '/game-thumbnails/investment-island.png',
    category: 'investing',
    difficulty: 'medium',
    tags: ['investing', 'strategy', 'island'],
    likes: 89,
    plays: 780,
    rating: 4.3,
    createdAt: new Date('2024-01-20'),
    featured: false,
    isNew: true
  },
  {
    id: 'game-3',
    title: 'Budget Balancer Pro',
    description: 'The ultimate budgeting challenge! Can you balance your monthly budget?',
    creatorName: 'FinanceWhiz',
    creatorId: 'user-789',
    creatorAvatar: '📊',
    thumbnail: '/game-thumbnails/budget-balancer.png',
    category: 'budgeting',
    difficulty: 'medium',
    tags: ['budgeting', 'math', 'challenge'],
    likes: 156,
    plays: 2340,
    rating: 4.8,
    createdAt: new Date('2024-01-10'),
    featured: true,
    isNew: false
  },
  {
    id: 'game-4',
    title: 'Business Tycoon Junior',
    description: 'Start your own lemonade stand and grow it into a business empire!',
    creatorName: 'YoungCEO',
    creatorId: 'user-101',
    creatorAvatar: '👔',
    thumbnail: '/game-thumbnails/business-tycoon.png',
    category: 'business',
    difficulty: 'hard',
    tags: ['business', 'tycoon', 'strategy'],
    likes: 203,
    plays: 3200,
    rating: 4.9,
    createdAt: new Date('2024-01-05'),
    featured: true,
    isNew: false
  },
  {
    id: 'game-5',
    title: 'Credit Score Quest',
    description: 'Battle the debt monsters and protect your credit score in this epic adventure!',
    creatorName: 'CreditHero',
    creatorId: 'user-202',
    creatorAvatar: '🦸',
    thumbnail: '/game-thumbnails/credit-quest.png',
    category: 'credit',
    difficulty: 'easy',
    tags: ['credit', 'adventure', 'monsters'],
    likes: 67,
    plays: 450,
    rating: 4.1,
    createdAt: new Date('2024-01-25'),
    featured: false,
    isNew: true
  }
];

export default function CommunityGamesHub({ onExit, userProfile, onPlayGame }: CommunityGamesHubProps) {
  const [games, setGames] = useState<CommunityGame[]>(mockCommunityGames);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [likedGames, setLikedGames] = useState<Set<string>>(new Set());
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const categories = ['all', 'savings', 'investing', 'budgeting', 'business', 'credit'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredGames = games
    .filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.plays) - (a.likes + a.plays);
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleLike = (gameId: string) => {
    setLikedGames(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(gameId)) {
        newLiked.delete(gameId);
        setGames(games => games.map(game =>
          game.id === gameId ? { ...game, likes: game.likes - 1 } : game
        ));
      } else {
        newLiked.add(gameId);
        setGames(games => games.map(game =>
          game.id === gameId ? { ...game, likes: game.likes + 1 } : game
        ));
      }
      return newLiked;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                Community Games
              </h1>
              <p className="text-lg text-muted-foreground">
                Play amazing games created by young developers like you!
              </p>
            </div>
            <Button onClick={onExit} variant="outline" className="text-lg px-6 border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games, tags, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Category and Difficulty Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Category:</span>
            </div>
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {category}
              </Button>
            ))}

            <div className="flex items-center gap-2 ml-8">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Difficulty:</span>
            </div>
            {difficulties.map(difficulty => (
              <Button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Games */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Featured Games
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {filteredGames
              .filter(game => game.featured)
              .slice(0, 3)
              .map(game => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => onPlayGame(game)}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-6xl">🎮</div>
                    {game.isNew && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        NEW
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{game.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{game.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-xl">{game.creatorAvatar}</span>
                        <span className="text-gray-700">{game.creatorName}</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {game.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        game.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{game.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{game.plays}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(game.rating)}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayGame(game);
                        }}
                      >
                        Play
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* All Games Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            All Games ({filteredGames.length})
          </h2>

          {filteredGames.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No games found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
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
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map(game => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                  onClick={() => onPlayGame(game)}
                >
                  <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-5xl">🎮</div>
                    {game.isNew && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        NEW
                      </div>
                    )}
                    {game.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ FEATURED
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{game.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{game.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-lg">{game.creatorAvatar}</span>
                        <span className="text-gray-700">{game.creatorName}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(game.id);
                          }}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${likedGames.has(game.id) ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span>{game.likes}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{game.plays}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(game.rating)}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayGame(game);
                        }}
                      >
                        Play
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredGames.length > 9 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="text-lg px-8">
              Load More Games
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}