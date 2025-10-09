
import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { SocialPlatform } from '../types';
import { Wand2 } from './Icon';
import { generateCaption } from '../services/geminiService';

export const Composer: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([SocialPlatform.Twitter]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };
  
  const handleGenerateCaption = async () => {
    setAiError(null);
    setMessage(null);
    setIsGenerating(true);
    try {
      const generatedContent = await generateCaption(aiTopic);
      setContent(generatedContent);
    } catch (e: any) {
      setAiError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const postContent = async (postBody: object) => {
    await Promise.all(selectedPlatforms.map(async (p) => {
        const body = { ...postBody, platform: p };
        const res = await fetch('/api/ai/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || `Failed to save for ${p}`);
    }));
  }

  const handleSaveDraft = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) {
      setSaveError('Please add content and select at least one platform.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    setMessage(null);
    try {
        await postContent({ content, scheduled_at: null });
        setMessage('Successfully saved draft!');
        setContent('');
        setAiTopic('');
    } catch (e: any) {
        setSaveError(e.message);
    } finally {
        setIsSaving(false);
    }
  }
  
  const handleAddToQueue = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) {
        setSaveError('Please add content and select at least one platform.');
        return;
    }
    setIsSaving(true);
    setSaveError(null);
    setMessage(null);
    const scheduled_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1h
    try {
        await postContent({ content, scheduled_at });
        setMessage('Successfully added to queue!');
        setContent('');
        setAiTopic('');
    } catch (e: any) {
        setSaveError(e.message);
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Composer</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                 <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Platforms</label>
                        <div className="flex space-x-2 mt-2">
                        {Object.values(SocialPlatform).map((platform) => (
                            <button
                            key={platform}
                            onClick={() => handlePlatformToggle(platform)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors capitalize ${
                                selectedPlatforms.includes(platform)
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
                            }`}
                            >
                            {platform}
                            </button>
                        ))}
                        </div>
                    </div>
                    <div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to talk about?"
                            className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                        />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex space-x-2">
                          <Button variant="secondary" onClick={handleSaveDraft} isLoading={isSaving} disabled={isGenerating}>Save Draft</Button>
                          <Button variant="primary" onClick={handleAddToQueue} isLoading={isSaving} disabled={isGenerating}>Add to Queue</Button>
                      </div>
                       <div className="h-5 mt-2 text-sm text-right">
                          {saveError && <p className="text-red-500">{saveError}</p>}
                          {message && <p className="text-green-600">{message}</p>}
                       </div>
                    </div>
                 </div>
            </Card>
        </div>
        <div className="space-y-6">
            <Card title="AI Assistant" description="Generate content with AI.">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="ai-topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Topic
                        </label>
                        <input
                            id="ai-topic"
                            type="text"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            placeholder="e.g., a new product launch"
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                        />
                    </div>
                    <Button onClick={handleGenerateCaption} isLoading={isGenerating} disabled={!aiTopic.trim() || isSaving} className="w-full">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Caption
                    </Button>
                    {aiError && <p className="text-sm text-red-500">{aiError}</p>}
                </div>
            </Card>
            <Card title="Preview">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Platforms</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200 capitalize">
                            {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'None selected'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Content</p>
                        <div className="mt-1 p-3 border rounded-md bg-slate-50 dark:bg-slate-900/20 min-h-[100px] max-h-56 overflow-y-auto">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {content || 'Your content will appear here...'}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
