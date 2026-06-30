import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import { EnhancedAvatarConfig } from './EnhancedAvatarCustomizer'
import { resolveSkinColor } from '@/lib/skin-colors'

// Board spaces
interface BoardSpace {
  id: number
  name: string
  type: 'property' | 'chance' | 'tax' | 'corner' | 'mini-game' | 'bank'
  emoji: string
  color?: string
  price?: number
  rent?: number
  description: string
}

const BOARD_SPACES: BoardSpace[] = [
  { id: 0, name: 'GO!', type: 'corner', emoji: '🚀', description: 'Collect $200 when you pass!' },
  { id: 1, name: 'Lemonade Lane', type: 'property', emoji: '🍋', color: '#8B4513', price: 60, rent: 10, description: 'A classic business starter!' },
  { id: 2, name: 'Chance', type: 'chance', emoji: '❓', description: 'Draw a chance card!' },
  { id: 3, name: 'Savings Street', type: 'property', emoji: '🐷', color: '#8B4513', price: 80, rent: 15, description: 'Where piggy banks live!' },
  { id: 4, name: 'Tax Time', type: 'tax', emoji: '💸', description: 'Pay 10% of your money!' },
  { id: 5, name: 'Budget Boulevard', type: 'property', emoji: '📊', color: '#87CEEB', price: 100, rent: 20, description: 'Learn to plan your spending!' },
  { id: 6, name: 'Mini-Game!', type: 'mini-game', emoji: '🎮', description: 'Play a game to earn coins!' },
  { id: 7, name: 'Investment Ave', type: 'property', emoji: '📈', color: '#87CEEB', price: 120, rent: 25, description: 'Watch your money grow!' },
  { id: 8, name: 'Chance', type: 'chance', emoji: '❓', description: 'Draw a chance card!' },
  { id: 9, name: 'Compound Corner', type: 'property', emoji: '🌳', color: '#87CEEB', price: 140, rent: 30, description: 'Interest grows on interest!' },
  { id: 10, name: 'BANK', type: 'corner', emoji: '🏦', description: 'Rest here and collect interest!' },
  { id: 11, name: 'Stock Street', type: 'property', emoji: '📉', color: '#FF69B4', price: 160, rent: 35, description: 'Buy low, sell high!' },
  { id: 12, name: 'Mini-Game!', type: 'mini-game', emoji: '🎮', description: 'Play a game to earn coins!' },
  { id: 13, name: 'Crypto Court', type: 'property', emoji: '🪙', color: '#FF69B4', price: 180, rent: 40, description: 'Digital money district!' },
  { id: 14, name: 'Chance', type: 'chance', emoji: '❓', description: 'Draw a chance card!' },
  { id: 15, name: 'Entrepreneur Estate', type: 'property', emoji: '🏢', color: '#FF69B4', price: 200, rent: 50, description: 'Build your business empire!' },
  { id: 16, name: 'FREE MONEY', type: 'corner', emoji: '🎁', description: 'Collect $100 bonus!' },
  { id: 17, name: 'Real Estate Row', type: 'property', emoji: '🏠', color: '#FFA500', price: 220, rent: 55, description: 'Property is power!' },
  { id: 18, name: 'Mini-Game!', type: 'mini-game', emoji: '🎮', description: 'Play a game to earn coins!' },
  { id: 19, name: 'Wealth Way', type: 'property', emoji: '💎', color: '#FFA500', price: 240, rent: 60, description: 'The path to riches!' },
  { id: 20, name: 'Tax Time', type: 'tax', emoji: '💸', description: 'Pay $100 in taxes!' },
  { id: 21, name: 'Fortune Fields', type: 'property', emoji: '🍀', color: '#FFA500', price: 260, rent: 65, description: 'Where luck meets skill!' },
  { id: 22, name: 'Chance', type: 'chance', emoji: '❓', description: 'Draw a chance card!' },
  { id: 23, name: 'Millionaire Mile', type: 'property', emoji: '🤑', color: '#32CD32', price: 280, rent: 70, description: 'Almost at the top!' },
  { id: 24, name: 'GO BROKE', type: 'corner', emoji: '😰', description: 'Uh oh! Lose a turn recovering!' },
  { id: 25, name: 'Billionaire Blvd', type: 'property', emoji: '💰', color: '#32CD32', price: 300, rent: 80, description: 'The big leagues!' },
  { id: 26, name: 'Mini-Game!', type: 'mini-game', emoji: '🎮', description: 'Play a game to earn coins!' },
  { id: 27, name: 'Tycoon Tower', type: 'property', emoji: '🏰', color: '#32CD32', price: 350, rent: 100, description: 'Rule the financial world!' },
  { id: 28, name: 'Chance', type: 'chance', emoji: '❓', description: 'Draw a chance card!' },
  { id: 29, name: 'Money Mountain', type: 'property', emoji: '⛰️', color: '#4169E1', price: 400, rent: 125, description: 'The ultimate investment!' },
  { id: 30, name: 'Super Tax', type: 'tax', emoji: '🏛️', description: 'Pay $200 luxury tax!' },
  { id: 31, name: 'Financial Freedom', type: 'property', emoji: '🏆', color: '#4169E1', price: 500, rent: 150, description: 'You made it! The dream!' },
]

// Chance cards
const CHANCE_CARDS = [
  { text: 'Your savings account earned interest! Collect $50!', amount: 50, emoji: '🎉' },
  { text: 'You helped a neighbor with chores! Collect $30!', amount: 30, emoji: '🤝' },
  { text: 'Birthday money from grandma! Collect $100!', amount: 100, emoji: '🎂' },
  { text: 'Your investment paid off! Collect $75!', amount: 75, emoji: '📈' },
  { text: 'Found money in old jacket! Collect $20!', amount: 20, emoji: '🧥' },
  { text: 'You bought too much candy! Pay $25!', amount: -25, emoji: '🍬' },
  { text: 'Phone bill due! Pay $40!', amount: -40, emoji: '📱' },
  { text: 'Car needs repairs! Pay $60!', amount: -60, emoji: '🚗' },
  { text: 'Advance to GO and collect $200!', amount: 200, emoji: '🚀', action: 'goto-0' },
  { text: 'Go directly to Bank! Do not pass GO!', amount: 0, emoji: '🏦', action: 'goto-10' },
  { text: 'Won a mini-game tournament! Collect $150!', amount: 150, emoji: '🏆' },
  { text: 'Donated to charity! Good karma but pay $50!', amount: -50, emoji: '💝' },
]

interface Player {
  id: string
  name: string
  avatar: EnhancedAvatarConfig
  money: number
  position: number
  properties: number[]
  isAI: boolean
  isBankrupt: boolean
  skipTurn: boolean
  color: string
}

// 3D Board Piece
function BoardPiece3D({ space, position }: { space: BoardSpace; position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.9, 0.1, 0.9]} radius={0.02}>
        <meshStandardMaterial color={space.color || '#f0f0f0'} />
      </RoundedBox>
      <Html position={[0, 0.2, 0]} center>
        <div className="text-2xl">{space.emoji}</div>
      </Html>
    </group>
  )
}

// 3D Player Token
function PlayerToken3D({ player, boardPosition }: { player: Player; boardPosition: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05
    }
  })
  
  return (
    <group ref={meshRef} position={[boardPosition[0], 0.3, boardPosition[2]]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 32]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={resolveSkinColor(player.avatar.skinTone)} />
      </mesh>
    </group>
  )
}

// Calculate board position for 3D
function getBoardPosition(index: number): [number, number, number] {
  const boardSize = 8
  const spacing = 1.2
  
  // Bottom row (0-7)
  if (index <= 7) {
    return [(7 - index) * spacing - 4, 0, 4]
  }
  // Left column (8-15)
  if (index <= 15) {
    return [-4, 0, (15 - index) * spacing - 4]
  }
  // Top row (16-23)
  if (index <= 23) {
    return [(index - 16) * spacing - 4, 0, -4]
  }
  // Right column (24-31)
  return [4, 0, (index - 24) * spacing - 4]
}

interface CoinAndCapitalProps {
  playerAvatar: EnhancedAvatarConfig
  playerName: string
  onExit: () => void
  onMiniGame: (callback: (won: boolean, reward: number) => void) => void
}

export default function CoinAndCapital({
  playerAvatar,
  playerName,
  onExit,
  onMiniGame
}: CoinAndCapitalProps) {
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: playerName,
      avatar: playerAvatar,
      money: 1500,
      position: 0,
      properties: [],
      isAI: false,
      isBankrupt: false,
      skipTurn: false,
      color: '#E74C3C'
    },
    {
      id: '2',
      name: 'Budget Bot',
      avatar: { ...playerAvatar, topColor: '#3498DB' },
      money: 1500,
      position: 0,
      properties: [],
      isAI: true,
      isBankrupt: false,
      skipTurn: false,
      color: '#3498DB'
    },
    {
      id: '3',
      name: 'Savings Sam',
      avatar: { ...playerAvatar, topColor: '#2ECC71' },
      money: 1500,
      position: 0,
      properties: [],
      isAI: true,
      isBankrupt: false,
      skipTurn: false,
      color: '#2ECC71'
    },
    {
      id: '4',
      name: 'Investor Ivy',
      avatar: { ...playerAvatar, topColor: '#9B59B6' },
      money: 1500,
      position: 0,
      properties: [],
      isAI: true,
      isBankrupt: false,
      skipTurn: false,
      color: '#9B59B6'
    }
  ])
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceRoll, setDiceRoll] = useState<[number, number] | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [gameMessage, setGameMessage] = useState('Roll the dice to start!')
  const [showChanceCard, setShowChanceCard] = useState(false)
  const [currentChanceCard, setCurrentChanceCard] = useState<typeof CHANCE_CARDS[0] | null>(null)
  const [showPropertyDialog, setShowPropertyDialog] = useState(false)
  const [currentProperty, setCurrentProperty] = useState<BoardSpace | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)

  const currentPlayer = players[currentPlayerIndex]

  const rollDice = useCallback(() => {
    if (isRolling || currentPlayer.isAI) return
    
    setIsRolling(true)
    
    // Animate dice roll
    let rollCount = 0
    const rollInterval = setInterval(() => {
      setDiceRoll([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ])
      rollCount++
      
      if (rollCount >= 10) {
        clearInterval(rollInterval)
        const finalRoll: [number, number] = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]
        setDiceRoll(finalRoll)
        movePlayer(finalRoll[0] + finalRoll[1])
        setIsRolling(false)
      }
    }, 100)
  }, [isRolling, currentPlayer])

  const movePlayer = (spaces: number) => {
    const newPosition = (currentPlayer.position + spaces) % 32
    setPlayers(prev => {
      const newPlayers = [...prev]
      const player = newPlayers[currentPlayerIndex]
      const oldPosition = player.position
      player.position = newPosition
      
      // Passed GO
      if (player.position < oldPosition && player.position !== 0) {
        player.money += 200
        setGameMessage(`${player.name} passed GO! Collected $200!`)
      }
      
      return newPlayers
    })
    
    // Handle landing on space
    setTimeout(() => {
      handleLanding(newPosition)
    }, 500)
  }

  const handleLanding = (landedPosition?: number) => {
    const space = BOARD_SPACES[landedPosition ?? currentPlayer.position]
    
    switch (space.type) {
      case 'corner':
        if (space.id === 0) {
          // GO - already handled
          setGameMessage(`${currentPlayer.name} landed on GO!`)
        } else if (space.id === 10) {
          // Bank - collect interest
          const interest = Math.floor(currentPlayer.money * 0.05)
          updatePlayerMoney(currentPlayerIndex, interest)
          setGameMessage(`${currentPlayer.name} collected $${interest} interest at the bank!`)
        } else if (space.id === 16) {
          // Free money
          updatePlayerMoney(currentPlayerIndex, 100)
          setGameMessage(`${currentPlayer.name} got $100 free money!`)
        } else if (space.id === 24) {
          // Go broke - skip turn
          setPlayers(prev => {
            const newPlayers = [...prev]
            newPlayers[currentPlayerIndex].skipTurn = true
            return newPlayers
          })
          setGameMessage(`${currentPlayer.name} went broke! Skip next turn!`)
        }
        setTimeout(endTurn, 2000)
        break
        
      case 'property':
        const owner = players.find(p => p.properties.includes(space.id))
        if (owner && owner.id !== currentPlayer.id) {
          // Pay rent
          const rent = space.rent || 0
          updatePlayerMoney(currentPlayerIndex, -rent)
          const ownerIndex = players.findIndex(p => p.id === owner.id)
          updatePlayerMoney(ownerIndex, rent)
          setGameMessage(`${currentPlayer.name} paid $${rent} rent to ${owner.name}!`)
          setTimeout(endTurn, 2000)
        } else if (!owner) {
          // Can buy
          setCurrentProperty(space)
          setShowPropertyDialog(true)
        } else {
          setGameMessage(`${currentPlayer.name} owns this property!`)
          setTimeout(endTurn, 1500)
        }
        break
        
      case 'chance':
        const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)]
        setCurrentChanceCard(card)
        setShowChanceCard(true)
        break
        
      case 'tax':
        const tax = space.id === 4 
          ? Math.floor(currentPlayer.money * 0.1) 
          : space.id === 20 ? 100 : 200
        updatePlayerMoney(currentPlayerIndex, -tax)
        setGameMessage(`${currentPlayer.name} paid $${tax} in taxes!`)
        setTimeout(endTurn, 2000)
        break
        
      case 'mini-game':
        setGameMessage(`${currentPlayer.name} gets to play a mini-game!`)
        onMiniGame((won, reward) => {
          if (won) {
            updatePlayerMoney(currentPlayerIndex, reward)
            setGameMessage(`${currentPlayer.name} won $${reward} in the mini-game!`)
          } else {
            setGameMessage(`${currentPlayer.name} didn't win the mini-game. Better luck next time!`)
          }
          setTimeout(endTurn, 2000)
        })
        break
    }
  }

  const updatePlayerMoney = (playerIndex: number, amount: number) => {
    setPlayers(prev => {
      const newPlayers = [...prev]
      newPlayers[playerIndex].money += amount
      
      // Check for bankruptcy
      if (newPlayers[playerIndex].money <= 0) {
        newPlayers[playerIndex].isBankrupt = true
        newPlayers[playerIndex].money = 0
        
        // Check for winner
        const activePlayers = newPlayers.filter(p => !p.isBankrupt)
        if (activePlayers.length === 1) {
          setWinner(activePlayers[0])
          setGameOver(true)
        }
      }
      
      return newPlayers
    })
  }

  const buyProperty = () => {
    if (!currentProperty || !currentProperty.price) return
    
    if (currentPlayer.money >= currentProperty.price) {
      updatePlayerMoney(currentPlayerIndex, -currentProperty.price)
      setPlayers(prev => {
        const newPlayers = [...prev]
        newPlayers[currentPlayerIndex].properties.push(currentProperty.id)
        return newPlayers
      })
      setGameMessage(`${currentPlayer.name} bought ${currentProperty.name} for $${currentProperty.price}!`)
    }
    
    setShowPropertyDialog(false)
    setCurrentProperty(null)
    setTimeout(endTurn, 1500)
  }

  const skipBuy = () => {
    setShowPropertyDialog(false)
    setCurrentProperty(null)
    setGameMessage(`${currentPlayer.name} decided not to buy.`)
    setTimeout(endTurn, 1500)
  }

  const handleChanceCard = () => {
    if (!currentChanceCard) return
    
    updatePlayerMoney(currentPlayerIndex, currentChanceCard.amount)
    
    if (currentChanceCard.action) {
      const targetSpace = parseInt(currentChanceCard.action.split('-')[1])
      setPlayers(prev => {
        const newPlayers = [...prev]
        newPlayers[currentPlayerIndex].position = targetSpace
        return newPlayers
      })
    }
    
    setShowChanceCard(false)
    setCurrentChanceCard(null)
    setTimeout(endTurn, 1500)
  }

  const endTurn = () => {
    // Find next active player (with safety counter to prevent infinite loop)
    let nextIndex = (currentPlayerIndex + 1) % players.length
    let safety = 0
    while ((players[nextIndex].isBankrupt || players[nextIndex].skipTurn) && safety < players.length) {
      if (players[nextIndex].skipTurn) {
        setPlayers(prev => {
          const newPlayers = [...prev]
          newPlayers[nextIndex].skipTurn = false
          return newPlayers
        })
      }
      nextIndex = (nextIndex + 1) % players.length
      safety++
      if (nextIndex === currentPlayerIndex) break
    }
    
    setCurrentPlayerIndex(nextIndex)
    setDiceRoll(null)
    
    // AI turn
    if (players[nextIndex].isAI && !players[nextIndex].isBankrupt) {
      setTimeout(() => {
        aiTurn(nextIndex)
      }, 1000)
    } else {
      setGameMessage(`${players[nextIndex].name}'s turn! Roll the dice!`)
    }
  }

  const aiTurn = (playerIndex: number) => {
    setGameMessage(`${players[playerIndex].name} is rolling...`)
    
    setTimeout(() => {
      const roll: [number, number] = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      setDiceRoll(roll)
      
      // Move AI player
      setPlayers(prev => {
        const newPlayers = [...prev]
        const player = newPlayers[playerIndex]
        const oldPosition = player.position
        player.position = (player.position + roll[0] + roll[1]) % 32
        
        if (player.position < oldPosition) {
          player.money += 200
        }
        
        return newPlayers
      })
      
      // AI handles landing automatically (use roll values directly to avoid stale state)
      const aiOldPos = players[playerIndex].position
      const newPosition = (aiOldPos + roll[0] + roll[1]) % 32
      setTimeout(() => {
        const space = BOARD_SPACES[newPosition]
        
        // AI always buys if it can afford
        if (space.type === 'property' && space.price) {
          const owner = players.find(p => p.properties.includes(space.id))
          if (!owner && players[playerIndex].money >= space.price) {
            updatePlayerMoney(playerIndex, -space.price)
            setPlayers(prev => {
              const newPlayers = [...prev]
              newPlayers[playerIndex].properties.push(space.id)
              return newPlayers
            })
            setGameMessage(`${players[playerIndex].name} bought ${space.name}!`)
          }
        }
        
        setTimeout(endTurn, 1500)
      }, 1000)
    }, 1000)
  }

  // Game over screen
  if (gameOver && winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="retro-card max-w-md w-full text-center"
        >
          <div className="retro-card-header bg-gradient-to-r from-yellow-500 to-orange-500">
            🏆 GAME OVER! 🏆
          </div>
          <div className="retro-card-body">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{winner.name} Wins!</h2>
            <p className="text-xl text-green-600 mb-4">Final Fortune: ${winner.money.toLocaleString()}</p>
            <p className="text-gray-600 mb-6">
              {winner.isAI 
                ? "The AI was a tough competitor! Try again?" 
                : "Congratulations! You're a financial champion!"}
            </p>
            <button onClick={onExit} className="retro-btn retro-btn-green">
              Return to Menu
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-600 to-emerald-500">
      {/* Header HUD */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-start max-w-6xl mx-auto">
          <button onClick={onExit} className="retro-btn retro-btn-red text-sm">
            ← Exit
          </button>
          <h1 className="text-white font-extrabold text-lg drop-shadow-md hidden sm:block">🎲 Coin &amp; Capital</h1>
          
          {/* Player stats */}
          <div className="flex gap-2 flex-wrap justify-end">
            {players.map((player, index) => (
              <div 
                key={player.id}
                className={`retro-card p-2 ${
                  index === currentPlayerIndex ? 'ring-4 ring-yellow-400' : ''
                } ${player.isBankrupt ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-black dynamic-bg-color"
                    ref={(el) => { if (el) el.style.setProperty('--dynamic-color', player.color) }}
                  />
                  <div>
                    <div className="text-xs font-bold">{player.name}{index === currentPlayerIndex && !player.isBankrupt ? ' 🎯' : ''}</div>
                    <div className="text-sm text-green-600">${player.money}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Board */}
      <div className="h-[60vh]">
        <Canvas camera={{ position: [0, 12, 8], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} />
          
          {/* Board base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          
          {/* Board spaces */}
          {BOARD_SPACES.map((space) => (
            <BoardPiece3D 
              key={space.id} 
              space={space} 
              position={getBoardPosition(space.id)} 
            />
          ))}
          
          {/* Player tokens */}
          {players.filter(p => !p.isBankrupt).map((player) => (
            <PlayerToken3D 
              key={player.id} 
              player={player} 
              boardPosition={getBoardPosition(player.position)} 
            />
          ))}
          
          <OrbitControls 
            enablePan={false}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      {/* Game controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Message */}
          <div className="retro-card mb-4">
            <div className="retro-card-body text-center">
              <p className="text-lg font-bold">{gameMessage}</p>
              
              {/* Dice display */}
              {diceRoll && (
                <div className="flex justify-center gap-4 mt-4">
                  <motion.div 
                    animate={{ rotateZ: isRolling ? 360 : 0 }}
                    transition={{ duration: 0.1, repeat: isRolling ? Infinity : 0 }}
                    className="w-16 h-16 bg-white border-4 border-black rounded-lg flex items-center justify-center text-3xl font-bold"
                  >
                    {diceRoll[0]}
                  </motion.div>
                  <motion.div 
                    animate={{ rotateZ: isRolling ? -360 : 0 }}
                    transition={{ duration: 0.1, repeat: isRolling ? Infinity : 0 }}
                    className="w-16 h-16 bg-white border-4 border-black rounded-lg flex items-center justify-center text-3xl font-bold"
                  >
                    {diceRoll[1]}
                  </motion.div>
                </div>
              )}
              
              {/* Roll button */}
              {!currentPlayer.isAI && !diceRoll && (
                <button 
                  onClick={rollDice}
                  disabled={isRolling}
                  className="retro-btn retro-btn-green mt-4"
                >
                  🎲 Roll Dice!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property purchase dialog */}
      <AnimatePresence>
        {showPropertyDialog && currentProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="retro-card max-w-sm w-full"
            >
              <div 
                className="retro-card-header dynamic-gradient-header"
                ref={(el) => { if (el) { el.style.setProperty('--header-color', currentProperty.color ?? '#6b7280'); el.style.setProperty('--header-color-end', (currentProperty.color ?? '#6b7280') + 'dd') } }}
              >
                {currentProperty.emoji} {currentProperty.name}
              </div>
              <div className="retro-card-body text-center">
                <p className="mb-4">{currentProperty.description}</p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Price:</span>
                    <span className="font-bold">${currentProperty.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rent:</span>
                    <span className="font-bold">${currentProperty.rent}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Your money: ${currentPlayer.money}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={skipBuy}
                    className="retro-btn retro-btn-red flex-1"
                  >
                    ❌ Pass
                  </button>
                  <button 
                    onClick={buyProperty}
                    disabled={currentPlayer.money < (currentProperty.price || 0)}
                    className="retro-btn retro-btn-green flex-1 disabled:opacity-50"
                  >
                    ✅ Buy!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chance card dialog */}
      <AnimatePresence>
        {showChanceCard && currentChanceCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="retro-card max-w-sm w-full"
            >
              <div className="retro-card-header bg-gradient-to-r from-purple-500 to-pink-500">
                ❓ Chance Card!
              </div>
              <div className="retro-card-body text-center">
                <div className="text-6xl mb-4">{currentChanceCard.emoji}</div>
                <p className="text-lg mb-4">{currentChanceCard.text}</p>
                <p className={`text-2xl font-bold ${currentChanceCard.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentChanceCard.amount >= 0 ? '+' : ''}{currentChanceCard.amount}
                </p>
                <button 
                  onClick={handleChanceCard}
                  className="retro-btn retro-btn-blue mt-4"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
