'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(24)
    .regex(/^[a-z0-9_]+$/i, 'Only letters, numbers and underscores'),
  email: z.string().email('Invalid email address'),
});

type ProfileValues = z.infer<typeof ProfileSchema>;

// Mocked user (replace with real data from your API)
const MOCK = {
  name: 'Your name',
  username: 'shadcn',
  email: 'user@example.com',
  verifiedEmails: ['user@example.com', 'team@company.com'],
  canChangeUsername: true, // set false to lock the input (e.g., only every 30 days)
};

export default function ProfileSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: MOCK.name,
      username: MOCK.username,
      email: MOCK.email,
    },
    mode: 'onChange',
  });

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    try {
      // 🔗 Replace with your API call:
      // await fetch('/api/me', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // })
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Update your profile details.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" {...form.register('name')} />
              <p className="text-xs text-muted-foreground">
                This is the name that will be displayed on your profile and in emails.
              </p>
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                disabled={!MOCK.canChangeUsername}
                className={cn(!MOCK.canChangeUsername && 'opacity-80')}
                {...form.register('username')}
              />
              <p className="text-xs text-muted-foreground">
                This is your public display name. It can be your real name or a pseudonym.
                You can only change this once every 30 days.
              </p>
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>

            {/* Email (select a verified email) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Select
                value={form.watch('email')}
                onValueChange={(v) => form.setValue('email', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a verified email to display" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK.verifiedEmails.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can manage verified email addresses in your email settings.
              </p>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
