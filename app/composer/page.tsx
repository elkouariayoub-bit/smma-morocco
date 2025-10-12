"use client";
import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Wand2, Loader2, CalendarDays, UploadCloud, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SocialPlatform } from '@/lib/types';
import { EmptyState } from '@/components/dashboard/empty-state';

const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`flex h-10 w-full items-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-inner transition-base focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40 ${className ?? ''}`}
    {...props}
  />
);

type Feedback = { type: 'success' | 'error' | 'info'; message: string } | null;

export default function ComposerPage() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.Instagram);
  const [when, setWhen] = useState<string>("");

  const [aiTopic, setAiTopic] = useState("");
  const [tone, setTone] = useState('friendly');
  const [length, setLength] = useState('medium');

  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    setFeedback(null);
  }, [caption, title, image, platform, when]);

  const quickMetrics = useMemo(() => (
    [
      { label: 'Scheduled this week', value: '8 posts', delta: '+12% vs last week' },
      { label: 'Drafts awaiting review', value: '3', delta: 'Share with teammates' },
      { label: 'Best performing channel', value: 'Instagram', delta: '+28% engagement' },
      { label: 'Next available slot', value: when ? new Date(when).toLocaleString() : 'Today • 4:00 PM', delta: 'Stay consistent' },
    ]
  ), [when]);

  const handleGenerateCaption = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, tone, length }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to generate');
      setCaption((prev) => (prev ? `${prev}\n\n${data.result}` : data.result));
      setFeedback({ type: 'success', message: '✨ Caption generated and appended.' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Failed to generate caption.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in');

      const payload = {
        platform,
        caption,
        image_url: image,
        scheduled_at: when,
        user_id: user.id,
        title,
      };

      const res = await fetch('/api/ai/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to save');
      setFeedback({ type: 'success', message: 'Post scheduled successfully.' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Failed to schedule post.' });
    } finally {
      setSaving(false);
    }
  };

  async function saveDraft() {
    if (!userId) {
      setFeedback({ type: 'error', message: 'Sign in to save drafts.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const media_urls: string[] = [];
      const { error } = await supabase.from('drafts')
        .insert({ title, caption, media_urls, user_id: userId, platform });
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Draft saved to your workspace.' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  }

  async function schedulePost() {
    if (!userId) {
      setFeedback({ type: 'error', message: 'Sign in to schedule posts.' });
      return;
    }
    if (!when) {
      setFeedback({ type: 'error', message: 'Pick a publish date and time.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const scheduled_at = new Date(when).toISOString();
      const media_urls: string[] = [];
      const { error } = await supabase.from('scheduled_posts')
        .insert({ platform, caption, media_urls, scheduled_at, user_id: userId, title });
      if (error) throw error;
      setCaption("");
      setTitle("");
      setImage(null);
      setWhen("");
      setAiTopic("");
      setFeedback({ type: 'success', message: 'Post scheduled and added to your queue.' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Failed to schedule post.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell
      title="Composer"
      description="Craft AI-assisted posts, share drafts, and schedule across every channel."
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Composer' }]}
      actions={(
        <Button variant="outline" size="sm" className="hidden sm:inline-flex" title="Plan a new campaign soon">
          <CalendarDays className="mr-2 h-4 w-4" /> Plan campaign
        </Button>
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickMetrics.map((metric) => (
          <Card key={metric.label} className="relative overflow-hidden">
            <CardContent className="space-y-2 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="text-xs text-slate-500">{metric.delta}</p>
              <div className="absolute inset-y-0 right-0 w-16 opacity-10" aria-hidden>
                <Sparkles className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose a post</CardTitle>
              <CardDescription>Keep captions between 70-150 characters for best engagement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3">
                <label className="text-sm font-medium text-slate-700">Internal title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spring launch teaser" />
              </div>
              <div className="grid gap-3">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700">
                  Caption
                  <span className="text-xs font-normal text-slate-400">Supports hashtags, emojis & line breaks</span>
                </label>
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} placeholder="Tell your story and invite conversation…" />
              </div>
              <div className="grid gap-3">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700">
                  Media
                  <span className="text-xs font-normal text-slate-400">Upload JPG, PNG, or MP4 up to 25MB</span>
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-surface-subtle px-6 py-8 text-center transition-base hover:border-brand hover:bg-brand-soft" title="Upload an image or video for this post">
                  <UploadCloud className="h-8 w-8 text-brand" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700">Drag & drop files</p>
                    <p className="text-xs text-slate-400">or click to browse</p>
                  </div>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                </label>
                {image && (
                  <p className="text-xs text-slate-500">Attached: {image.name}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Platform</label>
                  <Select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)}>
                    {Object.values(SocialPlatform).map((p) => (
                      <option key={p} value={p} className="capitalize">{p}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Schedule</label>
                  <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} title="Pick when this post should go live" />
                </div>
              </div>
              {feedback && (
                <div
                  role="status"
                  className={`rounded-xl border px-4 py-3 text-sm transition-base ${
                    feedback.type === 'success'
                      ? 'border-success/40 bg-success-soft text-success'
                      : feedback.type === 'error'
                      ? 'border-destructive/40 bg-destructive-soft text-destructive'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={saveDraft} disabled={saving || isGenerating} title="Save to drafts">
                  Save draft
                </Button>
                <Button variant="secondary" onClick={schedulePost} disabled={saving || isGenerating} title="Add to scheduling queue">
                  Add to queue
                </Button>
                <Button variant="outline" onClick={handleSchedule} disabled={saving || isGenerating} title="Schedule via automation">
                  Quick schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>Review how your caption and media will appear before publishing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-inner">
                {title && <p className="text-sm font-semibold text-slate-800">{title}</p>}
                <p className="mt-3 min-h-[80px] whitespace-pre-wrap text-sm text-slate-700">{caption || 'Your caption will appear here…'}</p>
                {image ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-80 w-full object-cover" />
                  </div>
                ) : (
                  <EmptyState
                    icon={UploadCloud}
                    title="No media attached"
                    description="Add imagery to increase engagement by up to 2.3x."
                    className="mt-4"
                  />
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 capitalize text-slate-600">{platform}</span>
                  {when && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">Scheduled • {new Date(when).toLocaleString()}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI assistant</CardTitle>
              <CardDescription>Generate captions from a topic, tone, and length.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="ai-topic" className="text-sm font-medium text-slate-700">Topic</label>
                <Input id="ai-topic" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., announce our new product drop" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="ai-tone" className="text-sm font-medium text-slate-700">Tone</label>
                <Select id="ai-tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="witty">Witty</option>
                  <option value="inspirational">Inspirational</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="ai-length" className="text-sm font-medium text-slate-700">Length</label>
                <Select id="ai-length" value={length} onChange={(e) => setLength(e.target.value)}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </Select>
              </div>
              <Button
                onClick={handleGenerateCaption}
                disabled={isGenerating || !aiTopic.trim()}
                className="w-full"
                title="Generate caption with Gemini"
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating…</span>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Generate & append</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posting checklist</CardTitle>
              <CardDescription>Maintain brand voice and accessibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success" aria-hidden />
                <span>Tag collaborators to increase reach.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" aria-hidden />
                <span>Add alt text describing imagery to stay accessible.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
                <span>Pin a key CTA link in the first comment.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
