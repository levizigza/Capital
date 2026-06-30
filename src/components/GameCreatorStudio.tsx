import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play, Share2, Puzzle, Sparkles, Palette, Code, Users } from '@/lib/lucide';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCreatorStudioProps {
  onExit: () => void;
  userProfile: any;
  onGameCreated: (game: CreatedGame) => void;
}

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'savings' | 'investing' | 'budgeting' | 'business';
  difficulty: 'easy' | 'medium' | 'hard';
  previewImage: string;
  blocks: GameBlock[];
}

interface GameBlock {
  id: string;
  type: 'character' | 'obstacle' | 'collectible' | 'ui' | 'logic';
  name: string;
  icon: string;
  description: string;
  category: string;
  properties: Record<string, any>;
  isDraggable: boolean;
}

interface CreatedGame {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorId: string;
  blocks: GameBlock[];
  category: string;
  difficulty: string;
  thumbnail: string;
  likes: number;
  plays: number;
  createdAt: Date;
  isPublic: boolean;
  tags: string[];
}

const gameTemplates: GameTemplate[] = [
  {
    id: 'coin-collector',
    name: 'Coin Collector',
    description: 'Create a fun game where players collect coins while avoiding expenses',
    icon: '🪙',
    category: 'savings',
    difficulty: 'easy',
    previewImage: '/game-previews/coin-collector.png',
    blocks: [
      {
        id: 'player',
        type: 'character',
        name: 'Player Character',
        icon: '🤖',
        description: 'The main character that players control',
        category: 'characters',
        properties: { speed: 5, jumpHeight: 10, color: 'blue' },
        isDraggable: true
      },
      {
        id: 'coin',
        type: 'collectible',
        name: 'Money Coin',
        icon: '💰',
        description: 'Collectible coins that increase score',
        category: 'collectibles',
        properties: { value: 10, sound: 'coin-collect' },
        isDraggable: true
      },
      {
        id: 'expense',
        type: 'obstacle',
        name: 'Expense Monster',
        icon: '👹',
        description: 'Avoid these to protect your money',
        category: 'obstacles',
        properties: { damage: -5, speed: 2 },
        isDraggable: true
      }
    ]
  },
  {
    id: 'budget-builder',
    name: 'Budget Builder',
    description: 'Design a game where players sort expenses and manage budgets',
    icon: '📊',
    category: 'budgeting',
    difficulty: 'medium',
    previewImage: '/game-previews/budget-builder.png',
    blocks: [
      {
        id: 'expense-item',
        type: 'obstacle',
        name: 'Expense Item',
        icon: '🛍️',
        description: 'Items that cost money',
        category: 'budgeting',
        properties: { cost: 25, category: 'shopping' },
        isDraggable: true
      },
      {
        id: 'budget-box',
        type: 'ui',
        name: 'Budget Category',
        icon: '📦',
        description: 'Boxes to sort expenses into',
        category: 'ui',
        properties: { budgetLimit: 100, category: 'entertainment' },
        isDraggable: true
      }
    ]
  },
  {
    id: 'investment-adventure',
    name: 'Investment Adventure',
    description: 'Create an investment journey with risks and rewards',
    icon: '📈',
    category: 'investing',
    difficulty: 'hard',
    previewImage: '/game-previews/investment-adventure.png',
    blocks: [
      {
        id: 'investment',
        type: 'collectible',
        name: 'Investment Opportunity',
        icon: '💎',
        description: 'Investments that can grow over time',
        category: 'investing',
        properties: { risk: 'medium', potentialReturn: 15 },
        isDraggable: true
      },
      {
        id: 'market-event',
        type: 'logic',
        name: 'Market Event',
        icon: '📰',
        description: 'Events that affect your investments',
        category: 'events',
        properties: { impact: 'positive', duration: 10 },
        isDraggable: true
      }
    ]
  }
];

const blockLibrary: GameBlock[] = [
  // Characters
  {
    id: 'hero',
    type: 'character',
    name: 'Hero Character',
    icon: '🦸',
    description: 'Brave hero character for players',
    category: 'characters',
    properties: { speed: 6, jumpPower: 12, health: 100 },
    isDraggable: true
  },
  {
    id: 'robot',
    type: 'character',
    name: 'Money Robot',
    icon: '🤖',
    description: 'Friendly robot that loves finance',
    category: 'characters',
    properties: { speed: 4, jumpPower: 8, battery: 100 },
    isDraggable: true
  },

  // Collectibles
  {
    id: 'gem',
    type: 'collectible',
    name: 'Finance Gem',
    icon: '💎',
    description: 'Valuable gem worth lots of points',
    category: 'collectibles',
    properties: { value: 50, rarity: 'rare' },
    isDraggable: true
  },
  {
    id: 'piggybank',
    type: 'collectible',
    name: 'Piggy Bank',
    icon: '🏦',
    description: 'Save money in piggy banks',
    category: 'collectibles',
    properties: { value: 25, capacity: 100 },
    isDraggable: true
  },

  // Obstacles
  {
    id: 'debt-monster',
    type: 'obstacle',
    name: 'Debt Monster',
    icon: '👾',
    description: 'Monster that takes away your money',
    category: 'obstacles',
    properties: { damage: -10, speed: 3 },
    isDraggable: true
  },
  {
    id: 'inflation-cloud',
    type: 'obstacle',
    name: 'Inflation Cloud',
    icon: '☁️',
    description: 'Cloud that reduces money value',
    category: 'obstacles',
    properties: { effect: 'reduce-value', speed: 1 },
    isDraggable: true
  },

  // UI Elements
  {
    id: 'score-display',
    type: 'ui',
    name: 'Score Display',
    icon: '🎯',
    description: 'Display player score',
    category: 'ui',
    properties: { position: 'top-right', style: 'modern' },
    isDraggable: true
  },
  {
    id: 'timer',
    type: 'ui',
    name: 'Timer',
    icon: '⏱️',
    description: 'Game timer display',
    category: 'ui',
    properties: { duration: 60, position: 'top-center' },
    isDraggable: true
  },

  // Logic Blocks
  {
    id: 'goal',
    type: 'logic',
    name: 'Win Condition',
    icon: '🏁',
    description: 'Define how to win the game',
    category: 'logic',
    properties: { target: 100, type: 'score' },
    isDraggable: true
  },
  {
    id: 'checkpoint',
    type: 'logic',
    name: 'Checkpoint',
    icon: '🚩',
    description: 'Save point in the game',
    category: 'logic',
    properties: { position: 'middle', respawn: true },
    isDraggable: true
  }
];

export default function GameCreatorStudio({ onExit, userProfile, onGameCreated }: GameCreatorStudioProps) {
  const [creatorState, setCreatorState] = useState<'select-template' | 'build' | 'preview' | 'publish'>('select-template');
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [createdGame, setCreatedGame] = useState<CreatedGame | null>(null);
  const [gameCanvas, setGameCanvas] = useState<GameBlock[]>([]);
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<GameBlock | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<GameBlock | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const startFromTemplate = (template: GameTemplate) => {
    setSelectedTemplate(template);
    setGameCanvas([...template.blocks]);
    setCreatorState('build');
  };

  const startFromScratch = () => {
    setSelectedTemplate(null);
    setGameCanvas([]);
    setCreatorState('build');
  };

  const handleBlockDragStart = (block: GameBlock) => {
    setDraggedBlock(block);
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlock || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock = {
      ...draggedBlock,
      id: `${draggedBlock.id}-${Date.now()}`,
      properties: {
        ...draggedBlock.properties,
        x: x,
        y: y
      }
    };

    setGameCanvas(prev => [...prev, newBlock]);
    setDraggedBlock(null);
  };

  const removeBlockFromCanvas = (blockId: string) => {
    setGameCanvas(prev => prev.filter(block => block.id !== blockId));
  };

  const previewGame = () => {
    if (!gameTitle.trim()) {
      alert('Please give your game a title!');
      return;
    }

    const game: CreatedGame = {
      id: `game-${Date.now()}`,
      title: gameTitle,
      description: gameDescription || 'An awesome financial literacy game!',
      creatorName: userProfile.username || 'Young Creator',
      creatorId: userProfile.id,
      blocks: gameCanvas,
      category: selectedTemplate?.category || 'mixed',
      difficulty: selectedTemplate?.difficulty || 'medium',
      thumbnail: '/generated-thumbnail.png',
      likes: 0,
      plays: 0,
      createdAt: new Date(),
      isPublic: false,
      tags: selectedTemplate ? [selectedTemplate.category] : ['custom']
    };

    setCreatedGame(game);
    setCreatorState('preview');
  };

  const publishGame = () => {
    if (!createdGame) return;

    const publishedGame = {
      ...createdGame,
      isPublic: true,
      publishedAt: new Date()
    };

    onGameCreated(publishedGame);
    setCreatorState('publish');
  };

  const renderCreatorInterface = () => {
    if (creatorState === 'select-template') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-8xl mb-4">🎨</div>
              <h1 className="text-5xl font-bold text-foreground mb-4">Game Creator Studio</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Create your own financial literacy games! Choose a template to get started or build from scratch.
                Your games can be shared with friends and the community!
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <Button onClick={startFromScratch} className="game-arcade-btn text-xl px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500">
                <Sparkles className="w-6 h-6 mr-2" />
                Start from Scratch
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {gameTemplates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-all"
                  onClick={() => startFromTemplate(template)}
                >
                  <div className="text-6xl mb-4 text-center">{template.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      template.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">{template.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button onClick={onExit} variant="outline" className="text-lg px-8 border-2">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Exit Creator Studio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (creatorState === 'build') {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="flex gap-4 h-screen">
            {/* Left Sidebar - Block Library */}
            <div className="w-80 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Puzzle className="w-5 h-5 text-blue-500" />
                Game Blocks
              </h3>

              <div className="space-y-4">
                {['Characters', 'Collectibles', 'Obstacles', 'UI Elements', 'Logic'].map(category => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {blockLibrary
                        .filter(block => block.category === category.toLowerCase())
                        .map(block => (
                          <div
                            key={block.id}
                            draggable
                            onDragStart={() => handleBlockDragStart(block)}
                            className="bg-gray-100 rounded-lg p-3 text-center cursor-move hover:bg-gray-200 transition-colors"
                          >
                            <div className="text-2xl mb-1">{block.icon}</div>
                            <div className="text-xs font-medium">{block.name}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center - Game Canvas */}
            <div className="flex-1 flex flex-col">
              {/* Top Bar */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Game Title"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <select className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                      <option>Savings</option>
                      <option>Budgeting</option>
                      <option>Investing</option>
                      <option>Business</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={previewGame} className="bg-blue-500 hover:bg-blue-600">
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button onClick={onExit} variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Exit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Game Canvas */}
              <div
                ref={canvasRef}
                className="flex-1 bg-white rounded-lg shadow-lg relative overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleBlockDrop}
                style={{
                  backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent)',
                  backgroundSize: '50px 50px'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  {gameCanvas.length === 0 && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎮</div>
                      <p className="text-lg">Drag blocks here to start creating!</p>
                    </div>
                  )}
                </div>

                {gameCanvas.map(block => (
                  <div
                    key={block.id}
                    className="absolute cursor-pointer hover:ring-2 hover:ring-blue-400 rounded-lg p-2 bg-white shadow-md"
                    style={{
                      left: `${block.properties.x || 100}px`,
                      top: `${block.properties.y || 100}px`
                    }}
                    onClick={() => setSelectedBlock(block)}
                    onDoubleClick={() => removeBlockFromCanvas(block.id)}
                  >
                    <div className="text-2xl">{block.icon}</div>
                    <div className="text-xs font-medium text-center">{block.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-80 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Properties
              </h3>

              {selectedBlock ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-2xl text-center mb-2">{selectedBlock.icon}</div>
                    <div className="font-semibold text-center">{selectedBlock.name}</div>
                  </div>

                  {Object.entries(selectedBlock.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => {
                          const updatedBlock = {
                            ...selectedBlock,
                            properties: {
                              ...selectedBlock.properties,
                              [key]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
                            }
                          };
                          setSelectedBlock(updatedBlock);
                          setGameCanvas(prev => prev.map(block =>
                            block.id === updatedBlock.id ? updatedBlock : block
                          ));
                        }}
                        className="px-3 py-1 border rounded text-sm w-32"
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Double-click block to remove it</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Select a block to edit its properties</p>
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-500" />
                  Quick Tips
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Drag blocks from the left panel</li>
                  <li>• Click blocks to select and edit properties</li>
                  <li>• Double-click to remove blocks</li>
                  <li>• Preview your game anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (creatorState === 'preview' && createdGame) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Game Preview</h2>

              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-2xl font-bold mb-2">{createdGame.title}</h3>
                  <p className="text-gray-600 mb-4">{createdGame.description}</p>
                </div>

                <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
                  <p className="text-gray-500">
                    🚧 Game Preview Coming Soon! 🚧<br/>
                    Your game would play here with all the blocks you've placed.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={() => setCreatorState('build')} className="bg-blue-500 hover:bg-blue-600">
                  <Code className="w-4 h-4 mr-2" />
                  Continue Editing
                </Button>
                <Button onClick={publishGame} className="bg-green-500 hover:bg-green-600">
                  <Share2 className="w-4 h-4 mr-2" />
                  Publish Game
                </Button>
                <Button onClick={onExit} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (creatorState === 'publish') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-8">
          <div className="w-full max-w-2xl glass-card p-12 flex flex-col items-center gap-8">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Game Published!</h2>
            <p className="text-xl text-muted-foreground text-center max-w-lg">
              Congratulations! Your game "{createdGame?.title}" has been published and is now ready to share with friends!
            </p>

            <div className="bg-green-100 p-4 rounded-lg border border-green-300">
              <p className="text-sm text-green-800 text-center">
                Your game is now live in the Community Games library!
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setCreatorState('select-template')} className="game-arcade-btn">
                Create Another Game
              </Button>
              <Button onClick={onExit} variant="outline" className="text-lg px-8 border-2">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Exit Creator Studio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return renderCreatorInterface();
}