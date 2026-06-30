import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChatCircle, X, PaperPlaneTilt, Robot, Sparkle, Question, Lightbulb, BookOpen } from '@phosphor-icons/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Financial literacy knowledge base for kids
const KNOWLEDGE_BASE = {
  greetings: [
    "Hey there, money explorer! 🌟 I'm Penny, your financial friend! What would you like to learn about today?",
    "Hi! I'm Penny the piggy bank 🐷 Ready to learn about money? Ask me anything!",
    "Welcome, young investor! 💰 I'm here to help you become a money master!"
  ],
  
  topics: {
    saving: {
      keywords: ['save', 'saving', 'savings', 'piggy bank', 'keep money'],
      responses: [
        "Saving is like planting a seed! 🌱 When you put money aside instead of spending it, it grows over time. Try the 'Pay Yourself First' trick - whenever you get money, save some BEFORE spending!",
        "Think of saving like collecting power-ups in a video game! 🎮 The more you save, the more powerful your money becomes. Even saving $1 a day adds up to $365 in a year!",
        "Here's a fun saving game: Get 3 jars - one for SAVING 🏦, one for SPENDING 🛍️, and one for SHARING 💝. Split your money between them!"
      ]
    },
    
    budget: {
      keywords: ['budget', 'plan', 'spending plan', 'money plan', 'allowance'],
      responses: [
        "A budget is like a treasure map for your money! 🗺️ It shows where your money comes from and where it goes. The 50/30/20 rule is great: 50% for needs, 30% for wants, 20% for savings!",
        "Making a budget is like being the boss of your money! 👔 Write down what you earn (allowance, gifts, chores) and what you want to buy. Make sure you don't spend more than you have!",
        "Budget tip: Before buying something, ask yourself 'Do I NEED this or WANT this?' 🤔 Needs are things you must have (food, school supplies). Wants are extras (toys, candy)."
      ]
    },
    
    earning: {
      keywords: ['earn', 'make money', 'job', 'work', 'chores', 'allowance'],
      responses: [
        "There are lots of ways kids can earn money! 💪 You could do extra chores, start a lemonade stand, walk neighbors' dogs, or sell crafts you make. The key is finding something you enjoy!",
        "Earning money teaches you that things have value! 💎 When you work for your money, you appreciate it more. What skills do you have that others might pay for?",
        "Fun fact: Some famous entrepreneurs started as kids! 🚀 They sold cookies, mowed lawns, or created cool things. What business idea do you have?"
      ]
    },
    
    investing: {
      keywords: ['invest', 'stock', 'grow money', 'compound', 'interest'],
      responses: [
        "Investing is like having a money tree! 🌳 When you invest, your money can grow by itself. It's called 'compound interest' - you earn money on your money!",
        "Imagine you have 10 coins, and each year they make 1 more coin. Next year, you have 11 coins making even more coins! That's the magic of investing! ✨",
        "The earlier you start investing, the more your money grows! If you saved $1 a day from age 10, you could have over $100,000 by age 60! 🤯"
      ]
    },
    
    debt: {
      keywords: ['debt', 'borrow', 'loan', 'owe', 'credit'],
      responses: [
        "Debt is when you borrow money and have to pay it back, usually with extra (called interest). It's like borrowing a toy but having to return it with an extra toy! 🧸",
        "Not all debt is bad! Borrowing for education or a house can be good. But borrowing for toys or candy? Not so smart! Always ask: 'Can I wait and save for this instead?'",
        "Credit cards are like magic money... but it's NOT free! 💳 You have to pay it all back, plus extra. Only use credit if you can pay it off right away!"
      ]
    },
    
    wants_needs: {
      keywords: ['want', 'need', 'difference', 'necessary', 'important'],
      responses: [
        "NEEDS are things you must have to survive: food, water, shelter, clothes for school. WANTS are extras that make life fun but aren't necessary! 🎯",
        "Here's a trick: Wait 24 hours before buying a 'want'. If you still want it the next day, maybe it's worth it! This is called the 'cooling off' period! ❄️",
        "Make a game of it! When you see something, shout 'NEED!' or 'WANT!' 🎮 You'll be surprised how many things are wants disguised as needs!"
      ]
    },
    
    goals: {
      keywords: ['goal', 'save for', 'want to buy', 'dream', 'target'],
      responses: [
        "Setting money goals is super important! 🎯 Write down what you want, how much it costs, and when you want it. Then figure out how much to save each week!",
        "Break big goals into small steps! Want a $50 game? That's just $5 a week for 10 weeks. You can do it! 💪",
        "Make a goal poster! 🖼️ Put a picture of what you're saving for where you can see it. It'll remind you why you're saving!"
      ]
    },

    games: {
      keywords: ['game', 'play', 'fun', 'mini-game', 'which game'],
      responses: [
        "We have awesome games to help you learn! 🎮 Try 'Coin Catcher' to practice quick math, 'Budget Balance' to learn planning, or 'Investment Tower' to see money grow!",
        "Each neighborhood has different games! Start in Starter Town for basics, then unlock Budget Boulevard, Savings Summit, and more! 🗺️",
        "The games get harder as you go, but you'll earn more points! Complete all games in a location to unlock the BOSS BATTLE! 👹"
      ]
    }
  },
  
  encouragement: [
    "You're doing great! Every question you ask makes you smarter about money! 🌟",
    "Awesome question! You're going to be a money master in no time! 💪",
    "I love your curiosity! That's the first step to being financially smart! 🧠"
  ],
  
  fallback: [
    "Hmm, I'm not sure about that! But here's a tip: the best way to learn about money is to start small and practice! 🌱",
    "Great question! While I think about that, why not try one of our mini-games to learn more? 🎮",
    "That's a tricky one! Ask a parent or teacher, and then come back and tell me what you learned! 📚"
  ]
}

function getResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // Check for greetings
  if (lowerMessage.match(/^(hi|hello|hey|howdy|sup|what's up)/)) {
    return KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)]
  }
  
  // Check topics
  for (const [topic, data] of Object.entries(KNOWLEDGE_BASE.topics)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = data.responses
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  
  // Check for thank you
  if (lowerMessage.match(/(thank|thanks|thx)/)) {
    return "You're welcome! Remember, the more you learn about money, the better you'll be at managing it! Keep asking questions! 🌟"
  }
  
  // Check for help
  if (lowerMessage.match(/(help|stuck|confused|don't understand)/)) {
    return "No worries, I'm here to help! 🤗 You can ask me about:\n• Saving money 🐷\n• Making a budget 📊\n• Earning money 💪\n• Investing 📈\n• Wants vs Needs 🤔\n• Setting goals 🎯\n\nWhat would you like to know?"
  }
  
  // Fallback
  const encouragement = KNOWLEDGE_BASE.encouragement[Math.floor(Math.random() * KNOWLEDGE_BASE.encouragement.length)]
  const fallback = KNOWLEDGE_BASE.fallback[Math.floor(Math.random() * KNOWLEDGE_BASE.fallback.length)]
  return `${encouragement}\n\n${fallback}`
}

interface AIChatHelperProps {
  playerName?: string
  currentLocation?: string
  currentGame?: string
}

export default function AIChatHelper({ 
  playerName = 'Explorer',
  currentLocation,
  currentGame 
}: AIChatHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey ${playerName}! 🐷 I'm Penny, your money buddy! I'm here to help you learn about finances and guide you through the games. Ask me anything or click the quick buttons below!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    const response = getResponse(content)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const quickQuestions = [
    { icon: '💰', text: 'How do I save money?' },
    { icon: '📊', text: "What's a budget?" },
    { icon: '🎮', text: 'Which game should I play?' },
    { icon: '🎯', text: 'How do I set goals?' },
  ]

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center border-4 border-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <span className="text-3xl">🐷</span>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border-4 border-purple-300 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                🐷
              </div>
              <div>
                <div className="font-bold text-lg">Penny the Money Buddy</div>
                <div className="text-xs text-purple-100 flex items-center gap-1">
                  <Sparkle size={12} /> Always here to help!
                </div>
              </div>
            </div>

            {/* Context banner */}
            {(currentLocation || currentGame) && (
              <div className="bg-purple-100 px-4 py-2 text-xs text-purple-700 flex items-center gap-2">
                <Lightbulb size={14} />
                {currentGame ? `Playing: ${currentGame}` : `At: ${currentLocation}`}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 to-white">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-white rounded-br-sm'
                        : 'bg-white border-2 border-purple-200 text-gray-700 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1 text-purple-500">
                        <span className="text-lg">🐷</span>
                        <span className="text-xs font-bold">Penny</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-purple-400"
                >
                  <span className="text-lg">🐷</span>
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div className="px-4 py-2 bg-white border-t border-purple-100">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="flex-shrink-0 px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded-full text-xs text-purple-700 transition-colors flex items-center gap-1"
                  >
                    <span>{q.icon}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="p-4 bg-white border-t border-purple-100 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Penny anything..."
                className="flex-1 px-4 py-2 rounded-full border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
              >
                <PaperPlaneTilt size={20} weight="fill" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
