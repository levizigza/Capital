import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { House, GameController, User, Globe } from '@phosphor-icons/react'
import type { UserProfile, GameScore } from '@/App'
import OverviewTab from './dashboard/OverviewTab'
import AnalyticsTab from './dashboard/AnalyticsTab'
import GoalsTab from './dashboard/GoalsTab'
import AchievementsTab from './dashboard/AchievementsTab'
import InsightsTab from './dashboard/InsightsTab'

interface StructuredModeDashboardProps {
  userProfile: UserProfile
  gameScores: GameScore[]
  onModeSwitch: () => void
  onOpenProfile: () => void
}

type Language = 'en' | 'fr'

const translations = {
  en: {
    overview: 'Overview',
    analytics: 'Analytics',
    goals: 'Goals',
    achievements: 'Achievements',
    insights: 'Insights',
    home: 'Home',
    switchMode: 'Switch to Creative',
    profile: 'Profile',
  },
  fr: {
    overview: 'Aperçu',
    analytics: 'Analytique',
    goals: 'Objectifs',
    achievements: 'Réalisations',
    insights: 'Perspectives',
    home: 'Accueil',
    switchMode: 'Mode Créatif',
    profile: 'Profil',
  },
}

export default function StructuredModeDashboard({
  userProfile,
  gameScores,
  onModeSwitch,
  onOpenProfile,
}: StructuredModeDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [language, setLanguage] = useState<Language>('en')

  const t = translations[language]

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'fr' : 'en'))
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">
                FinanceQuest Pro
              </h1>
              <div className="hidden sm:block text-sm text-muted-foreground">
                Structured Mode
              </div>
            </div>

            <nav className="flex items-center gap-2" role="navigation" aria-label="Main navigation">
              <Button
                variant="ghost"
                size="sm"
                onClick={onModeSwitch}
                className="gap-2"
                aria-label={t.home}
              >
                <House weight="fill" size={20} />
                <span className="hidden sm:inline">{t.home}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onModeSwitch}
                className="gap-2"
                aria-label={t.switchMode}
              >
                <GameController weight="fill" size={20} />
                <span className="hidden sm:inline">{t.switchMode}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenProfile}
                className="gap-2"
                aria-label={t.profile}
              >
                <User weight="fill" size={20} />
                <span className="hidden sm:inline">{t.profile}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2"
                aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
              >
                <Globe weight="fill" size={20} />
                <span className="text-xs font-semibold">
                  {language.toUpperCase()}
                </span>
              </Button>
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full max-w-3xl mx-auto">
            <TabsTrigger value="overview" className="gap-2">
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              {t.analytics}
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              {t.goals}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              {t.achievements}
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              {t.insights}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              userProfile={userProfile}
              gameScores={gameScores}
              language={language}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab
              userProfile={userProfile}
              gameScores={gameScores}
              language={language}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsTab
              userProfile={userProfile}
              language={language}
            />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementsTab
              userProfile={userProfile}
              language={language}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <InsightsTab
              userProfile={userProfile}
              gameScores={gameScores}
              language={language}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
