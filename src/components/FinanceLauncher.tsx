import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bank, GearSix, ChartLine } from '@phosphor-icons/react'
import { FinancialDashboard } from './FinancialDashboard'
import { BankingSettings } from './BankingSettings'

export function FinanceLauncher() {
  const [currentView, setCurrentView] = useState<'menu' | 'dashboard' | 'settings'>('menu')

  if (currentView === 'dashboard') {
    return <FinancialDashboard onBack={() => setCurrentView('menu')} />
  }

  if (currentView === 'settings') {
    return <BankingSettings onBack={() => setCurrentView('menu')} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold">Financial Tools</h1>
          <p className="text-muted-foreground">
            Practice with simulated data or connect real accounts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('dashboard')} aria-label="Open Financial Dashboard" title="Open Financial Dashboard" data-ux-tooltip="View your financial dashboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChartLine className="w-6 h-6 text-primary" weight="fill" />
                </div>
                Financial Dashboard
              </CardTitle>
              <CardDescription>
                View your accounts, transactions, and spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Track income and expenses</li>
                <li>• View spending by category</li>
                <li>• Monitor account balance</li>
                <li>• Analyze financial trends</li>
              </ul>
              <Button className="w-full mt-4" aria-label="Open Dashboard" title="Open Dashboard" data-ux-tooltip="Go to your dashboard">
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('settings')} aria-label="Open Banking Settings" title="Open Banking Settings" data-ux-tooltip="Manage your banking settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <GearSix className="w-6 h-6 text-purple-500" weight="fill" />
                </div>
                Banking Settings
              </CardTitle>
              <CardDescription>
                Connect accounts, set preferences, and manage security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full mt-4" aria-label="Open Settings" title="Open Settings" data-ux-tooltip="Go to banking settings">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
