'use client';

interface PreviewPaneProps {
  url: string;
}

export function PreviewPane({ url }: PreviewPaneProps) {
  return (
    <div className="h-full">
      <iframe
        src={url}
        title="LP Preview"
        className="w-full h-full border-0 rounded-lg"
      />
    </div>
  );
}
