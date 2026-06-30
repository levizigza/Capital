/**
 * Transaction Simulator
 * Generates realistic fake financial data for practice mode
 * Designed to be easily swappable with real Plaid API integration
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TransactionCategory = 
  | 'food_dining'
  | 'groceries'
  | 'transport'
  | 'gas'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'utilities'
  | 'income'
  | 'transfer'
  | 'other'

export type TransactionType = 'debit' | 'credit'

export interface Transaction {
  id: string
  accountId: string
  merchantName: string
  amount: number // Positive for debits, negative for credits
  type: TransactionType
  category: TransactionCategory
  date: Date
  pending: boolean
  recurring: boolean
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  available: number
  mask: string // Last 4 digits
  institution: string
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  spendingByCategory: Record<TransactionCategory, number>
  transactionCount: number
  averageTransaction: number
}

export interface SimulatorState {
  accounts: Account[]
  transactions: Transaction[]
  lastSimulatedDate: Date
  daysActive: number
}

// ============================================================================
// MERCHANT DATA
// ============================================================================

const MERCHANTS: Record<string, string[]> = {
  food_dining: [
    'Starbucks', 'McDonald\'s', 'Chipotle', 'Subway', 'Panera Bread',
    'Olive Garden', 'Red Lobster', 'Pizza Hut', 'Domino\'s', 'Taco Bell',
    'Wendy\'s', 'Five Guys', 'The Cheesecake Factory', 'Buffalo Wild Wings'
  ],
  groceries: [
    'Safeway', 'Whole Foods', 'Trader Joe\'s', 'Costco', 'Target',
    'Walmart Supercenter', 'Kroger', 'Publix', 'Albertsons', 'Food Lion'
  ],
  transport: [
    'Uber', 'Lyft', 'Metro Transit', 'Amtrak', 'City Parking',
    'Airport Parking', 'Taxi Service', 'Bus Pass'
  ],
  gas: [
    'Shell', 'Chevron', 'BP', 'Exxon', 'Mobil', '76 Gas',
    'Arco', 'Circle K', 'Speedway', 'Wawa'
  ],
  entertainment: [
    'Netflix', 'Spotify', 'Disney+', 'HBO Max', 'Hulu',
    'Amazon Prime', 'Apple Music', 'YouTube Premium',
    'AMC Theatres', 'Regal Cinemas', 'PlayStation Store',
    'Xbox Store', 'Nintendo eShop', 'Steam'
  ],
  shopping: [
    'Amazon.com', 'Target', 'Walmart', 'Best Buy', 'Macy\'s',
    'Nordstrom', 'H&M', 'Zara', 'Nike', 'Adidas',
    'Home Depot', 'Lowe\'s', 'IKEA', 'Bed Bath & Beyond'
  ],
  bills: [
    'Verizon', 'AT&T', 'T-Mobile', 'Comcast', 'Spectrum',
    'Electric Company', 'Water Department', 'Gas Company',
    'Insurance Payment', 'Credit Card Payment'
  ],
  utilities: [
    'Electric Bill', 'Water Bill', 'Gas Bill', 'Internet Service',
    'Phone Bill', 'Trash Service', 'Sewer Service'
  ],
  income: [
    'Paycheck - Employer Direct Deposit',
    'Freelance Payment',
    'Side Gig Income',
    'Tax Refund',
    'Investment Dividend'
  ]
}

// ============================================================================
// AMOUNT RANGES
// ============================================================================

const AMOUNT_RANGES: Record<TransactionCategory, [number, number]> = {
  food_dining: [5, 45],
  groceries: [30, 150],
  transport: [8, 35],
  gas: [25, 75],
  entertainment: [10, 60],
  shopping: [15, 200],
  bills: [50, 150],
  utilities: [40, 120],
  income: [500, 1200],
  transfer: [50, 500],
  other: [10, 100]
}

// ============================================================================
// RECURRING TRANSACTIONS
// ============================================================================

interface RecurringTransaction {
  merchant: string
  amount: number
  category: TransactionCategory
  dayOfMonth: number
  type: TransactionType
}

const RECURRING_TRANSACTIONS: RecurringTransaction[] = [
  { merchant: 'Netflix', amount: 15.99, category: 'entertainment', dayOfMonth: 1, type: 'debit' },
  { merchant: 'Spotify', amount: 9.99, category: 'entertainment', dayOfMonth: 5, type: 'debit' },
  { merchant: 'Electric Bill', amount: 85.50, category: 'utilities', dayOfMonth: 15, type: 'debit' },
  { merchant: 'Internet Service', amount: 60.00, category: 'bills', dayOfMonth: 20, type: 'debit' },
  { merchant: 'Phone Bill', amount: 45.00, category: 'bills', dayOfMonth: 10, type: 'debit' },
  { merchant: 'Paycheck - Employer Direct Deposit', amount: 800.00, category: 'income', dayOfMonth: 1, type: 'credit' },
  { merchant: 'Paycheck - Employer Direct Deposit', amount: 800.00, category: 'income', dayOfMonth: 15, type: 'credit' }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateId(): string {
  return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// ============================================================================
// ACCOUNT GENERATION
// ============================================================================

export function generateAccount(): Account {
  const balance = randomFloat(500, 2000)
  
  return {
    id: generateId(),
    name: 'Practice Checking Account',
    type: 'checking',
    balance: Math.round(balance * 100) / 100,
    available: Math.round(balance * 100) / 100,
    mask: randomInt(1000, 9999).toString(),
    institution: 'Simulator Bank'
  }
}

// ============================================================================
// TRANSACTION GENERATION
// ============================================================================

/**
 * Generate a single random transaction
 */
export function generateTransaction(
  accountId: string,
  date: Date = new Date(),
  category?: TransactionCategory
): Transaction {
  // Select category if not provided
  const selectedCategory = category || randomChoice([
    'food_dining', 'food_dining', 'groceries', // Weight food/groceries higher
    'transport', 'gas', 'entertainment', 'shopping',
    'bills', 'utilities', 'other'
  ] as TransactionCategory[])
  
  // Get merchant and amount range
  const merchants = MERCHANTS[selectedCategory]
  const [minAmount, maxAmount] = AMOUNT_RANGES[selectedCategory]
  
  // Generate transaction
  const merchant = randomChoice(merchants)
  const amount = Math.round(randomFloat(minAmount, maxAmount) * 100) / 100
  const type: TransactionType = selectedCategory === 'income' ? 'credit' : 'debit'
  
  return {
    id: generateId(),
    accountId,
    merchantName: merchant,
    amount: type === 'debit' ? amount : -amount, // Positive for debits, negative for credits
    type,
    category: selectedCategory,
    date,
    pending: Math.random() < 0.1, // 10% chance of pending
    recurring: false
  }
}

/**
 * Generate initial transaction history (5-10 transactions over past 30 days)
 */
export function generateInitialTransactions(accountId: string): Transaction[] {
  const transactions: Transaction[] = []
  const count = randomInt(5, 10)
  
  for (let i = 0; i < count; i++) {
    const daysBack = randomInt(1, 30)
    const date = daysAgo(daysBack)
    
    const transaction = generateTransaction(accountId, date)
    transactions.push(transaction)
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Generate recurring transaction if due
 */
export function generateRecurringTransaction(
  accountId: string,
  recurringTx: RecurringTransaction,
  date: Date
): Transaction {
  return {
    id: generateId(),
    accountId,
    merchantName: recurringTx.merchant,
    amount: recurringTx.type === 'debit' ? recurringTx.amount : -recurringTx.amount,
    type: recurringTx.type,
    category: recurringTx.category,
    date,
    pending: false,
    recurring: true
  }
}

/**
 * Check if new transactions should be generated
 * Returns transactions that should be added
 */
export function simulateNewTransactions(
  state: SimulatorState,
  currentDate: Date = new Date()
): Transaction[] {
  const newTransactions: Transaction[] = []
  const daysSinceLastSim = Math.floor(
    (currentDate.getTime() - state.lastSimulatedDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceLastSim === 0) return newTransactions
  
  // Check for recurring transactions
  for (const recurringTx of RECURRING_TRANSACTIONS) {
    const lastDate = state.lastSimulatedDate
    const currentDay = currentDate.getDate()
    const lastDay = lastDate.getDate()
    
    // Check if recurring day passed
    if (
      (lastDay < recurringTx.dayOfMonth && currentDay >= recurringTx.dayOfMonth) ||
      (lastDate.getMonth() !== currentDate.getMonth() && currentDay >= recurringTx.dayOfMonth)
    ) {
      const txDate = new Date(currentDate)
      txDate.setDate(recurringTx.dayOfMonth)
      
      const transaction = generateRecurringTransaction(
        state.accounts[0].id,
        recurringTx,
        txDate
      )
      newTransactions.push(transaction)
    }
  }
  
  // Generate random transactions (1 every 1-3 days)
  const randomTxCount = Math.floor(daysSinceLastSim / randomInt(1, 3))
  
  for (let i = 0; i < randomTxCount; i++) {
    const daysBack = randomInt(0, daysSinceLastSim)
    const txDate = new Date(currentDate)
    txDate.setDate(txDate.getDate() - daysBack)
    
    const transaction = generateTransaction(state.accounts[0].id, txDate)
    newTransactions.push(transaction)
  }
  
  return newTransactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// ============================================================================
// FINANCIAL SUMMARY
// ============================================================================

/**
 * Calculate financial summary from transactions
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  startDate?: Date,
  endDate?: Date
): FinancialSummary {
  // Filter transactions by date range if provided
  let filtered = transactions
  
  if (startDate || endDate) {
    filtered = transactions.filter(tx => {
      const txTime = tx.date.getTime()
      if (startDate && txTime < startDate.getTime()) return false
      if (endDate && txTime > endDate.getTime()) return false
      return true
    })
  }
  
  // Calculate totals
  let totalIncome = 0
  let totalExpenses = 0
  const spendingByCategory: Record<TransactionCategory, number> = {
    food_dining: 0,
    groceries: 0,
    transport: 0,
    gas: 0,
    entertainment: 0,
    shopping: 0,
    bills: 0,
    utilities: 0,
    income: 0,
    transfer: 0,
    other: 0
  }
  
  filtered.forEach(tx => {
    if (tx.type === 'credit') {
      totalIncome += Math.abs(tx.amount)
    } else {
      totalExpenses += Math.abs(tx.amount)
      spendingByCategory[tx.category] += Math.abs(tx.amount)
    }
  })
  
  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netSavings: Math.round((totalIncome - totalExpenses) * 100) / 100,
    spendingByCategory,
    transactionCount: filtered.length,
    averageTransaction: filtered.length > 0 
      ? Math.round((totalExpenses / filtered.filter(tx => tx.type === 'debit').length) * 100) / 100
      : 0
  }
}

/**
 * Update account balance based on transactions
 */
export function updateAccountBalance(account: Account, transactions: Transaction[]): Account {
  const accountTransactions = transactions.filter(tx => tx.accountId === account.id)
  
  let balance = account.balance
  
  accountTransactions.forEach(tx => {
    // Subtract debits, add credits (amounts are positive for debits, negative for credits)
    balance -= tx.amount
  })
  
  return {
    ...account,
    balance: Math.round(balance * 100) / 100,
    available: Math.round(balance * 100) / 100
  }
}

// ============================================================================
// SIMULATOR INITIALIZATION
// ============================================================================

/**
 * Initialize simulator with account and initial transactions
 */
export function initializeSimulator(): SimulatorState {
  const account = generateAccount()
  const transactions = generateInitialTransactions(account.id)
  
  // Update account balance based on initial transactions
  const updatedAccount = updateAccountBalance(account, transactions)
  
  return {
    accounts: [updatedAccount],
    transactions,
    lastSimulatedDate: new Date(),
    daysActive: 0
  }
}

/**
 * Update simulator state (call this periodically)
 */
export function updateSimulator(state: SimulatorState): SimulatorState {
  const currentDate = new Date()
  const newTransactions = simulateNewTransactions(state, currentDate)
  
  if (newTransactions.length === 0) {
    return state
  }
  
  const allTransactions = [...newTransactions, ...state.transactions]
  const updatedAccount = updateAccountBalance(state.accounts[0], newTransactions)
  
  return {
    accounts: [updatedAccount],
    transactions: allTransactions,
    lastSimulatedDate: currentDate,
    daysActive: state.daysActive + 1
  }
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

export function getCategoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
    food_dining: 'Food & Dining',
    groceries: 'Groceries',
    transport: 'Transportation',
    gas: 'Gas & Fuel',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    bills: 'Bills & Payments',
    utilities: 'Utilities',
    income: 'Income',
    transfer: 'Transfers',
    other: 'Other'
  }
  return labels[category]
}

export function getCategoryIcon(category: TransactionCategory): string {
  const icons: Record<TransactionCategory, string> = {
    food_dining: '🍽️',
    groceries: '🛒',
    transport: '🚗',
    gas: '⛽',
    entertainment: '🎬',
    shopping: '🛍️',
    bills: '📄',
    utilities: '💡',
    income: '💰',
    transfer: '↔️',
    other: '📦'
  }
  return icons[category]
}

export function getCategoryColor(category: TransactionCategory): string {
  const colors: Record<TransactionCategory, string> = {
    food_dining: 'oklch(0.65 0.20 30)',      // Orange
    groceries: 'oklch(0.55 0.18 145)',       // Green
    transport: 'oklch(0.60 0.16 240)',       // Blue
    gas: 'oklch(0.68 0.18 80)',              // Yellow
    entertainment: 'oklch(0.60 0.22 290)',   // Purple
    shopping: 'oklch(0.65 0.20 350)',        // Pink
    bills: 'oklch(0.50 0.18 230)',           // Dark Blue
    utilities: 'oklch(0.70 0.16 80)',        // Light Yellow
    income: 'oklch(0.60 0.18 145)',          // Green
    transfer: 'oklch(0.50 0 0)',             // Gray
    other: 'oklch(0.60 0.12 220)',           // Muted Blue
  }
  return colors[category]
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Math.abs(amount))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  initializeSimulator,
  updateSimulator,
  generateTransaction,
  calculateFinancialSummary,
  getCategoryLabel,
  getCategoryIcon,
  getCategoryColor,
  formatCurrency,
  formatDate,
  formatDateShort
}
