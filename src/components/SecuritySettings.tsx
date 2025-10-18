import { useState } from 'react'
import { Shield, Clock, Key, SignOut, WarningCircle, Chalkboard } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RoleSelector } from './RoleSelector'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { SecurityService } from '@/lib/security'

export function SecuritySettings() {
  const {
    githubUser,
    session,
    userProfile,
    setRememberMe,
    changeRole,
    assignClasses,
    handleLogout,
    permissions
  } = useAuth()

  const [classInput, setClassInput] = useState('')

  const handleRememberMeToggle = (checked: boolean) => {
    setRememberMe(checked)
    toast.success(checked ? 'Session extended to 30 days' : 'Session will expire after 30 minutes of inactivity')
  }

  const handleAddClass = () => {
    if (!classInput.trim()) return

    const sanitized = SecurityService.sanitizeInput(classInput)
    const currentClasses = userProfile?.assignedClasses || []
    
    if (currentClasses.includes(sanitized)) {
      toast.error('Class already added')
      return
    }

    assignClasses([...currentClasses, sanitized])
    setClassInput('')
    toast.success('Class added successfully')
  }

  const handleRemoveClass = (classToRemove: string) => {
    const currentClasses = userProfile?.assignedClasses || []
    assignClasses(currentClasses.filter(c => c !== classToRemove))
    toast.success('Class removed')
  }

  const getSessionTimeRemaining = () => {
    if (!session) return 'No active session'
    
    const now = Date.now()
    const timeSinceActivity = now - session.lastActivity
    const timeout = session.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000
    const remaining = timeout - timeSinceActivity
    
    if (remaining <= 0) return 'Session expired'
    
    const minutes = Math.floor(remaining / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" weight="fill" />
            Authentication & Account
          </CardTitle>
          <CardDescription>
            Signed in with GitHub. Your account is secure and authenticated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {githubUser && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {githubUser.avatarUrl && (
                <img 
                  src={githubUser.avatarUrl} 
                  alt={githubUser.login}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold">{githubUser.login}</p>
                <p className="text-sm text-muted-foreground">{githubUser.email}</p>
              </div>
              <Badge variant="secondary">
                {githubUser.isOwner ? 'Owner' : 'User'}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="remember-me" className="text-base">Remember Me</Label>
              <p className="text-sm text-muted-foreground">
                Keep me signed in for 30 days
              </p>
            </div>
            <Switch
              id="remember-me"
              checked={session?.rememberMe || false}
              onCheckedChange={handleRememberMeToggle}
            />
          </div>

          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Session expires in:
              </span>
              <span className="font-semibold">{getSessionTimeRemaining()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Key className="w-4 h-4" />
                Session type:
              </span>
              <span className="font-semibold">
                {session?.rememberMe ? 'Extended' : 'Standard'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <SignOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Role & Permissions</CardTitle>
          <CardDescription>
            Your role determines what data you can access in the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProfile && (
            <RoleSelector
              currentRole={userProfile.role}
              onRoleChange={changeRole}
            />
          )}

          {permissions && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Active Permissions:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-muted'}`} />
                    <span className="text-muted-foreground">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {userProfile?.role === 'teacher' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chalkboard className="w-5 h-5" />
              Assigned Classes
            </CardTitle>
            <CardDescription>
              Manage which classes you can access student data for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter class name (e.g., Math 101)"
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                maxLength={50}
              />
              <Button onClick={handleAddClass}>Add</Button>
            </div>

            <div className="space-y-2">
              {userProfile.assignedClasses?.map((cls) => (
                <div
                  key={cls}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">{cls}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClass(cls)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {(!userProfile.assignedClasses || userProfile.assignedClasses.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No classes assigned yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <WarningCircle className="w-5 h-5" weight="fill" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Sessions automatically timeout after inactivity</li>
            <li>• All inputs are sanitized to prevent injection attacks</li>
            <li>• Rate limiting prevents abuse (100 requests/minute)</li>
            <li>• Role-based access ensures data privacy</li>
            <li>• Your data is stored locally and never transmitted</li>
            <li>• Sign out when using shared devices</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
