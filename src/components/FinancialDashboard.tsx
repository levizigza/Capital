import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useBanking } from '@/hooks/use-banking'
import { 
  Wallet, 
  TrendUp, 
  TrendDown, 
  Sparkle, 
  ArrowClockwise,
  ArrowLeft,
  ShoppingBag,
  Car,
  Popcorn,
  Receipt,
  CurrencyDollar,
  Circle
} from '@phosphor-icons/react'
import type { BankingSummary, TransactionCategory } from '@/lib/banking-provider'

interface FinancialDashboardProps {
  onBack: () => void
}

const categoryIcons: Record<TransactionCategory, typeof ShoppingBag> = {
  Food: Receipt,
  Transport: Car,
  Entertainment: Popcorn,
  Bills: Receipt,
  Shopping: ShoppingBag,
  Income: CurrencyDollar,
  Other: Circle
}

const categoryColors: Record<TransactionCategory, string> = {
  Food: 'oklch(0.65 0.20 45)',
  Transport: 'oklch(0.55 0.18 220)',
  Entertainment: 'oklch(0.65 0.22 320)',
  Bills: 'oklch(0.58 0.20 25)',
  Shopping: 'oklch(0.70 0.18 280)',
  Income: 'oklch(0.55 0.18 145)',
  Other: 'oklch(0.60 0.10 240)'
}

export function FinancialDashboard({ onBack }: FinancialDashboardProps) {
  const { mode, isSimulated, accounts, transactions, loading, getSummary, refreshData } = useBanking()
  const [summary, setSummary] = useState<BankingSummary | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    loadSummary()
  }, [accounts])

  const loadSummary = async () => {
    if (accounts.length > 0) {
      const summaryData = await getSummary(accounts[0].id, currentMonth, currentYear)
      setSummary(summaryData)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    await loadSummary()
    setTimeout(() => setRefreshing(false), 500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  const getCategoryTotal = (category: TransactionCategory) => {
    return summary?.categoryBreakdown[category] || 0
  }

  const getTotalSpending = () => {
    if (!summary) return 0
    return Object.entries(summary.categoryBreakdown)
      .filter(([key]) => key !== 'Income')
      .reduce((sum, [_, value]) => sum + value, 0)
  }

  const getCategoryPercentage = (category: TransactionCategory) => {
    const total = getTotalSpending()
    if (total === 0) return 0
    return (getCategoryTotal(category) / total) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ArrowClockwise className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  const account = accounts[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft />
            Back
          </Button>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <ArrowClockwise className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg px-6 py-4 flex items-center gap-3 ${
            isSimulated 
              ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20' 
              : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'
          }`}
        >
          {isSimulated ? (
            <>
              <Sparkle className="w-6 h-6 text-purple-500" weight="fill" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  🎮 Playing with practice data - your real money is safe
                </p>
                <p className="text-sm text-muted-foreground">
                  This is simulated data for learning. Switch to real banking in settings when ready.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-6 h-6 text-green-500">🔗</div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  Connected to your real accounts
                </p>
                <p className="text-sm text-muted-foreground">
                  Viewing live data from your linked bank accounts.
                </p>
              </div>
            </>
          )}
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Track your income, expenses, and spending patterns
          </p>
        </div>

        {account && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary-foreground">
                  <Wallet weight="fill" />
                  {account.name}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Last updated: {formatDate(account.lastUpdated)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {formatCurrency(account.balance)}
                </div>
                <Badge variant="secondary" className="mt-2">
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <TrendUp className="w-4 h-4" />
                      Total Income
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary.totalIncome)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <TrendDown className="w-4 h-4" />
                      Total Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(summary.totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <Sparkle className="w-4 h-4" />
                      Net Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${summary.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.netSavings)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Income - Expenses
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>
                    Breakdown of your expenses this month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(summary.categoryBreakdown)
                    .filter(([category]) => category !== 'Income' && getCategoryTotal(category as TransactionCategory) > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => {
                      const Icon = categoryIcons[category as TransactionCategory]
                      const percentage = getCategoryPercentage(category as TransactionCategory)
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5" style={{ color: categoryColors[category as TransactionCategory] }} />
                              <span className="font-medium">{category}</span>
                            </div>
                            <span className="font-semibold">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: categoryColors[category as TransactionCategory] }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% of total spending
                          </p>
                        </div>
                      )
                    })}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest {transactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 20).map((transaction, index) => {
                  const Icon = categoryIcons[transaction.category]
                  
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${categoryColors[transaction.category]}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: categoryColors[transaction.category] }} />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.merchant}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)} • {formatTime(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.isIncome ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
