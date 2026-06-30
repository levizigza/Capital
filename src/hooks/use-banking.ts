import { useState, useEffect } from 'react'
import { useKV } from '@/hooks/use-safe-kv'
import type { BankingProvider, Account, Transaction, BankingSummary } from '@/lib/banking-provider'
import { SimulatorBankingProvider } from '@/lib/simulator-provider'
import { PlaidBankingProvider } from '@/lib/plaid-provider'

type BankingMode = 'simulator' | 'plaid'

export function useBanking() {
  const [mode, setMode] = useKV<BankingMode>('banking-mode', 'simulator')
  const [provider, setProvider] = useState<BankingProvider | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const newProvider = mode === 'simulator' ? new SimulatorBankingProvider() : new PlaidBankingProvider()
    setProvider(newProvider)
  }, [mode])

  useEffect(() => {
    if (provider) {
      loadData()
    }
  }, [provider])

  const loadData = async (): Promise<void> => {
    if (!provider) return
    
    setLoading(true)
    try {
      await provider.refreshData()
      const accountsData = await provider.getAccounts()
      setAccounts(accountsData)
      
      if (accountsData.length > 0) {
        const txns = await provider.getTransactions(accountsData[0].id)
        setTransactions(txns)
      }
    } catch (error) {
      console.error('Failed to load banking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSummary = async (accountId: string, month: number, year: number): Promise<BankingSummary | null> => {
    if (!provider) return null
    try {
      return await provider.getSummary(accountId, month, year)
    } catch (error) {
      console.error('Failed to get summary:', error)
      return null
    }
  }

  const toggleMode = async (): Promise<void> => {
    const newMode: BankingMode = mode === 'simulator' ? 'plaid' : 'simulator'
    setMode(newMode)
  }

  const refreshData = async (): Promise<void> => {
    await loadData()
  }

  const resetSimulator = async (): Promise<void> => {
    if (provider instanceof SimulatorBankingProvider) {
      await provider.resetSimulator()
      await loadData()
    }
  }

  return {
    mode,
    isSimulated: provider?.isSimulated ?? true,
    accounts,
    transactions,
    loading,
    getSummary,
    toggleMode,
    refreshData,
    resetSimulator
  }
}
