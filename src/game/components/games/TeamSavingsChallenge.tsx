import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trophy, Target, TrendingUp, Share2 } from '@/lib/lucide';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamSavingsChallengeProps {
  onComplete: (score: number, additionalData?: Record<string, unknown>) => void;
  onExit: () => void;
  userTier?: 'elementary' | 'middle' | 'adult';
}

interface TeamMember {
  id: number;
  name: string;
  contribution: number;
  avatar: string;
  lastAction: string;
}

interface SavingsChallenge {
  id: number;
  title: string;
  description: string;
  teamGoal: number;
  timeLimit: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard';
  multiplier: number;
}

const savingsChallenges: SavingsChallenge[] = [
  {
    id: 1,
    title: 'Emergency Fund Sprint',
    description: 'Work together to build a $1,000 emergency fund in 3 minutes!',
    teamGoal: 1000,
    timeLimit: 180,
    difficulty: 'easy',
    multiplier: 1.2
  },
  {
    id: 2,
    title: 'Vacation Savings Race',
    description: 'Team up to save $2,500 for a group vacation in 4 minutes!',
    teamGoal: 2500,
    timeLimit: 240,
    difficulty: 'medium',
    multiplier: 1.5
  },
  {
    id: 3,
    title: 'Investment Club Challenge',
    description: 'Collaborate to reach $5,000 for a group investment in 5 minutes!',
    teamGoal: 5000,
    timeLimit: 300,
    difficulty: 'hard',
    multiplier: 2.0
  }
];

const teamNames = ['Savings Squad', 'Money Makers', 'Budget Builders', 'Finance Force', 'Wealth Wizards'];
const teamAvatars = ['🦸', '🚀', '💪', '⭐', '🎯'];

export default function TeamSavingsChallenge({ onComplete, onExit, userTier = 'middle' }: TeamSavingsChallengeProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [currentChallenge, setCurrentChallenge] = useState<SavingsChallenge | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamProgress, setTeamProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [bonusEvents, setBonusEvents] = useState<string[]>([]);
  const [teamMomentum, setTeamMomentum] = useState(0);

  const initializeTeam = () => {
    const members: TeamMember[] = [
      {
        id: 1,
        name: 'You',
        contribution: 0,
        avatar: '👤',
        lastAction: 'Ready to save!'
      }
    ];

    // Add AI team members
    for (let i = 2; i <= 4; i++) {
      members.push({
        id: i,
        name: teamNames[Math.floor(Math.random() * teamNames.length)],
        contribution: 0,
        avatar: teamAvatars[Math.floor(Math.random() * teamAvatars.length)],
        lastAction: 'Ready to save!'
      });
    }

    setTeamMembers(members);
  };

  const startChallenge = (challenge: SavingsChallenge) => {
    setCurrentChallenge(challenge);
    setGameState('playing');
    setTeamProgress(0);
    setTimeLeft(challenge.timeLimit);
    setPlayerScore(0);
    setComboMultiplier(1);
    setTeamMomentum(0);
    setBonusEvents([]);
    initializeTeam();
  };

  const handlePlayerAction = useCallback((action: 'quick-save' | 'smart-save' | 'team-boost') => {
    if (gameState !== 'playing' || !currentChallenge) return;

    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime;

    let contribution = 0;
    let actionDescription = '';
    let comboBonus = 1;

    // Combo system for quick actions
    if (timeSinceLastAction < 2000) {
      setComboMultiplier(prev => Math.min(3, prev + 0.2));
      comboBonus = 1 + (comboMultiplier - 1) * 0.5;
    } else {
      setComboMultiplier(1);
    }

    switch (action) {
      case 'quick-save':
        contribution = Math.floor((Math.random() * 15 + 10) * comboBonus);
        actionDescription = `Quick save: +$${contribution}`;
        break;
      case 'smart-save':
        contribution = Math.floor((Math.random() * 25 + 20) * comboBonus * currentChallenge.multiplier);
        actionDescription = `Smart save: +$${contribution}`;
        break;
      case 'team-boost':
        contribution = Math.floor((Math.random() * 30 + 25) * comboBonus);
        setTeamMomentum(prev => prev + 10);
        actionDescription = `Team boost: +$${contribution} for everyone!`;
        // Boost all team members
        setTeamMembers(prev => prev.map(member => ({
          ...member,
          contribution: member.contribution + Math.floor(contribution / 4),
          lastAction: member.id === 1 ? 'Led a team boost!' : 'Benefited from team boost!'
        })));
        break;
    }

    setPlayerScore(prev => prev + contribution);
    setTeamProgress(prev => Math.min(currentChallenge.teamGoal, prev + contribution));
    setLastActionTime(now);

    // Update player's team member
    setTeamMembers(prev => prev.map(member =>
      member.id === 1
        ? { ...member, contribution: member.contribution + contribution, lastAction: actionDescription }
        : member
    ));

    // Random bonus events
    if (Math.random() < 0.15) {
      const bonuses = [
        '💰 Bonus Savings Event! Everyone gets +$50!',
        '🎯 Team Efficiency Boost! 2x contributions for 10 seconds!',
        '🏆 Motivation Surge! Combo multiplier extended!',
        '📈 Market Bonus! All savings increased by 25%!'
      ];
      const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
      setBonusEvents(prev => [...prev, bonus]);
      setTimeout(() => setBonusEvents(prev => prev.slice(1)), 3000);
    }
  }, [gameState, currentChallenge, lastActionTime, comboMultiplier]);

  // AI team member actions
  useEffect(() => {
    if (gameState !== 'playing' || !currentChallenge) return;

    const interval = setInterval(() => {
      setTeamMembers(prev => {
        const updated = [...prev];
        for (let i = 1; i < updated.length; i++) {
          if (Math.random() < 0.4) { // 40% chance each AI member acts
            const contribution = Math.floor(Math.random() * 20 + 10) + teamMomentum / 10;
            updated[i] = {
              ...updated[i],
              contribution: updated[i].contribution + contribution,
              lastAction: `Saved $${contribution}`
            };
          }
        }
        return updated;
      });

      // Update team progress
      setTeamProgress(prev => {
        const totalContributions = teamMembers.reduce((sum, member) => sum + member.contribution, 0);
        return Math.min(currentChallenge.teamGoal, totalContributions + Math.random() * 30);
      });

      // Decay momentum
      setTeamMomentum(prev => Math.max(0, prev - 1));
    }, 1500);

    return () => clearInterval(interval);
  }, [gameState, currentChallenge, teamMembers, teamMomentum]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  const endGame = () => {
    setGameState('ended');
    const finalScore = Math.round(playerScore * (teamProgress / (currentChallenge?.teamGoal || 1)));
    onComplete(finalScore, {
      teamGoal: currentChallenge?.teamGoal || 0,
      teamProgress: Math.round(teamProgress),
      completionRate: Math.round((teamProgress / (currentChallenge?.teamGoal || 1)) * 100),
      teamEfficiency: Math.round(playerScore / ((currentChallenge?.timeLimit || 180) - timeLeft + 1))
    });
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-8">
        <div className="w-full max-w-4xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">👥</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Team Savings Challenge!</h2>
          <p className="text-xl text-muted-foreground mb-8 text-center max-w-2xl">
            Join forces with your team to reach ambitious savings goals! Work together, build momentum,
            and experience the power of collaborative financial planning.
          </p>
          <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
            <p className="text-sm text-orange-800">
              <strong>Navigator Special:</strong> Perfect for social connectors who thrive on teamwork and collaboration!
            </p>
          </div>

          <div className="grid gap-6 w-full max-w-2xl">
            <h3 className="text-2xl font-semibold text-center">Choose Your Challenge:</h3>
            {savingsChallenges.map(challenge => (
              <div key={challenge.id} className="bg-white p-6 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold">{challenge.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    🎯 Goal: ${challenge.teamGoal} | ⏱️ {Math.floor(challenge.timeLimit / 60)}m {challenge.timeLimit % 60}s
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    {challenge.multiplier}x Multiplier
                  </span>
                </div>
                <Button
                  onClick={() => startChallenge(challenge)}
                  className="w-full mt-4 game-arcade-btn"
                >
                  Start Challenge
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={onExit} variant="outline" className="w-full max-w-md text-lg border-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const success = teamProgress >= (currentChallenge?.teamGoal || 0);
    const completionRate = Math.round((teamProgress / (currentChallenge?.teamGoal || 1)) * 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-8">
        <div className="w-full max-w-4xl glass-card shadow-2xl p-12 flex flex-col items-center gap-8">
          <div className="text-8xl mb-4">
            {success ? '🏆' : completionRate >= 75 ? '⭐' : '👥'}
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-2">
            {success ? 'Team Victory!' : 'Challenge Complete!'}
          </h2>

          <div className="text-center space-y-4">
            <div className={`text-3xl font-bold ${success ? 'text-green-600' : 'text-blue-600'}`}>
              Team Progress: ${Math.round(teamProgress)} / ${currentChallenge?.teamGoal}
            </div>
            <div className="text-xl text-muted-foreground">
              {completionRate}% Complete
            </div>
            <div className="text-lg text-muted-foreground">
              Your Contribution: ${Math.round(playerScore)} | Team Members: {teamMembers.length}
            </div>
            <div className="text-lg font-medium text-orange-600">
              Team Efficiency: {Math.round(playerScore / ((currentChallenge?.timeLimit || 180) - timeLeft + 1))} pts/sec
            </div>
          </div>

          <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
            <p className="text-sm text-orange-800 text-center">
              {success ? 'Outstanding teamwork! You\'ve mastered collaborative savings!' :
               completionRate >= 75 ? 'Great team effort! So close to your goal!' :
               'Good foundation! Keep building your teamwork skills!'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setGameState('ready')} className="game-arcade-btn px-8 py-3 text-lg">
              Try Another Challenge
            </Button>
            <Button onClick={onExit} variant="outline" className="px-8 py-3 text-lg border-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = (teamProgress / (currentChallenge?.teamGoal || 1)) * 100;

  return (
    <div className="game-arcade-container">
      <div className="game-arcade-header flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl">👥</span>
          <div>
            <h2 className="text-2xl font-bold">{currentChallenge?.title}</h2>
            <p className="text-sm text-muted-foreground">Team Challenge - {timeLeft}s left</p>
          </div>
        </div>
      </div>

      <div className="game-arcade-stats">
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-green-600">${Math.round(teamProgress)}</div>
          <div className="text-xs text-muted-foreground">Team Progress</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-blue-600">${currentChallenge?.teamGoal}</div>
          <div className="text-xs text-muted-foreground">Team Goal</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-purple-600">${Math.round(playerScore)}</div>
          <div className="text-xs text-muted-foreground">Your Contribution</div>
        </div>
        <div className="game-arcade-stat">
          <div className="text-2xl font-bold text-orange-600">{comboMultiplier.toFixed(1)}x</div>
          <div className="text-xs text-muted-foreground">Combo Multiplier</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Team Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Bonus Events */}
      <AnimatePresence>
        {bonusEvents.map((bonus, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 p-3 rounded-lg bg-yellow-100 border-2 border-yellow-300 text-center"
          >
            <p className="text-yellow-800 font-medium">{bonus}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Team Members */}
      <div className="game-arcade-content">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Team Members
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {teamMembers.map(member => (
            <div key={member.id} className="text-center p-4 bg-white rounded-lg border-2 border-orange-200">
              <div className="text-3xl mb-2">{member.avatar}</div>
              <div className="font-semibold text-sm">{member.name}</div>
              <div className="text-lg font-bold text-orange-600">${Math.round(member.contribution)}</div>
              <div className="text-xs text-gray-500 mt-1">{member.lastAction}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-arcade-actions">
        <button
          onClick={() => handlePlayerAction('quick-save')}
          className="game-arcade-btn bg-blue-500 hover:bg-blue-600"
        >
          ⚡ Quick Save
        </button>
        <button
          onClick={() => handlePlayerAction('smart-save')}
          className="game-arcade-btn bg-green-500 hover:bg-green-600"
        >
          🧠 Smart Save
        </button>
        <button
          onClick={() => handlePlayerAction('team-boost')}
          className="game-arcade-btn bg-orange-500 hover:bg-orange-600"
        >
          🚀 Team Boost
        </button>
        <button onClick={onExit} className="game-arcade-btn bg-gray-500 hover:bg-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </button>
      </div>
    </div>
  );
}