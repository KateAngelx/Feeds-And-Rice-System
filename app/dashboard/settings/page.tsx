'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import useSWR from 'swr'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DEFAULT_STORE_SETTINGS } from '@/lib/constants'
import type { StoreSettings } from '@/lib/types'
import { Store, Users, RefreshCw, ShieldAlert, Save, Database } from 'lucide-react'

interface User {
  id: string
  username: string
  name: string
  role: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  const { data: storeSettings, mutate: refreshSettings } = useSWR<StoreSettings>(
    '/api/store-settings',
    fetcher
  )

  const { data: users = [] } = useSWR<User[]>(
    '/api/users',
    fetcher,
    { fallbackData: [] }
  )

  const [formData, setFormData] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, router])

  useEffect(() => {
    if (storeSettings) {
      setFormData(storeSettings)
    }
  }, [storeSettings])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/store-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await refreshSettings()
        toast.success('Settings saved', {
          description: 'Store settings have been updated.',
        })
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage store settings and system data</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>
              Configure your store details that appear on receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="storeName">Store Name</FieldLabel>
                <Input
                  id="storeName"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="storeAddress">Address</FieldLabel>
                <Textarea
                  id="storeAddress"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="storePhone">Phone Number</FieldLabel>
                <Input
                  id="storePhone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="receiptFooter">Receipt Footer Message</FieldLabel>
                <Textarea
                  id="receiptFooter"
                  value={formData.receiptFooter}
                  onChange={(e) => setFormData((prev) => ({ ...prev, receiptFooter: e.target.value }))}
                  rows={2}
                />
              </Field>
              <Button 
                onClick={handleSaveSettings} 
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Accounts
            </CardTitle>
            <CardDescription>
              View registered user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">@{u.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={u.role === 'admin' ? 'default' : 'secondary'}
                      className={u.role === 'admin' ? 'bg-emerald-600 text-white' : ''}
                    >
                      {u.role}
                    </Badge>
                    {u.id === user?.id && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground">No users found. Run database seed to create users.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Information
            </CardTitle>
            <CardDescription>
              This system uses PostgreSQL (Neon) for data storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Application</p>
                <p className="font-medium">Feeds & Rice Store POS</p>
              </div>
              <div>
                <p className="text-muted-foreground">Database</p>
                <p className="font-medium">PostgreSQL (Neon)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="font-medium">PHP - Philippine Peso</p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              This POS system uses a PostgreSQL database hosted on Neon. All data is stored securely in the cloud and persists across sessions. Use the Prisma seed command to initialize or reset database data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
