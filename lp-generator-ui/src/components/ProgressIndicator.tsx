'use client';

interface ProgressIndicatorProps {
  progress: number;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">生成進捗</span>
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {progress < 20 && 'スクレイピング中...'}
        {progress >= 20 && progress < 50 && 'コンテンツを分析中...'}
        {progress >= 50 && progress < 80 && 'テンプレートを生成中...'}
        {progress >= 80 && progress < 100 && 'LP を完成させています...'}
        {progress === 100 && 'LP 生成完了！'}
      </div>
    </div>
  );
}
