'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Wheat, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const success = await login(username, password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Invalid username or password')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Wheat className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Feeds &amp; Rice Store</CardTitle>
          <CardDescription>Point of Sale System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </FieldGroup>
          </form>
          <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Demo Accounts:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Admin:</span> admin / admin123</p>
              <p><span className="font-medium">Cashier:</span> cashier / cashier123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
