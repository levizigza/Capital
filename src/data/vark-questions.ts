export type VARKDimension = 'visual' | 'aural' | 'readwrite' | 'kinesthetic'

export interface VARKOption {
  text: string
  dimension: VARKDimension
}

export interface VARKQuestion {
  id: string
  question: string
  options: VARKOption[]
}

export const VARK_QUESTIONS: VARKQuestion[] = [
  {
    id: 'q1',
    question: 'When learning something new, I prefer to...',
    options: [
      { text: 'See diagrams, charts, and infographics', dimension: 'visual' },
      { text: 'Hear explanations and discuss it out loud', dimension: 'aural' },
      { text: 'Read detailed instructions and take notes', dimension: 'readwrite' },
      { text: 'Try it hands-on immediately and experiment', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q2',
    question: 'I remember things better when I...',
    options: [
      { text: 'Draw pictures or create mind maps', dimension: 'visual' },
      { text: 'Talk about them out loud or hear them repeated', dimension: 'aural' },
      { text: 'Write notes and make lists', dimension: 'readwrite' },
      { text: 'Practice doing them repeatedly', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q3',
    question: 'When I need to understand a financial concept like compound interest, I would...',
    options: [
      { text: 'Look at a graph showing growth over time', dimension: 'visual' },
      { text: 'Have someone explain it to me verbally', dimension: 'aural' },
      { text: 'Read an article or guide about how it works', dimension: 'readwrite' },
      { text: 'Play with a calculator to see the numbers change', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q4',
    question: 'In a classroom or learning environment, I learn best through...',
    options: [
      { text: 'Visual presentations with slides and videos', dimension: 'visual' },
      { text: 'Lectures and group discussions', dimension: 'aural' },
      { text: 'Reading textbooks and handouts', dimension: 'readwrite' },
      { text: 'Lab work and hands-on activities', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q5',
    question: 'When I give directions to someone, I usually...',
    options: [
      { text: 'Draw a map or point to landmarks', dimension: 'visual' },
      { text: 'Give verbal turn-by-turn instructions', dimension: 'aural' },
      { text: 'Write down the directions step by step', dimension: 'readwrite' },
      { text: 'Walk them through it or gesture the route', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q6',
    question: 'When using a new app or website, I prefer to...',
    options: [
      { text: 'Watch video tutorials or see screenshots', dimension: 'visual' },
      { text: 'Have someone walk me through it verbally', dimension: 'aural' },
      { text: 'Read the user manual or help documentation', dimension: 'readwrite' },
      { text: 'Jump in and figure it out by clicking around', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q7',
    question: 'When I need to focus and concentrate, I...',
    options: [
      { text: 'Need a clean, organized visual space', dimension: 'visual' },
      { text: 'Prefer background music or white noise', dimension: 'aural' },
      { text: 'Make written plans and checklists', dimension: 'readwrite' },
      { text: 'Need to move around or fidget with something', dimension: 'kinesthetic' }
    ]
  },
  {
    id: 'q8',
    question: 'When studying for a test, I am most likely to...',
    options: [
      { text: 'Create colorful diagrams and flashcards', dimension: 'visual' },
      { text: 'Study with a partner and quiz each other aloud', dimension: 'aural' },
      { text: 'Rewrite my notes and make summary sheets', dimension: 'readwrite' },
      { text: 'Use practice problems and real examples', dimension: 'kinesthetic' }
    ]
  }
]

export interface VARKProfile {
  visual: number
  aural: number
  readwrite: number
  kinesthetic: number
}

export const calculateVARKProfile = (responses: VARKDimension[]): VARKProfile => {
  const counts = {
    visual: 0,
    aural: 0,
    readwrite: 0,
    kinesthetic: 0
  }

  responses.forEach(dimension => {
    counts[dimension]++
  })

  const total = responses.length

  return {
    visual: counts.visual / total,
    aural: counts.aural / total,
    readwrite: counts.readwrite / total,
    kinesthetic: counts.kinesthetic / total
  }
}

export const getDominantLearningStyle = (profile: VARKProfile): VARKDimension | 'multimodal' => {
  const entries = Object.entries(profile) as [VARKDimension, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  
  if (sorted[0][1] > 0.35) {
    return sorted[0][0]
  }
  
  return 'multimodal'
}

export const getLearningStyleDescription = (dimension: VARKDimension | 'multimodal'): string => {
  const descriptions = {
    visual: 'You learn best through visual representations like charts, diagrams, and infographics. Seeing patterns and colors helps you understand concepts.',
    aural: 'You learn best through listening and discussion. Hearing explanations and talking through ideas helps you understand concepts.',
    readwrite: 'You learn best through reading and writing. Taking notes, reading detailed guides, and organizing information in text helps you understand concepts.',
    kinesthetic: 'You learn best through hands-on practice and experimentation. Interacting directly with materials and learning by doing helps you understand concepts.',
    multimodal: 'You have a balanced learning style! You benefit from multiple types of content and can adapt your approach to different situations.'
  }
  
  return descriptions[dimension]
}
