export type TransactionCategory = 'Food' | 'Transport' | 'Entertainment' | 'Bills' | 'Shopping' | 'Income' | 'Other'

export interface Transaction {
  id: string
  date: string
  merchant: string
  amount: number
  category: TransactionCategory
  isIncome: boolean
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  lastUpdated: string
}

export interface BankingSummary {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  categoryBreakdown: Record<TransactionCategory, number>
}

export interface BankingProvider {
  isSimulated: boolean
  getAccounts(): Promise<Account[]>
  getTransactions(accountId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]>
  getSummary(accountId: string, month: number, year: number): Promise<BankingSummary>
  refreshData(): Promise<void>
}
