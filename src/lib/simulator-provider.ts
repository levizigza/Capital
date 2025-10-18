import type { BankingProvider, Account, Transaction, BankingSummary, TransactionCategory } from './banking-provider'

interface MerchantTemplate {
  name: string
  category: TransactionCategory
  minAmount: number
  maxAmount: number
  isRecurring?: boolean
  recurringDay?: number
}

const MERCHANT_TEMPLATES: MerchantTemplate[] = [
  { name: 'Starbucks', category: 'Food', minAmount: 4.5, maxAmount: 8.5 },
  { name: 'Chipotle', category: 'Food', minAmount: 10, maxAmount: 15 },
  { name: 'Safeway', category: 'Food', minAmount: 30, maxAmount: 120 },
  { name: 'Whole Foods', category: 'Food', minAmount: 40, maxAmount: 150 },
  { name: 'McDonald\'s', category: 'Food', minAmount: 6, maxAmount: 12 },
  { name: 'Subway', category: 'Food', minAmount: 7, maxAmount: 11 },
  
  { name: 'Shell Gas Station', category: 'Transport', minAmount: 35, maxAmount: 75 },
  { name: 'Chevron', category: 'Transport', minAmount: 30, maxAmount: 80 },
  { name: 'Uber', category: 'Transport', minAmount: 8, maxAmount: 35 },
  { name: 'Lyft', category: 'Transport', minAmount: 9, maxAmount: 40 },
  
  { name: 'Netflix', category: 'Entertainment', minAmount: 15.99, maxAmount: 15.99, isRecurring: true, recurringDay: 15 },
  { name: 'Spotify', category: 'Entertainment', minAmount: 10.99, maxAmount: 10.99, isRecurring: true, recurringDay: 1 },
  { name: 'AMC Theaters', category: 'Entertainment', minAmount: 12, maxAmount: 25 },
  { name: 'Steam', category: 'Entertainment', minAmount: 5, maxAmount: 60 },
  { name: 'Amazon Prime', category: 'Entertainment', minAmount: 14.99, maxAmount: 14.99, isRecurring: true, recurringDay: 5 },
  
  { name: 'AT&T', category: 'Bills', minAmount: 65, maxAmount: 85, isRecurring: true, recurringDay: 10 },
  { name: 'PG&E', category: 'Bills', minAmount: 80, maxAmount: 150, isRecurring: true, recurringDay: 20 },
  { name: 'Comcast', category: 'Bills', minAmount: 70, maxAmount: 120, isRecurring: true, recurringDay: 12 },
  { name: 'State Farm Insurance', category: 'Bills', minAmount: 120, maxAmount: 180, isRecurring: true, recurringDay: 1 },
  
  { name: 'Target', category: 'Shopping', minAmount: 25, maxAmount: 150 },
  { name: 'Amazon.com', category: 'Shopping', minAmount: 15, maxAmount: 200 },
  { name: 'Walmart', category: 'Shopping', minAmount: 20, maxAmount: 100 },
  { name: 'Best Buy', category: 'Shopping', minAmount: 50, maxAmount: 300 },
]

interface SimulatorState {
  accounts: Account[]
  transactions: Transaction[]
  lastTransactionDate: string
  daysInApp: number
}

export class SimulatorBankingProvider implements BankingProvider {
  isSimulated = true
  private storageKey = 'banking-simulator-state'

  private async getState(): Promise<SimulatorState | null> {
    const data = await window.spark.kv.get<SimulatorState>(this.storageKey)
    return data || null
  }

  private async setState(state: SimulatorState): Promise<void> {
    await window.spark.kv.set(this.storageKey, state)
  }

  private async initializeState(): Promise<SimulatorState> {
    const startingBalance = Math.floor(Math.random() * 1500) + 500
    const now = new Date()
    
    const account: Account = {
      id: 'sim-checking-001',
      name: 'Practice Checking',
      type: 'checking',
      balance: startingBalance,
      lastUpdated: now.toISOString()
    }

    const transactions: Transaction[] = []
    let runningBalance = startingBalance

    const numTransactions = Math.floor(Math.random() * 6) + 5
    
    for (let i = 0; i < numTransactions; i++) {
      const daysAgo = Math.floor(Math.random() * 30) + 1
      const transactionDate = new Date(now)
      transactionDate.setDate(transactionDate.getDate() - daysAgo)
      transactionDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
      
      const merchant = MERCHANT_TEMPLATES[Math.floor(Math.random() * MERCHANT_TEMPLATES.length)]
      const amount = -(Math.random() * (merchant.maxAmount - merchant.minAmount) + merchant.minAmount)
      
      runningBalance -= Math.abs(amount)
      
      transactions.push({
        id: `sim-txn-${Date.now()}-${i}`,
        date: transactionDate.toISOString(),
        merchant: merchant.name,
        amount: Math.round(amount * 100) / 100,
        category: merchant.category,
        isIncome: false
      })
    }

    const paycheckDate = new Date(now)
    paycheckDate.setDate(paycheckDate.getDate() - (Math.floor(Math.random() * 14) + 14))
    paycheckDate.setHours(9, 0)
    
    const paycheckAmount = Math.floor(Math.random() * 400) + 600
    runningBalance += paycheckAmount
    
    transactions.push({
      id: `sim-txn-${Date.now()}-paycheck`,
      date: paycheckDate.toISOString(),
      merchant: 'Direct Deposit - Paycheck',
      amount: paycheckAmount,
      category: 'Income',
      isIncome: true
    })

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    account.balance = Math.round(runningBalance * 100) / 100

    const state: SimulatorState = {
      accounts: [account],
      transactions,
      lastTransactionDate: now.toISOString(),
      daysInApp: 0
    }

    await this.setState(state)
    return state
  }

  async getAccounts(): Promise<Account[]> {
    let state = await this.getState()
    if (!state) {
      state = await this.initializeState()
    }
    return state.accounts
  }

  async getTransactions(accountId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    let state = await this.getState()
    if (!state) {
      state = await this.initializeState()
    }

    let transactions = state.transactions.filter(t => t.id.startsWith('sim-'))

    if (startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= startDate)
    }
    if (endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= endDate)
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getSummary(accountId: string, month: number, year: number): Promise<BankingSummary> {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    const transactions = await this.getTransactions(accountId, startDate, endDate)

    const summary: BankingSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      categoryBreakdown: {
        Food: 0,
        Transport: 0,
        Entertainment: 0,
        Bills: 0,
        Shopping: 0,
        Income: 0,
        Other: 0
      }
    }

    transactions.forEach(txn => {
      if (txn.isIncome) {
        summary.totalIncome += txn.amount
      } else {
        summary.totalExpenses += Math.abs(txn.amount)
      }
      
      summary.categoryBreakdown[txn.category] += Math.abs(txn.amount)
    })

    summary.netSavings = summary.totalIncome - summary.totalExpenses

    Object.keys(summary.categoryBreakdown).forEach(key => {
      summary.categoryBreakdown[key as TransactionCategory] = Math.round(summary.categoryBreakdown[key as TransactionCategory] * 100) / 100
    })
    summary.totalIncome = Math.round(summary.totalIncome * 100) / 100
    summary.totalExpenses = Math.round(summary.totalExpenses * 100) / 100
    summary.netSavings = Math.round(summary.netSavings * 100) / 100

    return summary
  }

  async refreshData(): Promise<void> {
    let state = await this.getState()
    if (!state) {
      state = await this.initializeState()
      return
    }

    const now = new Date()
    const lastDate = new Date(state.lastTransactionDate)
    const daysSinceLastCheck = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceLastCheck >= 1) {
      const newDaysInApp = state.daysInApp + daysSinceLastCheck
      const transactionsToAdd: Transaction[] = []

      for (let day = 1; day <= daysSinceLastCheck; day++) {
        const currentDay = state.daysInApp + day

        if (currentDay % 14 === 0) {
          const paycheckDate = new Date(lastDate)
          paycheckDate.setDate(paycheckDate.getDate() + day)
          paycheckDate.setHours(9, 0)
          
          const paycheckAmount = Math.floor(Math.random() * 400) + 600
          
          transactionsToAdd.push({
            id: `sim-txn-${Date.now()}-${day}-paycheck`,
            date: paycheckDate.toISOString(),
            merchant: 'Direct Deposit - Paycheck',
            amount: paycheckAmount,
            category: 'Income',
            isIncome: true
          })
        }

        const recurringForDay = MERCHANT_TEMPLATES.filter(m => m.isRecurring && m.recurringDay === new Date(lastDate.getTime() + day * 24 * 60 * 60 * 1000).getDate())
        
        recurringForDay.forEach(merchant => {
          const txnDate = new Date(lastDate)
          txnDate.setDate(txnDate.getDate() + day)
          txnDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
          
          transactionsToAdd.push({
            id: `sim-txn-${Date.now()}-${day}-${merchant.name}`,
            date: txnDate.toISOString(),
            merchant: merchant.name,
            amount: -merchant.minAmount,
            category: merchant.category,
            isIncome: false
          })
        })

        if (Math.random() < 0.4) {
          const randomMerchants = MERCHANT_TEMPLATES.filter(m => !m.isRecurring)
          const merchant = randomMerchants[Math.floor(Math.random() * randomMerchants.length)]
          const amount = -(Math.random() * (merchant.maxAmount - merchant.minAmount) + merchant.minAmount)
          
          const txnDate = new Date(lastDate)
          txnDate.setDate(txnDate.getDate() + day)
          txnDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))
          
          transactionsToAdd.push({
            id: `sim-txn-${Date.now()}-${day}-random`,
            date: txnDate.toISOString(),
            merchant: merchant.name,
            amount: Math.round(amount * 100) / 100,
            category: merchant.category,
            isIncome: false
          })
        }
      }

      const allTransactions = [...state.transactions, ...transactionsToAdd]
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const newBalance = state.accounts[0].balance + transactionsToAdd.reduce((sum, txn) => sum + txn.amount, 0)

      state.accounts[0].balance = Math.round(newBalance * 100) / 100
      state.accounts[0].lastUpdated = now.toISOString()
      state.transactions = allTransactions
      state.lastTransactionDate = now.toISOString()
      state.daysInApp = newDaysInApp

      await this.setState(state)
    }
  }

  async resetSimulator(): Promise<void> {
    await window.spark.kv.delete(this.storageKey)
    await this.initializeState()
  }
}
