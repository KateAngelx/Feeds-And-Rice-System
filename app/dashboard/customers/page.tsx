'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CustomerList } from '@/components/customers/customer-list'
import { CustomerForm } from '@/components/customers/customer-form'
import { PaymentForm } from '@/components/customers/payment-form'
import { CreditHistory } from '@/components/customers/credit-history'
import { useAuth } from '@/hooks/use-auth'
import { useCustomers } from '@/hooks/use-customers'
import { Card, CardContent } from '@/components/ui/card'
import type { Customer } from '@/lib/types'
import { Users, Wallet, UserCheck, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

export default function CustomersPage() {
  const { user } = useAuth()
  const {
    customers,
    creditRecords,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordPayment,
    getCustomerCreditHistory,
    getCustomersWithCredit,
  } = useCustomers()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null)

  const customersWithCredit = getCustomersWithCredit()
  const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0)

  const handleAdd = () => {
    setEditingCustomer(null)
    setIsFormOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleSubmit = (data: Omit<Customer, 'id' | 'createdAt' | 'creditBalance'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data)
      toast.success('Customer updated', {
        description: `${data.name}'s information has been updated.`,
      })
    } else {
      addCustomer(data)
      toast.success('Customer added', {
        description: `${data.name} has been added to the system.`,
      })
    }
    setIsFormOpen(false)
    setEditingCustomer(null)
  }

  const handleDelete = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    deleteCustomer(customerId)
    toast.success('Customer deleted', {
      description: `${customer?.name} has been removed.`,
    })
  }

  const handlePaymentSubmit = (amount: number, notes: string) => {
    if (!payingCustomer || !user) return
    recordPayment(payingCustomer.id, amount, notes, user.name)
    toast.success('Payment recorded', {
      description: `${formatCurrency(amount)} payment for ${payingCustomer.name} has been recorded.`,
    })
    setPayingCustomer(null)
  }

  const historyRecords = historyCustomer
    ? getCustomerCreditHistory(historyCustomer.id)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <p className="text-muted-foreground">Manage customers and their credit balances (utang)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Customers</p>
              <p className="text-lg font-bold">{customers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Credit</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(totalCredit)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <TrendingDown className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">With Credit</p>
              <p className="text-lg font-bold">{customersWithCredit.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid Up</p>
              <p className="text-lg font-bold">
                {customers.length - customersWithCredit.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers with Credit Alert */}
      {customersWithCredit.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Outstanding Credit</h3>
            </div>
            <p className="mb-3 text-sm text-amber-700">
              {customersWithCredit.length} customer(s) have outstanding credit balances:
            </p>
            <div className="space-y-2">
              {customersWithCredit.slice(0, 5).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between rounded-lg bg-amber-100/50 p-2 text-sm"
                >
                  <span className="font-medium text-amber-800">{customer.name}</span>
                  <span className="font-semibold text-amber-700">
                    {formatCurrency(customer.creditBalance)}
                  </span>
                </div>
              ))}
              {customersWithCredit.length > 5 && (
                <p className="text-sm text-amber-600">
                  ... and {customersWithCredit.length - 5} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <CustomerList
        customers={customers}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRecordPayment={(customer) => setPayingCustomer(customer)}
        onViewHistory={(customer) => setHistoryCustomer(customer)}
      />

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCustomer(null)
        }}
        onSubmit={handleSubmit}
        customer={editingCustomer}
      />

      {/* Payment Form Modal */}
      <PaymentForm
        isOpen={!!payingCustomer}
        onClose={() => setPayingCustomer(null)}
        customer={payingCustomer}
        onSubmit={handlePaymentSubmit}
      />

      {/* Credit History Modal */}
      <CreditHistory
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        customer={historyCustomer}
        records={historyRecords}
      />
    </div>
  )
}
