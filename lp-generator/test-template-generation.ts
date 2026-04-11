import fs from 'fs/promises';
import path from 'path';
import { TemplateRendererService } from './src/services/template-renderer.service';

async function testTemplateGeneration() {
  console.log('\n🚀 Starting Template Generation Tests\n');

  // Phase 1 結果を読み込み
  const resultsPath = path.join(process.cwd(), 'design-analysis-results.json');
  const rawData = await fs.readFile(resultsPath, 'utf-8');
  const results = JSON.parse(rawData);

  const renderer = new TemplateRendererService();

  // 各結果に対してLPを生成
  for (const [index, result] of results.entries()) {
    try {
      console.log(`\n📄 Generating LP ${index + 1}/3: ${result.category}`);
      console.log(`   Title: ${result.analysis.title?.substring(0, 50)}...`);

      const html = await renderer.generateLPFromAnalysis(result.analysis);

      // ファイルに保存
      const outputName = `lp-${result.category}-${Date.now()}.html`;
      const outputPath = path.join(process.cwd(), outputName);
      await fs.writeFile(outputPath, html);

      console.log(`   ✅ LP generated: ${outputName}`);
      console.log(`   Size: ${Math.round(html.length / 1024)}KB`);
    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
    }
  }

  console.log('\n✅ Template generation tests complete!\n');
}

testTemplateGeneration().catch(console.error);
