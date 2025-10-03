'use client';
import { useEffect, useState } from 'react';
import type { ChangeEvent, SelectHTMLAttributes } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wand2 } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { SocialPlatform } from '@/lib/types';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const Select = ({ className = '', ...props }: SelectProps) => (
  <select
    className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-gray-400 ${className}`}
    {...props}
  />
);

export default function ComposerPage() {
  const supabase = useSupabaseClient();
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    setMessage(null);
  }, [caption, title, image, platform, when]);

  const handleGenerateCaption = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to generate');
      setCaption((prev) => (prev ? `${prev}\n\n${data.result}` : data.result));
    } catch (e: any) {
      setError(e?.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  async function saveDraft() {
    if (!userId) return setMessage('❌ Sign in');
    setSaving(true);
    setMessage(null);
    try {
      const media_urls: string[] = []; // Image upload not implemented yet
      const { error, data } = await supabase.from('drafts')
        .insert({ title, caption, media_urls, user_id: userId, platform })
        .select('id').single();
      if (error) throw error;
      setMessage('✅ Draft saved');
    } catch (e: any) { setMessage(`❌ ${e.message || 'Failed to save draft'}`); }
    finally { setSaving(false); }
  }

  async function schedulePost() {
    if (!userId) return setMessage('❌ Sign in');
    if (!when) { return setMessage('❌ Pick a date & time'); }
    setSaving(true);
    setMessage(null);
    try {
      const scheduled_at = new Date(when).toISOString();
      const media_urls: string[] = []; // Image upload not implemented yet
      const { error, data } = await supabase.from('scheduled_posts')
        .insert({ platform, caption, media_urls, scheduled_at, user_id: userId, title })
        .select('id').single();
      if (error) throw error;
      setMessage('✅ Scheduled');
      setCaption(""); setTitle(""); setImage(null); setWhen(""); setAiTopic("");
    } catch (e: any) { setMessage(`❌ ${e.message || 'Failed to schedule'}`); }
    finally { setSaving(false); }
  }


  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-2 grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Create Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5">Title (optional)</label>
                    <Input
                      value={title}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
                      placeholder="An internal title for your post"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Caption</label>
                    <Textarea
                      value={caption}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCaption(event.target.value)}
                      rows={6}
                      placeholder="Write something…"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Image (optional)</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setImage(event.target.files?.[0] ?? null)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Platform</label>
                        <Select value={platform} onChange={(event: ChangeEvent<HTMLSelectElement>) => setPlatform(event.target.value as SocialPlatform)}>
                          {Object.values(SocialPlatform).map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Schedule for</label>
                        <Input
                          type="datetime-local"
                          value={when}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => setWhen(event.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <Button onClick={saveDraft} disabled={saving || isGenerating}>Save Draft</Button>
                    <Button variant="secondary" onClick={schedulePost} disabled={saving || isGenerating}>Schedule</Button>
                    {message && <p className="text-sm text-gray-600">{message}</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50/50">
                    {title && <p className="text-sm font-semibold mb-2 pb-2 border-b">{title}</p>}
                    <p className="whitespace-pre-wrap text-sm mb-3 min-h-[60px]">{caption || 'Your caption will appear here…'}</p>
                    {image && (
                        <img src={URL.createObjectURL(image)} alt="preview" className="rounded-xl max-h-80 object-cover" />
                    )}
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t capitalize">{platform} {when && `• Scheduled for ${new Date(when).toLocaleString()}`}</div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="sticky top-6">
        <Card>
            <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Generate a caption from a topic.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              <div>
                <label htmlFor="ai-topic" className="block text-sm font-medium mb-1.5">Topic</label>
                <Input
                  id="ai-topic"
                  value={aiTopic}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setAiTopic(event.target.value)}
                  placeholder="e.g., a new product launch"
                />
              </div>
               <div>
                <label htmlFor="ai-tone" className="block text-sm font-medium mb-1.5">Tone</label>
                <Select id="ai-tone" value={tone} onChange={(event: ChangeEvent<HTMLSelectElement>) => setTone(event.target.value)}>
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="witty">Witty</option>
                    <option value="inspirational">Inspirational</option>
                </Select>
              </div>
              <div>
                <label htmlFor="ai-length" className="block text-sm font-medium mb-1.5">Length</label>
                <Select id="ai-length" value={length} onChange={(event: ChangeEvent<HTMLSelectElement>) => setLength(event.target.value)}>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                </Select>
              </div>
              <Button onClick={handleGenerateCaption} disabled={isGenerating || !aiTopic.trim()} className="w-full">
                {isGenerating ? (
                    <span className="animate-pulse">Generating...</span>
                ) : (
                    <><Wand2 className="w-4 h-4 mr-2" /> Generate & Append</>
                )}
              </Button>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
