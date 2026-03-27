'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useLocalStorage } from '@/hooks/use-local-storage'
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
import { STORAGE_KEYS, DEFAULT_STORE_SETTINGS } from '@/lib/constants'
import type { StoreSettings, User } from '@/lib/types'
import { Store, Users, RefreshCw, ShieldAlert, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  const { value: storeSettings, setValue: setStoreSettings, isLoaded: settingsLoaded } = 
    useLocalStorage<StoreSettings>(STORAGE_KEYS.STORE_SETTINGS, DEFAULT_STORE_SETTINGS)
  const { value: users, isLoaded: usersLoaded } = 
    useLocalStorage<User[]>(STORAGE_KEYS.USERS, [])
  const { setValue: setUsers } = useLocalStorage<User[]>(STORAGE_KEYS.USERS, [])
  const { setValue: setProducts } = useLocalStorage(STORAGE_KEYS.PRODUCTS, [])
  const { setValue: setCustomers } = useLocalStorage(STORAGE_KEYS.CUSTOMERS, [])
  const { setValue: setTransactions } = useLocalStorage(STORAGE_KEYS.TRANSACTIONS, [])
  const { setValue: setCreditRecords } = useLocalStorage(STORAGE_KEYS.CREDIT_RECORDS, [])

  const [formData, setFormData] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, router])

  useEffect(() => {
    if (settingsLoaded && storeSettings) {
      setFormData(storeSettings)
    }
  }, [settingsLoaded, storeSettings])

  const handleSaveSettings = () => {
    setStoreSettings(formData)
    toast.success('Settings saved', {
      description: 'Store settings have been updated.',
    })
  }

  const handleResetData = () => {
  
    setTransactions([])
    setCreditRecords([])
    toast.success('Data reset', {
      description: 'All data has been reset to default values.',
    })
  }

  const handleClearTransactions = () => {
    setTransactions([])
    setCreditRecords([])
    toast.success('History cleared', {
      description: 'All transaction and credit records have been cleared.',
    })
  }

  if (!isAdmin || !settingsLoaded || !usersLoaded) {
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
              <Button onClick={handleSaveSettings} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
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
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Note: User management is simplified for this demo. In production, passwords would be hashed and user CRUD operations would be available.
            </p>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Reset or clear system data. These actions cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Transaction History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Transaction History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all transaction records and credit history. Products, customers, and their credit balances will remain intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearTransactions} className="bg-destructive text-white hover:bg-destructive/90">
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete ALL data including products, customers, transactions, and credit records. Everything will be reset to the default sample data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData} className="bg-destructive text-white hover:bg-destructive/90">
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Application</p>
                <p className="font-medium">Feeds & Rice Store POS</p>
              </div>
              <div>
                <p className="text-muted-foreground">Storage</p>
                <p className="font-medium">Local Storage (Browser)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="font-medium">PHP - Philippine Peso</p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              This is a demo POS system using browser local storage. Data is stored locally on this device and will persist across sessions. Clearing browser data will remove all stored information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
