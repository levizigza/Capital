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
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('dashboard')}>
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
              <Button className="w-full mt-4">
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('settings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <GearSix className="w-6 h-6 text-purple-500" weight="fill" />
                </div>
                Banking Settings
              </CardTitle>
              <CardDescription>
                Configure data source and simulator options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Switch between simulator and real banking</li>
                <li>• Reset practice data</li>
                <li>• Manage bank connections</li>
                <li>• Configure preferences</li>
              </ul>
              <Button variant="outline" className="w-full mt-4">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
