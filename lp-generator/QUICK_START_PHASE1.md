# Phase 1: クイックスタートガイド

## 🚀 最速スタート（3ステップ）

### ステップ1: APIキー設定
```bash
export CLAUDE_API_KEY="sk-proj-your-actual-api-key-here"
```

### ステップ2: サーバー起動
```bash
cd /Users/hikaru/pathbright-HP/lp-generator
npm install  # 初回のみ
npm run dev
```

### ステップ3: テスト実行

#### **方法A: テストスクリプト（推奨）**
```bash
# 別のターミナルで実行
export CLAUDE_API_KEY="sk-proj-your-actual-api-key-here"
npx ts-node test-design-analysis.ts
```

#### **方法B: APIリクエスト（curl）**
```bash
curl -X POST http://localhost:3001/api/design/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://www.amazon.co.jp/NILE-%E6%BF%83%E5%AF%86%E6%B3%A1%E3%82%B9%E3%82%AB%E3%83%AB%E3%83%97%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC/dp/B0DLJP1FMD",
      "https://www.amazon.co.jp/Goreson-%E3%83%97%E3%83%A9%E3%83%A2%E3%83%87%E3%83%AB%E7%94%A8%E5%B7%A5%E5%85%B7/dp/B08JLRNR6K",
      "https://www.amazon.co.jp/IKSTAR-%E7%AC%AC%E5%9B%9B%E4%B8%96%E4%BB%A3-%E3%83%98%E3%83%AB%E3%82%B9%E3%82%B1%E3%82%A2%E5%BA%A7%E5%B8%83%E5%9B%A3/dp/B072HG7HNG"
    ]
  }' | jq '.'
```

#### **方法C: cURL + 単一URL**
```bash
# コスメ・ビューティーのみ分析
curl -X POST http://localhost:3001/api/design/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://www.amazon.co.jp/NILE-%E6%BF%83%E5%AF%86%E6%B3%A1%E3%82%B9%E3%82%AB%E3%83%AB%E3%83%97%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC/dp/B0DLJP1FMD"]
  }'
```

## 🧪 テストURL（コピペ用）

```
コスメ・ビューティー:
https://www.amazon.co.jp/NILE-%E6%BF%83%E5%AF%86%E6%B3%A1%E3%82%B9%E3%82%AB%E3%83%AB%E3%83%97%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC/dp/B0DLJP1FMD

雑貨・工具:
https://www.amazon.co.jp/Goreson-%E3%83%97%E3%83%A9%E3%83%A2%E3%83%87%E3%83%AB%E7%94%A8%E5%B7%A5%E5%85%B7/dp/B08JLRNR6K

家具:
https://www.amazon.co.jp/IKSTAR-%E7%AC%AC%E5%9B%9B%E4%B8%96%E4%BB%A3-%E3%83%98%E3%83%AB%E3%82%B9%E3%82%B1%E3%82%A2%E5%BA%A7%E5%B8%83%E5%9B%A3/dp/B072HG7HNG
```

## 📊 期待される出力

### テストスクリプト出力例
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
URL: https://www.amazon.co.jp/Goreson-...
✅ Analysis successful!
   Category: tools
   Sections: 5
   Colors: 2 primary, 1 secondary
   Layout: grid (left)
   Imagery: carousel

📊 Analyzing: 家具
URL: https://www.amazon.co.jp/IKSTAR-...
✅ Analysis successful!
   Category: furniture
   Sections: 6
   Colors: 3 primary, 2 secondary
   Layout: grid (center)
   Imagery: gallery-grid

📋 TEST SUMMARY
Total: 3 | Success: 3 | Failed: 0

✅ Results saved to: design-analysis-results.json
```

### JSON出力例（design-analysis-results.json）
```json
[
  {
    "url": "https://www.amazon.co.jp/NILE-...",
    "category": "beauty",
    "status": "success",
    "analysis": {
      "title": "NILE 濃密泡スカルプシャンプー",
      "category": "beauty",
      "sections": [
        { "name": "Hero", "order": 1, "contentType": "image" },
        { "name": "Product Gallery", "order": 2, "contentType": "image" },
        { "name": "Features", "order": 3, "contentType": "text" },
        { "name": "Specifications", "order": 4, "contentType": "text" },
        { "name": "CTA", "order": 5, "contentType": "mixed" }
      ],
      "colors": {
        "primary": ["#FF9900", "#146EB4"],
        "secondary": ["#37475A", "#0F1419"]
      },
      "layout": {
        "type": "grid",
        "alignment": "center",
        "spacing": "normal"
      },
      "typography": {
        "heading": {
          "size": "24px-32px",
          "weight": "bold",
          "fontFamily": "Amazon Ember, Arial, sans-serif"
        },
        "cta": {
          "size": "16px",
          "weight": "bold",
          "style": "button"
        }
      },
      "imagery": {
        "style": "product-showcase",
        "imageCount": 6,
        "aspectRatio": "square"
      }
    }
  },
  ...
]
```

## ✅ チェックリスト

- [ ] CLAUDE_API_KEY を設定した
- [ ] npm install を実行した
- [ ] npm run dev でサーバーが起動している
- [ ] test-design-analysis.ts が成功した（または curl コマンドが 200 を返した）
- [ ] design-analysis-results.json が生成された
- [ ] 3つのカテゴリのデザイン情報が抽出された

## 🔍 デバッグ時の確認項目

| 項目 | 確認内容 | コマンド |
|------|---------|---------|
| API キー | sk-proj- で始まるか | `echo $CLAUDE_API_KEY` |
| サーバー | ポート 3001 で起動しているか | `curl http://localhost:3001/health` |
| ネットワーク | インターネット接続は正常か | `curl google.com` |
| Node.js | v18 以上か | `node -v` |
| Playwright | インストール済みか | `npm list playwright` |

## 🎯 次のステップ

✅ **Phase 1 完了**: Amazon デザイン分析機能実装

↓

**Phase 2**: デザインテンプレートカタログ化
- 複数ページのパターン学習
- 色・レイアウト・タイポのベストプラクティス抽出

↓

**Phase 3**: Figma コンポーネント自動生成
- Figma Claude 拡張を活用
- 分析結果から自動コンポーネント生成

↓

**Phase 4**: LP 生成との完全統合
- 1688 画像 + Amazon デザイン + Claude テキスト
- **ワンクリックで完成 LP 自動生成** 🚀

---

**質問や問題があれば、ログを確認してから報告してください！**
