'use client'

import * as React from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  MoreHorizontal,
  PiggyBank,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type PaymentMethodType = 'card' | 'paypal'

type PaymentMethod = {
  id: string
  type: PaymentMethodType
  brand: string
  last4?: string
  expiry?: string
  email?: string
}

type BillingContact = {
  fullName: string
  city: string
  taxId: string
  email: string
}

type Invoice = {
  id: string
  date: string
  total: string
  status: 'paid' | 'due'
  url: string
}

const initialContact: BillingContact = {
  fullName: 'Shadow Dashboard',
  city: 'Casablanca',
  taxId: 'MA-219445',
  email: 'billing@shadowdash.co',
}

const initialMethods: PaymentMethod[] = [
  {
    id: 'pm_visa',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiry: '04 / 26',
  },
  {
    id: 'pm_paypal',
    type: 'paypal',
    brand: 'PayPal',
    email: 'finance@shadowdash.co',
  },
]

const invoices: Invoice[] = [
  { id: 'INV-00251', date: 'Apr 2, 2024', total: '$129.00', status: 'paid', url: '#' },
  { id: 'INV-00238', date: 'Mar 2, 2024', total: '$129.00', status: 'paid', url: '#' },
  { id: 'INV-00221', date: 'Feb 2, 2024', total: '$129.00', status: 'paid', url: '#' },
]

const expiryMonths = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const expiryYears = Array.from({ length: 10 }, (_, index) => (new Date().getFullYear() + index).toString())

export default function BillingSettingsPage() {
  const [contact, setContact] = React.useState<BillingContact>(initialContact)
  const [activeMethod, setActiveMethod] = React.useState(initialMethods[0]!.id)
  const [methods, setMethods] = React.useState<PaymentMethod[]>(initialMethods)
  const [isSavingContact, setIsSavingContact] = React.useState(false)
  const [isSavingCard, setIsSavingCard] = React.useState(false)
  const [newCard, setNewCard] = React.useState({
    number: '4242 4242 4242 4242',
    month: '04',
    year: expiryYears[2]!,
    cvc: '123',
  })

  const selectedMethod = methods.find((method) => method.id === activeMethod)

  function updateContact<Field extends keyof BillingContact>(field: Field, value: BillingContact[Field]) {
    setContact((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function saveContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingContact(true)
    try {
      // 🔗 Replace with your API call later
      // await fetch('/api/billing/contact', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(contact),
      // })
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success('Billing contact updated')
    } catch (error: any) {
      toast.error(error?.message ?? 'Something went wrong while saving your contact details')
    } finally {
      setIsSavingContact(false)
    }
  }

  async function saveCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingCard(true)
    try {
      // 🔗 Replace with your API call later
      // await fetch('/api/billing/payment-methods', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     number: newCard.number,
      //     expMonth: newCard.month,
      //     expYear: newCard.year,
      //     cvc: newCard.cvc,
      //   }),
      // })
      await new Promise((resolve) => setTimeout(resolve, 700))
      const id = `pm_${Math.random().toString(36).slice(2, 7)}`
      const last4 = newCard.number.slice(-4)
      const card: PaymentMethod = {
        id,
        type: 'card',
        brand: 'Visa',
        last4,
        expiry: `${newCard.month} / ${newCard.year.slice(-2)}`,
      }
      setMethods((prev) => [card, ...prev])
      setActiveMethod(id)
      toast.success('Card added', { description: `•••• ${last4} is now your default method.` })
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to add the card right now')
    } finally {
      setIsSavingCard(false)
    }
  }

  function removeMethod(id: string) {
    setMethods((prev) => prev.filter((method) => method.id !== id))
    if (activeMethod === id && methods.length > 1) {
      const fallback = methods.find((method) => method.id !== id)
      if (fallback) {
        setActiveMethod(fallback.id)
      }
    }
    toast.success('Payment method removed')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, invoices, and saved payment methods from one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Pro Workspace</CardTitle>
                <CardDescription>
                  Billed annually • Next payment on <span className="font-medium text-foreground">July 12, 2024</span>
                </CardDescription>
              </div>
              <PiggyBank className="h-9 w-9 text-primary" />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Seats used</div>
                <p className="text-lg font-semibold">12 / 20</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Annual total</div>
                <p className="text-lg font-semibold">$1,548.00</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button type="button" size="sm" variant="outline">
                Upgrade plan
              </Button>
              <Button type="button" size="sm" variant="ghost" className="gap-1">
                View usage
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">Payment methods</CardTitle>
                <CardDescription>Select the default method used for renewals.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {methods.map((method) => {
                  const isActive = activeMethod === method.id
                  return (
                    <div
                      key={method.id}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
                        isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/60',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMethod(method.id)}
                        className="flex flex-1 items-center gap-3 text-left"
                        aria-pressed={isActive}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {method.brand}
                            {method.last4 ? ` •••• ${method.last4}` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method.type === 'card' ? `Expires ${method.expiry}` : method.email}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                            <BadgeCheck className="h-3 w-3" />
                            Default
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMethod(method.id)}
                          disabled={methods.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form onSubmit={saveCard} className="grid gap-4 rounded-lg border border-dashed p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Add a new card</p>
                    <p className="text-xs text-muted-foreground">We support Visa, Mastercard, and AMEX.</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <Label htmlFor="new-card-number">Card number</Label>
                <Input
                  id="new-card-number"
                  value={newCard.number}
                  onChange={(event) => setNewCard((prev) => ({ ...prev, number: event.target.value }))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-card-month">Month</Label>
                    <Select
                      value={newCard.month}
                      onValueChange={(month) => setNewCard((prev) => ({ ...prev, month }))}
                    >
                      <SelectTrigger id="new-card-month">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryMonths.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-card-year">Year</Label>
                    <Select value={newCard.year} onValueChange={(year) => setNewCard((prev) => ({ ...prev, year }))}>
                      <SelectTrigger id="new-card-year">
                        <SelectValue placeholder="YY" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-card-cvc">CVC</Label>
                    <Input
                      id="new-card-cvc"
                      value={newCard.cvc}
                      onChange={(event) => setNewCard((prev) => ({ ...prev, cvc: event.target.value }))}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setNewCard({
                    number: '4242 4242 4242 4242',
                    month: '04',
                    year: expiryYears[2]!,
                    cvc: '123',
                  })}>
                    Reset
                  </Button>
                  <Button type="submit" size="sm" disabled={isSavingCard}>
                    {isSavingCard ? 'Saving…' : 'Save card'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing contact</CardTitle>
              <CardDescription>Receipts and payment alerts will be sent here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billing-name">Full name</Label>
                  <Input
                    id="billing-name"
                    value={contact.fullName}
                    onChange={(event) => updateContact('fullName', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-email">Email</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    autoComplete="email"
                    value={contact.email}
                    onChange={(event) => updateContact('email', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-city">City</Label>
                  <Input
                    id="billing-city"
                    value={contact.city}
                    onChange={(event) => updateContact('city', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-tax">Tax ID</Label>
                  <Input
                    id="billing-tax"
                    value={contact.taxId}
                    onChange={(event) => updateContact('taxId', event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setContact(initialContact)
                      toast.success('Contact reset to defaults')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSavingContact}>
                    {isSavingContact ? 'Saving…' : 'Save contact'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Invoice history</CardTitle>
                <CardDescription>Download receipts for your records.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1">
                <CalendarClock className="h-4 w-4" />
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.id}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{invoice.total}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        invoice.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-600',
                      )}
                    >
                      {invoice.status === 'paid' ? 'Paid' : 'Due'}
                    </span>
                    <Button type="button" size="sm" variant="ghost" className="gap-1">
                      Download
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
