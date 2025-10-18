import type { BankingProvider, Account, Transaction, BankingSummary } from './banking-provider'

export class PlaidBankingProvider implements BankingProvider {
  isSimulated = false

  async getAccounts(): Promise<Account[]> {
    throw new Error('Plaid integration not yet implemented')
  }

  async getTransactions(): Promise<Transaction[]> {
    throw new Error('Plaid integration not yet implemented')
  }

  async getSummary(): Promise<BankingSummary> {
    throw new Error('Plaid integration not yet implemented')
  }

  async refreshData(): Promise<void> {
    throw new Error('Plaid integration not yet implemented')
  }
}
