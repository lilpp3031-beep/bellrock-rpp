'use client';

import { useState } from 'react';
import { GenerationForm } from './GenerationForm';
import { PreviewPane } from './PreviewPane';
import { ProgressIndicator } from './ProgressIndicator';

type JobState = 'idle' | 'submitting' | 'processing' | 'completed' | 'error';

export function LPGenerator() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (data: {
    asins?: string[];
    url?: string;
    tone: string;
  }) => {
    setJobState('submitting');
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/lp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asins: data.asins,
          url: data.url,
          tone: data.tone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate LP');
      }

      const result = await response.json();
      setJobId(result.jobId);
      setJobState('processing');
      setProgress(0);

      // Poll for job status
      pollJobStatus(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setJobState('error');
    }
  };

  const pollJobStatus = async (id: string) => {
    const maxAttempts = 120; // 2 minutes with 1-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/lp/${id}/status`);
        if (!response.ok) throw new Error('Status check failed');

        const result = await response.json();
        setProgress(result.progress);

        if (result.status === 'completed') {
          setJobState('completed');
          setPreviewUrl(`http://localhost:3001/api/lp/${id}/preview`);
        } else if (result.status === 'failed') {
          setJobState('error');
          setError(result.error || 'Generation failed');
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Status check failed');
        setJobState('error');
      }
    };

    poll();
  };

  const handleDownload = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/lp/${jobId}/download`
      );
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lp-${jobId}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <GenerationForm
          onSubmit={handleSubmit}
          isLoading={jobState === 'submitting' || jobState === 'processing'}
        />

        {jobState === 'processing' && (
          <ProgressIndicator progress={progress} />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {jobState === 'completed' && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              HTML をダウンロード
            </button>
          </div>
        )}
      </div>

      {/* Right: Preview */}
      <div className="bg-white rounded-lg shadow-md p-6 min-h-96">
        {jobState === 'idle' ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>LP を生成するとプレビューが表示されます</p>
          </div>
        ) : jobState === 'processing' ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>生成中...</p>
          </div>
        ) : previewUrl ? (
          <PreviewPane url={previewUrl} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>プレビュー表示できませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
