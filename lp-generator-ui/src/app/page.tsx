'use client';

import { useState } from 'react';
import { LPGenerator } from '@/components/LPGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">LP Generator</h1>
          <p className="text-gray-600 mt-2">
            Amazon ASIN や URL から自動で LP を生成します
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <LPGenerator />
      </div>
    </main>
  );
}
