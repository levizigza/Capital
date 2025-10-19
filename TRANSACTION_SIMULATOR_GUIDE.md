# Transaction Simulator - Practice Mode Guide
## Realistic Financial Data Without Real Bank Connections

---

## 🎯 Overview

The Transaction Simulator generates realistic but fake financial data, allowing users to experience FinanceQuest's full functionality without connecting real bank accounts. It's designed to be easily swappable with real Plaid API integration.

---

## 🎮 Key Features

### ✅ Synthetic Account Generation
- **Checking account** with randomized starting balance ($500-$2000)
- Account number mask (last 4 digits)
- "Simulator Bank" institution name
- Available and current balance tracking

### ✅ Initial Transaction History
- **5-10 past transactions** automatically generated
- Scattered realistically over past 30 days
- Mix of expenses and income
- Categorized by spending type

### ✅ Dynamic Transaction Generation
- **New transactions** appear every 1-3 days of app usage
- **Recurring transactions** (Netflix, Spotify, Phone Bill, Paycheck)
- **Random purchases** (groceries, gas, dining, shopping)
- **Income deposits** (Paychecks every 2 weeks)

### ✅ Financial Summary Analytics
- Total income this month
- Total spending this month
- Net savings calculation
- Spending by category breakdown
- Transaction count and averages

### ✅ Mode Toggle
- Easy switch between Simulator and Real Banking
- Settings page control
- Clear visual indicators

---

## 📊 Generated Data Details

### Account Information
```typescript
{
  id: "sim_1234567890_abc123",
  name: "Practice Checking Account",
  type: "checking",
  balance: 1247.89,        // Random $500-$2000
  available: 1247.89,
  mask: "4521",            // Random last 4 digits
  institution: "Simulator Bank"
}
```

### Transaction Categories (11 types)
1. **🍽️ Food & Dining** - Restaurants, coffee shops ($5-$45)
2. **🛒 Groceries** - Supermarkets, grocery stores ($30-$150)
3. **🚗 Transportation** - Uber, Lyft, transit ($8-$35)
4. **⛽ Gas & Fuel** - Gas stations ($25-$75)
5. **🎬 Entertainment** - Streaming, movies, games ($10-$60)
6. **🛍️ Shopping** - Retail, online shopping ($15-$200)
7. **📄 Bills & Payments** - Phone, cable, credit cards ($50-$150)
8. **💡 Utilities** - Electric, water, gas ($40-$120)
9. **💰 Income** - Paychecks, freelance ($500-$1200)
10. **↔️ Transfers** - Account transfers ($50-$500)
11. **📦 Other** - Miscellaneous ($10-$100)

### Real Merchants (70+ options)

**Food & Dining:**
- Starbucks, McDonald's, Chipotle, Subway, Panera Bread
- Olive Garden, Red Lobster, Pizza Hut, Taco Bell, Wendy's
- Five Guys, Cheesecake Factory, Buffalo Wild Wings

**Groceries:**
- Safeway, Whole Foods, Trader Joe's, Costco, Target
- Walmart, Kroger, Publix, Albertsons

**Gas Stations:**
- Shell, Chevron, BP, Exxon, Mobil, Circle K

**Entertainment:**
- Netflix, Spotify, Disney+, HBO Max, Hulu
- Amazon Prime, PlayStation Store, AMC Theatres

**Shopping:**
- Amazon.com, Target, Best Buy, Macy's, Nike
- Home Depot, IKEA, Nordstrom

**Bills:**
- Verizon, AT&T, Comcast, Electric Company
- Insurance payments, credit card payments

### Recurring Transactions (Auto-generated monthly)
```typescript
Netflix        $15.99  every 1st
Spotify        $9.99   every 5th
Phone Bill     $45.00  every 10th
Electric Bill  $85.50  every 15th
Internet       $60.00  every 20th
Paycheck       $800.00 every 1st and 15th
```

---

## 🔄 How It Works

### 1. Initialization
```typescript
import { initializeSimulator } from '@/lib/transaction-simulator'

// Create initial state
const simulatorState = initializeSimulator()

// Returns:
// - 1 checking account ($500-$2000)
// - 5-10 past transactions (last 30 days)
// - Updated account balance
// - Starting date
```

### 2. Periodic Updates
```typescript
import { updateSimulator } from '@/lib/transaction-simulator'

// Call periodically (e.g., on app open, daily check)
const updatedState = updateSimulator(currentState)

// Automatically adds:
// - Recurring transactions if due
// - Random transactions (1 per 1-3 days)
// - Updates account balance
```

### 3. Transaction Generation Logic

**Random Transactions:**
- Frequency: 1 transaction every 1-3 days of app usage
- Categories weighted (food/groceries more common)
- Amounts randomized within category ranges
- Dates scattered across time period
- 10% chance of "pending" status

**Recurring Transactions:**
- Triggered on specific day of month
- Fixed amounts and merchants
- Marked as `recurring: true`
- Includes bi-weekly paychecks

**Balance Updates:**
- Debits increase expenses (positive amounts)
- Credits increase income (negative amounts)
- Account balance automatically recalculated
- Available balance updated simultaneously

---

## 📊 Financial Summary

### Monthly Summary Calculation
```typescript
import { calculateFinancialSummary } from '@/lib/transaction-simulator'

const summary = calculateFinancialSummary(
  transactions,
  startOfMonth,  // Optional
  endOfMonth     // Optional
)

// Returns:
{
  totalIncome: 1600.00,      // All credits
  totalExpenses: 847.32,     // All debits
  netSavings: 752.68,        // Income - Expenses
  spendingByCategory: {
    food_dining: 145.67,
    groceries: 234.50,
    transport: 42.00,
    gas: 67.80,
    entertainment: 41.97,
    // ...
  },
  transactionCount: 23,
  averageTransaction: 36.84
}
```

### Category Breakdown
Perfect for pie charts and spending analysis:
```typescript
const { spendingByCategory } = summary

// Display in UI:
Food & Dining:    $145.67  (17.2%)
Groceries:        $234.50  (27.7%)
Transportation:   $42.00   (5.0%)
Entertainment:    $41.97   (5.0%)
...
```

---

## 🎨 UI Integration

### Mode Banner (Dashboard Header)
```tsx
{isSimulatorMode ? (
  <Banner variant="info">
    🎮 Playing with practice data - your real money is safe
  </Banner>
) : (
  <Banner variant="success">
    🔗 Connected to your real accounts
  </Banner>
)}
```

### Account Card
```tsx
<AccountCard>
  <AccountName>Practice Checking Account</AccountName>
  <Institution>Simulator Bank</Institution>
  <AccountMask>****{account.mask}</AccountMask>
  <Balance>${account.balance.toFixed(2)}</Balance>
  <Available>${account.available.toFixed(2)} available</Available>
</AccountCard>
```

### Transaction List
```tsx
<TransactionList>
  {transactions.map(tx => (
    <TransactionItem key={tx.id}>
      <Icon>{getCategoryIcon(tx.category)}</Icon>
      <Details>
        <Merchant>{tx.merchantName}</Merchant>
        <Date>{formatDate(tx.date)}</Date>
        <Category>{getCategoryLabel(tx.category)}</Category>
      </Details>
      <Amount type={tx.type}>
        {tx.type === 'debit' ? '-' : '+'}
        {formatCurrency(tx.amount)}
      </Amount>
      {tx.pending && <PendingBadge>Pending</PendingBadge>}
      {tx.recurring && <RecurringIcon>🔄</RecurringIcon>}
    </TransactionItem>
  ))}
</TransactionList>
```

### Spending Summary Cards
```tsx
<SummaryCards>
  <Card>
    <Title>💰 Income This Month</Title>
    <Amount positive>{formatCurrency(summary.totalIncome)}</Amount>
  </Card>
  
  <Card>
    <Title>💸 Spending This Month</Title>
    <Amount negative>{formatCurrency(summary.totalExpenses)}</Amount>
  </Card>
  
  <Card>
    <Title>📊 Net Savings</Title>
    <Amount positive={summary.netSavings > 0}>
      {formatCurrency(summary.netSavings)}
    </Amount>
  </Card>
</SummaryCards>
```

### Category Pie Chart
```tsx
<PieChart>
  {Object.entries(summary.spendingByCategory)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => (
      <Slice
        key={category}
        value={amount}
        label={getCategoryLabel(category)}
        color={getCategoryColor(category)}
      />
    ))}
</PieChart>
```

---

## ⚙️ Settings Integration

### Mode Toggle in Settings
```tsx
<SettingsSection title="Banking Connection">
  <SettingRow>
    <Label>
      <Title>Banking Mode</Title>
      <Description>
        Choose between practice data or real bank accounts
      </Description>
    </Label>
    <Toggle
      checked={!isSimulatorMode}
      onChange={handleModeToggle}
      labels={['Simulator', 'Real Banking']}
    />
  </SettingRow>
  
  {isSimulatorMode ? (
    <InfoBox>
      🎮 Currently using simulator mode with practice data.
      Your real financial information is safe.
    </InfoBox>
  ) : (
    <InfoBox>
      🔗 Connected to real bank accounts via Plaid.
      <Button onClick={handleDisconnect}>Disconnect</Button>
    </InfoBox>
  )}
</SettingsSection>
```

---

## 🔄 Migration to Real Plaid API

The simulator is designed for easy replacement with real banking:

### Step 1: Create Banking Provider Interface
```typescript
// src/lib/banking-provider.ts
interface BankingProvider {
  getAccounts(): Promise<Account[]>
  getTransactions(startDate: Date, endDate: Date): Promise<Transaction[]>
  refreshData(): Promise<void>
}

// Simulator implementation
class SimulatorProvider implements BankingProvider {
  async getAccounts() {
    const state = getSimulatorState()
    return state.accounts
  }
  
  async getTransactions(startDate, endDate) {
    const state = getSimulatorState()
    return state.transactions.filter(/* date range */)
  }
  
  async refreshData() {
    const state = updateSimulator(getSimulatorState())
    saveSimulatorState(state)
  }
}

// Plaid implementation
class PlaidProvider implements BankingProvider {
  async getAccounts() {
    const response = await plaidClient.accountsGet(/* ... */)
    return response.accounts.map(convertToAccount)
  }
  
  async getTransactions(startDate, endDate) {
    const response = await plaidClient.transactionsGet(/* ... */)
    return response.transactions.map(convertToTransaction)
  }
  
  async refreshData() {
    await plaidClient.transactionsRefresh(/* ... */)
  }
}
```

### Step 2: Use Provider Pattern in Components
```tsx
function FinancialDashboard() {
  const provider = useBankingProvider() // Returns Simulator or Plaid
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  useEffect(() => {
    provider.getAccounts().then(setAccounts)
    provider.getTransactions(startDate, endDate).then(setTransactions)
  }, [provider])
  
  // UI renders identically for both providers
  return (
    <Dashboard>
      <ModeIndicator isSimulator={provider instanceof SimulatorProvider} />
      <AccountList accounts={accounts} />
      <TransactionHistory transactions={transactions} />
      <SpendingSummary transactions={transactions} />
    </Dashboard>
  )
}
```

### Step 3: Provider Selection
```typescript
function useBankingProvider(): BankingProvider {
  const { isSimulatorMode } = useSettings()
  
  return useMemo(() => {
    if (isSimulatorMode) {
      return new SimulatorProvider()
    } else {
      return new PlaidProvider()
    }
  }, [isSimulatorMode])
}
```

**Result**: UI components don't need to change when switching from simulator to real banking!

---

## 📦 Data Persistence

### LocalStorage Strategy
```typescript
// Save simulator state
function saveSimulatorState(state: SimulatorState) {
  localStorage.setItem('financequest_simulator', JSON.stringify({
    ...state,
    lastSimulatedDate: state.lastSimulatedDate.toISOString(),
    transactions: state.transactions.map(tx => ({
      ...tx,
      date: tx.date.toISOString()
    }))
  }))
}

// Load simulator state
function loadSimulatorState(): SimulatorState | null {
  const saved = localStorage.getItem('financequest_simulator')
  if (!saved) return null
  
  const parsed = JSON.parse(saved)
  return {
    ...parsed,
    lastSimulatedDate: new Date(parsed.lastSimulatedDate),
    transactions: parsed.transactions.map(tx => ({
      ...tx,
      date: new Date(tx.date)
    }))
  }
}

// Initialize or load
function getSimulatorState(): SimulatorState {
  const existing = loadSimulatorState()
  if (existing) {
    // Update with any new transactions
    return updateSimulator(existing)
  }
  
  // Create new
  const newState = initializeSimulator()
  saveSimulatorState(newState)
  return newState
}
```

---

## 🎯 Usage Examples

### Example 1: First-Time User
```
Day 1: User opens app
├─ Simulator auto-initializes
├─ Account created: $1,247.89
├─ 7 past transactions generated:
│  ├─ 28 days ago: Safeway -$87.43
│  ├─ 25 days ago: Shell -$45.20
│  ├─ 22 days ago: Starbucks -$6.75
│  ├─ 18 days ago: Netflix -$15.99
│  ├─ 15 days ago: Paycheck +$800.00
│  ├─ 10 days ago: Target -$124.56
│  └─ 3 days ago: Chipotle -$12.85
└─ Balance updated: $1,755.99
```

### Example 2: Recurring Income
```
Day 15: Paycheck auto-generated
├─ New transaction added:
│  └─ Paycheck - Employer +$800.00
├─ Balance updated: $2,555.99
└─ Summary recalculated:
   ├─ Total Income: $1,600.00
   ├─ Total Expenses: $847.32
   └─ Net Savings: +$752.68
```

### Example 3: Daily Activity
```
Day 3: Random transactions
├─ 2 new transactions:
│  ├─ Whole Foods -$123.45
│  └─ Uber -$18.50
├─ Balance: $2,413.04
└─ Category breakdown updated
```

---

## ✅ Benefits

### For Users
- ✅ Safe practice environment
- ✅ Realistic transaction patterns
- ✅ No real financial risk
- ✅ Full feature exploration
- ✅ Build confidence before connecting real accounts

### For Developers
- ✅ Development without real API credentials
- ✅ Consistent test data
- ✅ Easy debugging
- ✅ No rate limits
- ✅ Instant setup

### For Product
- ✅ Demo mode for presentations
- ✅ Onboarding tutorials with real data
- ✅ Lower barrier to entry
- ✅ User testing without privacy concerns
- ✅ Fallback if Plaid is unavailable

---

## 🔒 Security Considerations

### Simulator Mode
- ✅ No real financial data exposed
- ✅ All data stored locally
- ✅ Clear visual indicators
- ✅ Easy to reset/clear

### Real Banking Mode
- ✅ Plaid Link integration (industry standard)
- ✅ OAuth 2.0 authentication
- ✅ Encrypted data transmission
- ✅ No storage of bank credentials
- ✅ User-controlled disconnect

---

## 📊 Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| **Transaction Generator** | ✅ Complete | src/lib/transaction-simulator.ts |
| **Account Generation** | ✅ Complete | src/lib/transaction-simulator.ts |
| **Recurring Transactions** | ✅ Complete | src/lib/transaction-simulator.ts |
| **Financial Summaries** | ✅ Complete | src/lib/transaction-simulator.ts |
| **Category System** | ✅ Complete | src/lib/transaction-simulator.ts |
| **Format Helpers** | ✅ Complete | src/lib/transaction-simulator.ts |
| **Mode Toggle UI** | ⏳ Next Phase | Settings component |
| **Dashboard Banner** | ⏳ Next Phase | Dashboard component |
| **Transaction List** | ⏳ Next Phase | Dashboard component |
| **Summary Cards** | ⏳ Next Phase | Dashboard component |
| **Category Charts** | ⏳ Next Phase | Dashboard component |
| **Plaid Integration** | ⏳ Future | banking-provider.ts |

---

## 🎉 Conclusion

The Transaction Simulator provides a complete, realistic financial experience without requiring real bank connections. It's perfect for:

- New users exploring the platform
- Development and testing
- Demos and presentations
- Users who prefer privacy
- Fallback when banking services are unavailable

**Built for easy migration to real Plaid API integration** - swap the provider, keep the UI!

---

*Last Updated: January 18, 2025*  
*Version: 1.0 - Core System Complete*
