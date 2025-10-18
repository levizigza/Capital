import { Shield, Lock } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export function SecureFooter() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
              <Lock className="w-3 h-3 mr-1" weight="fill" />
              Secure Connection
            </Badge>
            <span className="text-xs text-muted-foreground">
              Your data is encrypted and stored locally
            </span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                Security Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="w-6 h-6 text-primary" weight="fill" />
                  Security & Privacy Policy
                </DialogTitle>
                <DialogDescription>
                  How we protect your data and ensure a secure learning environment
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <section>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Authentication & Access
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                    <li>• GitHub account authentication required for all users</li>
                    <li>• Automatic session timeout after 30 minutes of inactivity</li>
                    <li>• "Remember Me" option extends session to 30 days</li>
                    <li>• Role-based access control (Student, Teacher, Parent)</li>
                    <li>• Teachers can only view data for students in assigned classes</li>
                    <li>• Students can only access their own progress data</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Data Protection</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• All data stored locally in your browser</li>
                    <li>• No server transmission of personal information</li>
                    <li>• Automatic input sanitization prevents injection attacks</li>
                    <li>• HTML and script tags blocked from user inputs</li>
                    <li>• Email and username validation before storage</li>
                    <li>• Maximum character limits on all text fields</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Rate Limiting & Abuse Prevention</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Maximum 100 requests per user per minute</li>
                    <li>• Automatic blocking of excessive activity</li>
                    <li>• Protection against automated abuse</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Data Privacy</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• You control your data completely</li>
                    <li>• Export your progress anytime as JSON</li>
                    <li>• Clear all data option available in settings</li>
                    <li>• No third-party analytics or tracking</li>
                    <li>• Data never shared without explicit permission</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-lg mb-2">Educational Context</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• This is an educational simulation platform</li>
                    <li>• All financial data is practice data, not real money</li>
                    <li>• Banking simulator uses fake transactions for learning</li>
                    <li>• No real financial accounts are connected</li>
                  </ul>
                </section>

                <section className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Reporting Security Issues</h3>
                  <p className="text-sm text-muted-foreground">
                    If you discover a security vulnerability, please report it responsibly by contacting 
                    the development team through GitHub. We take security seriously and will address 
                    issues promptly.
                  </p>
                </section>

                <section className="text-xs text-muted-foreground border-t pt-4">
                  <p>Last updated: January 2024</p>
                  <p className="mt-2">
                    This application is built with security best practices including input validation, 
                    sanitization, session management, and principle of least privilege access control.
                  </p>
                </section>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </footer>
  )
}
