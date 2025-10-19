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

const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
const LANGUAGE_STORAGE_KEY = 'app:lang';

type BrowserRuntime = typeof globalThis & {
  document?: Document;
  localStorage?: Storage;
};

const runtime: BrowserRuntime =
  typeof globalThis !== 'undefined' ? (globalThis as BrowserRuntime) : ({} as BrowserRuntime);

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

type Language = (typeof SUPPORTED_LANGUAGES)[number];
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

function getDocumentElement(): HTMLElement | null {
  return runtime.document?.documentElement ?? null;
}

function getLocalStorage(): Storage | null {
  return runtime.localStorage ?? null;
}

function readStoredLanguage(): Language | null {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  try {
    const stored = storage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Unable to read stored language preference', error);
    }
    return null;
  }
}

function applyLanguage(lang: Language) {
  const root = getDocumentElement();
  if (root) {
    root.setAttribute('lang', lang);
    root.setAttribute('dir', 'ltr');
  }

  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Unable to persist language preference', error);
    }
  }
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
    const storedLanguage = readStoredLanguage();
    const resolvedLanguage = storedLanguage ?? 'en';

    initialLanguageRef.current = resolvedLanguage;
    form.setValue('language', resolvedLanguage, { shouldValidate: true });
    applyLanguage(resolvedLanguage);
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      applyLanguage(values.language);
      toast.success('Profile updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
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
                onValueChange={(value) => form.setValue('email', value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a verified email to display" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK.verifiedEmails.map((email) => (
                    <SelectItem key={email} value={email}>
                      {email}
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
                onValueChange={(value) => {
                  const nextLanguage = isLanguage(value) ? value : 'en';
                  form.setValue('language', nextLanguage, { shouldValidate: true });
                  applyLanguage(nextLanguage);
                  toast.success('Language updated', {
                    description: `Current: ${nextLanguage.toUpperCase()}`,
                  });
                }}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Choose language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose your preferred interface language.</p>
              {form.formState.errors.language && (
                <p className="text-xs text-destructive">{form.formState.errors.language.message}</p>
              )}
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
                  const fallbackLanguage = initialLanguageRef.current;
                  form.reset();
                  form.setValue('language', fallbackLanguage, { shouldValidate: true });
                  applyLanguage(fallbackLanguage);
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
