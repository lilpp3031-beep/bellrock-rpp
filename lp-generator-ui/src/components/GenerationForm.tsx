'use client';

import { useState } from 'react';

const TONES = [
  { value: 'serious', label: 'フォーマル（信頼性重視）' },
  { value: 'casual', label: 'カジュアル（親しみやすい）' },
  { value: 'luxury', label: 'ラグジュアリー（高級感）' },
  { value: 'playful', label: 'プレイフル（楽しい）' },
  { value: 'technical', label: 'テクニカル（詳細重視）' },
];

interface GenerationFormProps {
  onSubmit: (data: { asins?: string[]; url?: string; referenceUrl?: string; tone: string }) => void;
  isLoading?: boolean;
}

export function GenerationForm({ onSubmit, isLoading = false }: GenerationFormProps) {
  const [inputType, setInputType] = useState<'asin' | 'url' | 'hybrid'>('hybrid');
  const [asinsInput, setAsinsInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [tone, setTone] = useState('casual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputType === 'asin') {
      const asins = asinsInput
        .split(/[\s,]+/)
        .filter((asin) => asin.trim().length > 0);

      if (asins.length === 0) {
        alert('最低1つの ASIN を入力してください');
        return;
      }

      onSubmit({ asins, tone });
    } else if (inputType === 'url') {
      const url = urlInput.trim();

      if (!url) {
        alert('URL を入力してください');
        return;
      }

      onSubmit({ url, tone });
    } else if (inputType === 'hybrid') {
      const productUrl = urlInput.trim();
      const refUrl = referenceUrl.trim();

      if (!productUrl) {
        alert('商品 URL を入力してください（1688 または Alibaba）');
        return;
      }

      onSubmit({ url: productUrl, referenceUrl: refUrl || undefined, tone });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Type Tabs */}
      <div className="flex gap-2 border-b border-gray-300">
        <button
          type="button"
          onClick={() => setInputType('hybrid')}
          className={`px-4 py-2 font-medium text-sm ${
            inputType === 'hybrid'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={isLoading}
        >
          1688 + Amazon参考
        </button>
        <button
          type="button"
          onClick={() => setInputType('asin')}
          className={`px-4 py-2 font-medium text-sm ${
            inputType === 'asin'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={isLoading}
        >
          Amazon ASIN
        </button>
        <button
          type="button"
          onClick={() => setInputType('url')}
          className={`px-4 py-2 font-medium text-sm ${
            inputType === 'url'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={isLoading}
        >
          単一URL
        </button>
      </div>

      {/* Hybrid Mode: 1688 + Amazon参考 */}
      {inputType === 'hybrid' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品 URL (1688 / Alibaba)
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://detail.1688.com/offer/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              画像を抽出する 1688 または Alibaba の URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amazon ライバル LP URL (オプション)
            </label>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              テキスト参考にする Amazon のライバル商品 URL（入力すると訴求力がアップ）
            </p>
          </div>
        </div>
      )}

      {/* ASIN Input */}
      {inputType === 'asin' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amazon ASIN
          </label>
          <textarea
            value={asinsInput}
            onChange={(e) => setAsinsInput(e.target.value)}
            placeholder="B08BHXFBK3, B096Q1Z9CX&#10;(カンマまたは改行で複数入力可能)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            複数の ASIN をカンマまたは改行で区切って入力できます
          </p>
        </div>
      )}

      {/* URL Input */}
      {inputType === 'url' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品ページURL
          </label>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.amazon.com/dp/B08BHXFBK3&#10;https://detail.1688.com/offer/...&#10;https://www.alibaba.com/product/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Amazon、1688、Alibaba など任意のECサイトの商品URLを入力できます
          </p>
        </div>
      )}

      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          トーン&マナー
        </label>
        <div className="space-y-2">
          {TONES.map((t) => (
            <label key={t.value} className="flex items-center">
              <input
                type="radio"
                name="tone"
                value={t.value}
                checked={tone === t.value}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700 cursor-pointer">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-lg font-bold transition ${
          isLoading
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isLoading ? '生成中...' : 'LP を生成'}
      </button>
    </form>
  );
}
