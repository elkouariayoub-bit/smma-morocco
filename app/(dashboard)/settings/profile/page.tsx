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

const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(24)
    .regex(/^[a-z0-9_]+$/i, 'Only letters, numbers and underscores'),
  email: z.string().email('Invalid email address'),
  language: z.enum(SUPPORTED_LANGUAGES),
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

function isLanguage(value: string | null): value is Language {
  return !!value && SUPPORTED_LANGUAGES.includes(value as Language);
}

// --- helpers to apply language immediately (frontend-only) ---
function applyLanguage(lang: Language) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('lang', lang);
  root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  window.localStorage.setItem('app:lang', lang);
}

export default function ProfileSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const initialLanguageRef = React.useRef<Language>('en');

  const form = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: MOCK.name,
      username: MOCK.username,
      email: MOCK.email,
      language: 'en',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLang = window.localStorage.getItem('app:lang');
    const resolvedLang = isLanguage(storedLang) ? storedLang : 'en';
    initialLanguageRef.current = resolvedLang;
    form.setValue('language', resolvedLang, { shouldValidate: true });
    applyLanguage(resolvedLang);
  }, [form]);

  async function onSubmit(values: ProfileValues) {
    setSaving(true);
    try {
      // 🔗 Replace with your API call later
      // await fetch('/api/me', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      await new Promise((r) => setTimeout(r, 500));
      applyLanguage(values.language);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const emailValue = form.watch('email');
  const languageValue = form.watch('language') as Language;

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
                This is your public display name. You can only change this once every 30 days.
              </p>
              {form.formState.errors.username && (
                <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>

            {/* Email (select a verified email) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Select
                value={emailValue}
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

            {/* Language */}
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={languageValue}
                onValueChange={(lang) => {
                  const nextLang = isLanguage(lang) ? lang : 'en';
                  form.setValue('language', nextLang, { shouldValidate: true });
                  applyLanguage(nextLang);
                  toast.success('Language updated', {
                    description: `Current: ${nextLang.toUpperCase()}`,
                  });
                }}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Choose language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Arabic uses right-to-left layout automatically.
              </p>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  form.setValue('name', MOCK.name, { shouldValidate: true });
                  form.setValue('username', MOCK.username, { shouldValidate: true });
                  form.setValue('email', MOCK.email, { shouldValidate: true });
                  form.setValue('language', initialLanguageRef.current, { shouldValidate: true });
                  applyLanguage(initialLanguageRef.current);
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
