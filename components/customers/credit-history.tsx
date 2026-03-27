'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/lib/constants'
import type { Customer, CreditRecord } from '@/lib/types'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface CreditHistoryProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  records: CreditRecord[]
}

export function CreditHistory({ isOpen, onClose, customer, records }: CreditHistoryProps) {
  if (!customer) return null

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Credit History</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-medium">{customer.name}</h4>
          <p className="text-sm text-muted-foreground">
            Current Balance:{' '}
            <span className={customer.creditBalance > 0 ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-600'}>
              {formatCurrency(customer.creditBalance)}
            </span>
          </p>
          {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
        </div>

        <ScrollArea className="h-[300px] pr-4">
          {sortedRecords.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No credit history found
            </div>
          ) : (
            <div className="space-y-3">
              {sortedRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      record.type === 'credit'
                        ? 'bg-amber-100'
                        : 'bg-emerald-100'
                    }`}
                  >
                    {record.type === 'credit' ? (
                      <ArrowUpRight className="h-4 w-4 text-amber-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={
                          record.type === 'credit'
                            ? 'border-amber-300 text-amber-700'
                            : 'border-emerald-300 text-emerald-700'
                        }
                      >
                        {record.type === 'credit' ? 'Credit (Utang)' : 'Payment'}
                      </Badge>
                      <span
                        className={`font-semibold ${
                          record.type === 'credit' ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {record.type === 'credit' ? '+' : '-'}
                        {formatCurrency(record.amount)}
                      </span>
                    </div>
                    {record.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">{record.notes}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(record.createdAt).toLocaleString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {record.recordedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
