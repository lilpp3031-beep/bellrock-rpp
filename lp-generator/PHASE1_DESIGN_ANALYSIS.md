# Phase 1: Amazon デザイン分析実装

## 📋 概要

Phase 1では、Amazonの商品ページから**視覚的デザイン情報**を自動抽出する機能を実装しました。複数カテゴリ（コスメ・工具・家具）から学習して、デザインパターンのテンプレートカタログを構築するためのステップです。

## 🎯 実装内容

### 1. 新型定義 (`src/types/index.ts`)

```typescript
interface DesignAnalysis {
  url: string;
  category: string; // 'beauty' | 'tools' | 'furniture' | 'other'
  textAnalysis: {
    title: string;
    features: string[];
    description: string;
  };
  designAnalysis: {
    sections: LayoutSection[];     // ページセクション構成
    colors: {
      primary: string[];           // プライマリカラー（複数）
      secondary: string[];         // セカンダリカラー
      background: string[];        // 背景色
      text: string[];              // テキスト色
    };
    layout: {
      type: 'grid' | 'flex' | 'stacked' | 'carousel';
      alignment: 'left' | 'center' | 'right';
      spacing: 'compact' | 'normal' | 'spacious';
    };
    typography: {
      heading: { size, weight, fontFamily };
      body: { size, weight, fontFamily, lineHeight };
      cta: { size, weight, style };
    };
    imagery: {
      style: 'hero-dominant' | 'gallery-grid' | 'carousel' | 'product-showcase';
      imageCount: number;
      aspectRatio: 'square' | 'horizontal' | 'vertical' | 'mixed';
    };
  };
  timestamp: Date;
}

interface LayoutSection {
  name: string;        // 'Hero', 'Gallery', 'Features' など
  order: number;       // ページ上部から下部への順序
  backgroundColor?: string;
  height: 'short' | 'medium' | 'tall';
  contentType: 'image' | 'text' | 'mixed' | 'cta';
}
```

### 2. Scraper Service拡張 (`src/services/scraper.service.ts`)

新しいメソッド `analyzeAmazonDesign(url: string): Promise<DesignAnalysis>` を追加：

```typescript
export class ScraperService {
  /**
   * Analyze Amazon product page design using Vision API
   */
  async analyzeAmazonDesign(url: string): Promise<DesignAnalysis> {
    // 1. ページをPlaywrightで読み込み
    // 2. ページのスクリーンショットを撮影
    // 3. Claude Vision APIで視覚的分析
    // 4. テキスト内容（タイトル・特徴・説明）を抽出
    // 5. 構造化JSONで返却
  }
}
```

**処理フロー：**
1. **ページ読み込み** → Playwright でAmazonページをロード
2. **スクリーンショット撮影** → ページ全体のJPEG画像を取得
3. **Vision API分析** → Claude Vision で以下を抽出：
   - ページセクション（Hero → Gallery → Features → CTA など）
   - 配色（プライマリ・セカンダリ・背景・テキスト）
   - レイアウト（Grid/Flex/Stacked/Carousel）
   - タイポグラフィ（見出し・本文・CTAボタンのサイズ・太さ）
   - 画像の使用パターン（ギャラリー・カルーセル・プロダクトショーケース）
4. **テキスト抽出** → Playwright で以下を取得：
   - 商品タイトル
   - 特徴・機能（Bullets）
   - 説明文
5. **結果返却** → 構造化 JSON フォーマット

### 3. Orchestrator Service拡張 (`src/services/orchestrator.service.ts`)

新しいメソッド `analyzeAmazonDesign(url: string): Promise<DesignAnalysis>` を追加（Scraper経由で呼び出し）

### 4. APIエンドポイント (`src/server.ts`)

新しいエンドポイント追加：

```http
POST /api/design/analyze
Content-Type: application/json

{
  "urls": [
    "https://www.amazon.co.jp/NILE-...",
    "https://www.amazon.co.jp/Goreson-...",
    "https://www.amazon.co.jp/IKSTAR-..."
  ]
}
```

**レスポンス例：**
```json
{
  "success": true,
  "analysisCount": 3,
  "analyses": [
    {
      "url": "https://...",
      "category": "beauty",
      "textAnalysis": { "title": "...", "features": [...], "description": "..." },
      "designAnalysis": {
        "sections": [...],
        "colors": {...},
        "layout": {...},
        "typography": {...},
        "imagery": {...}
      },
      "timestamp": "2026-03-26T..."
    },
    ...
  ],
  "errors": []
}
```

## 🧪 テスト方法

### 方法1: テストスクリプト実行

```bash
cd /Users/hikaru/pathbright-HP/lp-generator

# 1. CLAUDE_API_KEY を設定
export CLAUDE_API_KEY="sk-your-api-key-here"

# 2. 依存関係をインストール（初回のみ）
npm install

# 3. テストを実行
npx ts-node test-design-analysis.ts
```

**出力例：**
```
✓ CLAUDE_API_KEY is set (sk-proj-...)

🚀 Starting Amazon Design Analysis Tests

📊 Analyzing: コスメ・ビューティー
URL: https://www.amazon.co.jp/NILE-...
✅ Analysis successful!
   Category: beauty
   Sections: 5
   Colors: 2 primary, 2 secondary
   Layout: grid (center)
   Imagery: product-showcase

📊 Analyzing: 雑貨・工具
...

📋 TEST SUMMARY
Total: 3 | Success: 3 | Failed: 0

✅ Results saved to: design-analysis-results.json
```

### 方法2: サーバー起動 + APIリクエスト

```bash
# ターミナル1: サーバー起動
export CLAUDE_API_KEY="sk-your-api-key-here"
npm run dev

# ターミナル2: APIリクエスト送信
curl -X POST http://localhost:3001/api/design/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.amazon.co.jp/NILE-...",
      "https://www.amazon.co.jp/Goreson-...",
      "https://www.amazon.co.jp/IKSTAR-..."
    ]
  }'
```

## 📊 分析結果の構造

各Amazon ページの分析結果には以下が含まれます：

### **セクション情報（Sections）**
```json
"sections": [
  {
    "name": "Hero",
    "order": 1,
    "backgroundColor": "#ffffff",
    "height": "tall",
    "contentType": "image"
  },
  {
    "name": "Product Gallery",
    "order": 2,
    "backgroundColor": "#f9f9f9",
    "height": "medium",
    "contentType": "image"
  },
  {
    "name": "Features",
    "order": 3,
    "backgroundColor": "#ffffff",
    "height": "medium",
    "contentType": "text"
  },
  ...
]
```

### **配色情報（Colors）**
```json
"colors": {
  "primary": ["#FF9900", "#146EB4"],      // Amazon主色 + アクセント
  "secondary": ["#37475A"],               // テキスト濃グレー
  "background": ["#FFFFFF", "#F9F9F9"],   // 白 + ライトグレー
  "text": ["#0F1419", "#565959"]           // 濃色テキスト + グレーテキスト
}
```

### **レイアウト情報（Layout）**
```json
"layout": {
  "type": "grid",        // 'grid' | 'flex' | 'stacked' | 'carousel'
  "alignment": "center", // 'left' | 'center' | 'right'
  "spacing": "normal"    // 'compact' | 'normal' | 'spacious'
}
```

### **タイポグラフィ情報（Typography）**
```json
"typography": {
  "heading": {
    "size": "24px-32px",
    "weight": "bold",
    "fontFamily": "Amazon Ember, Arial, sans-serif"
  },
  "body": {
    "size": "14px-16px",
    "weight": "normal",
    "fontFamily": "Amazon Ember, Arial, sans-serif",
    "lineHeight": "1.5"
  },
  "cta": {
    "size": "16px",
    "weight": "bold",
    "style": "button"
  }
}
```

### **画像情報（Imagery）**
```json
"imagery": {
  "style": "product-showcase",    // 'hero-dominant' | 'gallery-grid' | 'carousel' | 'product-showcase'
  "imageCount": 6,                // ページに含まれる画像数
  "aspectRatio": "square"         // 'square' | 'horizontal' | 'vertical' | 'mixed'
}
```

## 📁 テスト対象のAmazonページ

### 1. **コスメ・ビューティー** 🧴
- **商品**: NILE 濃密泡スカルプシャンプー
- **URL**: `https://www.amazon.co.jp/NILE-%E6%BF%83%E5%AF%86%E6%B3%A1%E3%82%B9%E3%82%AB%E3%83%AB%E3%83%97%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC/dp/B0DLJP1FMD`
- **期待されるパターン**:
  - セクション: Hero（大きな商品画像）→ Features（成分・効果） → Reviews
  - 配色: グリーン・ブルー系（自然・清潔感）
  - 画像: 商品画像大きめ、使用シーン写真

### 2. **雑貨・工具** 🔧
- **商品**: Goreson プラモデル用精密工具セット
- **URL**: `https://www.amazon.co.jp/Goreson-%E3%83%97%E3%83%A9%E3%83%A2%E3%83%87%E3%83%AB%E7%94%A8%E5%B7%A5%E5%85%B7/dp/B08JLRNR6K`
- **期待されるパターン**:
  - セクション: Product showcase（複数角度画像） → Specifications → Features
  - 配色: ニュートラル（グレー・ブラック）
  - 画像: 複数角度、グリッドレイアウト

### 3. **家具** 🪑
- **商品**: IKSTAR ゲーミング椅子（ヘルスケア座布団）
- **URL**: `https://www.amazon.co.jp/IKSTAR-%E7%AC%AC%E5%9B%9B%E4%B8%96%E4%BB%A3-%E3%83%98%E3%83%AB%E3%82%B9%E3%82%B1%E3%82%A2%E5%BA%A7%E5%B8%83%E5%9B%A3/dp/B072HG7HNG`
- **期待されるパターン**:
  - セクション: Hero → Product details → Specifications grid
  - 配色: レッド・ブラック（ゲーミング感）
  - 画像: 製品メイン画像 + 機能詳細画像のグリッド

## 🔧 デバッグ方法

### ログ確認
```bash
# サーバー実行時、詳細なログが表示されます
# 例:
# INFO Analyzing Amazon product page design: https://www.amazon.co.jp/...
# INFO Extracted Amazon page text data: title: "NILE 濃密泡スカルプシャンプー"
# ✓ Amazon page design analyzed successfully: category: beauty, sections: 5
```

### スクリーンショット検査
Vision API に送信されるスクリーンショットをデバッグするには、以下をコードに追加：

```typescript
// scraper.service.ts の analyzeAmazonDesign メソッド内で
const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'jpeg' });
const fs = await import('fs').then((m) => m.promises);
await fs.writeFile(`./debug-screenshot-${Date.now()}.jpg`, screenshotBuffer);
logger.info('Screenshot saved for debugging');
```

### Vision API レスポンス確認
```bash
# design-analysis-results.json を確認
cat design-analysis-results.json | jq '.[] | {url, category, sections, colors}'
```

## ⚙️ 環境変数設定

`.env.local` ファイルを確認し、必要に応じて修正：

```env
# ✅ 推奨（実際のAPIキーを設定）
CLAUDE_API_KEY=sk-proj-your-actual-api-key-here

# ❌ 非推奨（変数展開されない）
CLAUDE_API_KEY=${CLAUDE_API_KEY}
```

**設定方法：**
```bash
# ターミナルで実行
export CLAUDE_API_KEY="sk-proj-your-actual-key"

# または .env.local に直接記入
echo "CLAUDE_API_KEY=sk-proj-your-actual-key" >> .env.local
```

## 🎯 次のステップ（Phase 2 & 3）

### **Phase 2: デザインテンプレートカタログ化**
- 複数カテゴリの分析結果をカタログ化
- デザインパターンの標準化（色・レイアウト・タイポグラフィ）
- テンプレートの再利用可能化

### **Phase 3: Figmaコンポーネント自動生成**
- 分析結果から Figma コンポーネントを自動生成
- Claude Figma拡張機能を活用
- 1688画像 + Amazonデザイン + Claude テキスト の統合

### **Phase 4: LP生成との統合**
- 1688 商品ページ（画像）
- Amazon デザイン分析（レイアウト・色・タイポ）
- Claude AI 生成テキスト（日本語説明）
- **↓**
- **自動 LP 生成**

## 📝 トラブルシューティング

### エラー: "ECONNREFUSED ::1:9222"
```
Solution: Chrome を CDP モードで起動
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-cdp &
```

### エラー: "Could not resolve authentication method"
```
Solution: CLAUDE_API_KEY 環境変数を設定
export CLAUDE_API_KEY="sk-proj-..."
npm run dev
```

### エラー: "Page not found" (Amazon)
```
Solution: ASIN が無効または URL が正しくない場合
- URL が正確か確認
- Amazon が bot detection している場合は CDP モードで再試行
```

## 📊 性能指標

| 指標 | 目標値 | 実績 |
|------|------|------|
| 分析時間 (1ページ) | < 30秒 | TBD |
| 成功率 | ≥ 95% | TBD |
| セクション検出数 | 4-6個 | TBD |
| 色抽出数 | 4-8個 | TBD |

---

**🎉 Phase 1 実装完了！**

3つのAmazonページから視覚的デザイン情報を自動抽出できるようになりました。
次は Phase 2 でテンプレートカタログ化し、Phase 3 で Figma との連携を進めます。
