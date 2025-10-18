import { User, Chalkboard, Users } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/security'

interface RoleSelectorProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const roles: Array<{
    id: UserRole
    label: string
    description: string
    icon: typeof User
    permissions: string[]
  }> = [
    {
      id: 'student',
      label: 'Student',
      description: 'Learn financial literacy through games',
      icon: User,
      permissions: [
        'Access your own progress and games',
        'Track personal achievements',
        'Export your own data',
        'Complete quests and earn rewards'
      ]
    },
    {
      id: 'teacher',
      label: 'Teacher',
      description: 'Monitor and guide student progress',
      icon: Chalkboard,
      permissions: [
        'View data for assigned class students',
        'Track class-wide progress',
        'Manage class assignments',
        'Export class reports'
      ]
    },
    {
      id: 'parent',
      label: 'Parent',
      description: 'Monitor your children\'s learning',
      icon: Users,
      permissions: [
        'View children\'s progress',
        'Track learning milestones',
        'Export progress reports',
        'View read-only data'
      ]
    }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your Role</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'll use FinanceQuest Pro. This determines what data you can access.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = currentRole === role.id

          return (
            <Card
              key={role.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'hover:border-primary/50 hover:bg-accent/50'
              }`}
              onClick={() => onRoleChange(role.id)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="w-5 h-5" weight="fill" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{role.label}</h4>
                      {isSelected && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Current Role
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{role.description}</p>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Permissions:
                  </p>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isSelected && (
                  <Button className="w-full" size="sm" disabled>
                    Active Role
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Role changes are saved to your profile. Teachers and Parents 
          may need to configure class assignments or child connections in settings to access 
          student data.
        </p>
      </div>
    </div>
  )
}
