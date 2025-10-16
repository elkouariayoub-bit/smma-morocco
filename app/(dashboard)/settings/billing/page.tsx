'use client'

import * as React from 'react'
import { Apple, CreditCard, Wallet2 } from 'lucide-react'

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

type PaymentMethod = 'card' | 'paypal' | 'apple'

type BillingState = {
  username: string
  city: string
  paymentMethod: PaymentMethod
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
}

const initialState: BillingState = {
  username: 'shadowdashboard',
  city: 'Casablanca',
  paymentMethod: 'card',
  cardNumber: '4242 4242 4242 4242',
  expiryMonth: '04',
  expiryYear: '2026',
  cvc: '123',
}

const paymentOptions: Array<{
  value: PaymentMethod
  label: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}> = [
  {
    value: 'card',
    label: 'Card',
    description: 'Visa, Mastercard, AMEX',
    icon: CreditCard,
  },
  {
    value: 'paypal',
    label: 'Paypal',
    description: 'Pay from your PayPal balance',
    icon: Wallet2,
  },
  {
    value: 'apple',
    label: 'Apple',
    description: 'Apple Pay on eligible devices',
    icon: Apple,
  },
]

const months = [
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

const years = Array.from({ length: 10 }, (_, index) => (new Date().getFullYear() + index).toString())

export default function BillingSettingsPage() {
  const [values, setValues] = React.useState<BillingState>(initialState)
  const [isSaving, setIsSaving] = React.useState(false)

  const isCard = values.paymentMethod === 'card'

  function updateField<Field extends keyof BillingState>(field: Field, next: BillingState[Field]) {
    setValues((prev) => ({
      ...prev,
      [field]: next,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    try {
      // 🔗 Replace with your API call later
      // await fetch('/api/billing', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // })
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success('Billing details saved')
    } catch (error: any) {
      toast.error(error?.message ?? 'Something went wrong while saving your billing details')
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    setValues(initialState)
    toast.success('Changes discarded', {
      description: 'We restored your previous billing details.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Update your payment details and manage your subscription.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Payment information</CardTitle>
          <CardDescription>Securely store your payment method to keep your workspace active.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={values.username}
                  onChange={(event) => updateField('username', event.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={values.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Enter city"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment</Label>
              <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon
                  const selected = values.paymentMethod === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateField('paymentMethod', option.value)}
                      className={cn(
                        'flex h-full flex-col gap-2 rounded-lg border px-4 py-3 text-left transition-colors',
                        'bg-card/40 hover:border-primary/60 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary/10 text-primary-foreground/90 shadow-sm ring-1 ring-primary'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{option.label}</div>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <fieldset
              className={cn('grid gap-4 md:grid-cols-2', !isCard && 'pointer-events-none opacity-60')}
              disabled={!isCard}
            >
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  inputMode="numeric"
                  value={values.cardNumber}
                  onChange={(event) => updateField('cardNumber', event.target.value)}
                  placeholder="0000 0000 0000 0000"
                  autoComplete="cc-number"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry-month">Expires</Label>
                  <Select
                    value={values.expiryMonth}
                    onValueChange={(month) => updateField('expiryMonth', month)}
                    disabled={!isCard}
                  >
                    <SelectTrigger id="card-expiry-month">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-expiry-year">Year</Label>
                  <Select
                    value={values.expiryYear}
                    onValueChange={(year) => updateField('expiryYear', year)}
                    disabled={!isCard}
                  >
                    <SelectTrigger id="card-expiry-year">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input
                    id="card-cvc"
                    value={values.cvc}
                    onChange={(event) => updateField('cvc', event.target.value)}
                    placeholder="CVC"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
            </fieldset>

            {!isCard && (
              <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-4 text-sm text-muted-foreground">
                Additional fields are disabled for {values.paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}. You will be redirected to complete the payment on the selected provider.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
