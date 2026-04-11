import fs from 'fs/promises';
import path from 'path';

interface DesignData {
  url: string;
  category: string;
  analysis: {
    colors: {
      primary: string[];
      secondary: string[];
    };
    layout: {
      type: string;
      alignment: string;
      spacing: string;
    };
    typography: {
      heading: {
        size: string;
        weight: string;
        fontFamily: string;
      };
      cta: {
        size: string;
        weight: string;
        style: string;
      };
    };
    imagery: {
      style: string;
      imageCount: number;
      aspectRatio: string;
    };
  };
}

async function analyzePatterns() {
  try {
    const resultsPath = path.join(process.cwd(), 'design-analysis-results.json');
    const rawData = await fs.readFile(resultsPath, 'utf-8');
    const results: DesignData[] = JSON.parse(rawData);

    console.log(`\n📊 Analyzing ${results.length} design samples\n`);

    // カテゴリ別の分析
    const byCategory: Record<string, DesignData[]> = {};
    results.forEach(r => {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    });

    // 色パターンの抽出
    const colorPatterns: Record<string, Set<string>> = {
      primary: new Set(),
      secondary: new Set(),
    };

    results.forEach(r => {
      if (r.analysis?.colors) {
        r.analysis.colors.primary?.forEach(c => colorPatterns.primary.add(c));
        r.analysis.colors.secondary?.forEach(c => colorPatterns.secondary.add(c));
      }
    });

    // レイアウトパターン
    const layoutPatterns: Record<string, number> = {};
    results.forEach(r => {
      if (r.analysis?.layout) {
        const key = `${r.analysis.layout.type}-${r.analysis.layout.alignment}`;
        layoutPatterns[key] = (layoutPatterns[key] || 0) + 1;
      }
    });

    // タイポグラフィパターン
    const typographyPatterns: Record<string, number> = {};
    results.forEach(r => {
      if (r.analysis?.typography?.heading?.size) {
        const size = r.analysis.typography.heading.size;
        typographyPatterns[size] = (typographyPatterns[size] || 0) + 1;
      }
    });

    // 画像パターン
    const imageryPatterns: Record<string, number> = {};
    results.forEach(r => {
      if (r.analysis?.imagery?.style) {
        const style = r.analysis.imagery.style;
        imageryPatterns[style] = (imageryPatterns[style] || 0) + 1;
      }
    });

    // 結果出力
    console.log('=== COLOR PATTERNS ===');
    console.log(`Primary Colors: ${Array.from(colorPatterns.primary).join(', ')}`);
    console.log(`Secondary Colors: ${Array.from(colorPatterns.secondary).join(', ')}`);

    console.log('\n=== LAYOUT PATTERNS ===');
    Object.entries(layoutPatterns).forEach(([pattern, count]) => {
      console.log(`${pattern}: ${count} samples`);
    });

    console.log('\n=== TYPOGRAPHY PATTERNS ===');
    Object.entries(typographyPatterns).forEach(([size, count]) => {
      console.log(`Heading Size ${size}: ${count} samples`);
    });

    console.log('\n=== IMAGERY PATTERNS ===');
    Object.entries(imageryPatterns).forEach(([style, count]) => {
      console.log(`Style ${style}: ${count} samples`);
    });

    // テンプレート候補を生成
    console.log('\n=== TEMPLATE CATALOG ===');
    const templateCatalog = {
      name: 'Amazon Design Templates v1',
      version: '1.0.0',
      totalSamples: results.length,
      categories: Object.keys(byCategory),
      colors: {
        primary: Array.from(colorPatterns.primary),
        secondary: Array.from(colorPatterns.secondary),
      },
      layouts: Object.keys(layoutPatterns),
      typography: {
        headingSizes: Object.keys(typographyPatterns),
      },
      imagery: Object.keys(imageryPatterns),
    };

    // テンプレートカタログを保存
    const catalogPath = path.join(process.cwd(), 'template-catalog.json');
    await fs.writeFile(catalogPath, JSON.stringify(templateCatalog, null, 2));
    console.log(`\n✅ Template catalog saved: template-catalog.json`);

    return templateCatalog;
  } catch (error) {
    console.error(`❌ Error analyzing patterns: ${error}`);
    throw error;
  }
}

analyzePatterns().catch(console.error);
