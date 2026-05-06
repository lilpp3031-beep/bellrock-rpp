# Amazon セラーリサーチ ツール

Petifam（ペティファーム）等のセラーを分析し、利益商品を抽出するツールセット。

## ファイル構成

```
amazon-seller-analysis/
├── sellersprite_extractor.js  # ブラウザコンソールで実行するデータ抽出スクリプト
├── process_results.py         # 抽出データをフィルタ・Excel出力するPythonスクリプト
└── README.md
```

## 手順

### STEP 1: ブラウザでデータ抽出

1. **ChromeでAmazonセラーページを開く**
   - URL例: `https://www.amazon.co.jp/s?me=A1VC38T7YXB520`
   - または: `https://www.amazon.co.jp/stores/Petifam...`

2. **SellerSpriteのセラー分析パネルを開く**
   - セラースプライトのアイコンをクリック
   - テーブルが表示されるまで待つ
   - テーブルを「売上（降順）」でソート

3. **DevToolsコンソールを開く（F12 → Console）**

4. **`sellersprite_extractor.js` の内容を全コピー＆ペースト**
   - スクリプトが自動で全ページを処理する
   - 完了後、コンソールに以下が表示される:
   ```
   SS_EXTRACT_RESULT:[{"name":"...", ...}]
   ```

5. **`SS_EXTRACT_RESULT:` から始まる行をコピー**

### STEP 2: Excel出力

```bash
cd /home/user/bellrock-rpp/amazon-seller-analysis

# コマンドライン引数で渡す場合
python3 process_results.py --json 'SS_EXTRACT_RESULT:[{"name":...}]' --seller "Petifam（ペティファーム）"

# ファイルから渡す場合（コピーしたデータをdata.jsonに保存してから）
python3 process_results.py --file data.json --seller "Petifam（ペティファーム）"

# インタラクティブモード（引数なし）
python3 process_results.py --seller "Petifam（ペティファーム）"
```

出力: `セラーリサーチリスト.xlsx`（実利益率降順）

## 抽出条件

| 条件 | 値 |
|------|-----|
| 価格 | 950円以上 |
| 月商 | 7万〜50万円 |
| 粗利益率（一次） | 30%以上 |
| バリエーション数 | 10以下 |
| レビュー数 | 1〜150 |
| セラー数 | 1〜10 |

## 利益計算式

```
原価     = 価格 × 20%
実利益   = 価格 - 販売手数料 - FBA配送料 - 原価
実利益率 = 実利益 ÷ 価格  → 30%以上のみ最終候補
```

**注意**: 販売手数料・FBA配送料はSellerSpriteの電卓マークで取得した値を使用。
取得できない場合は推定値（販売手数料8%、FBA配送料は合計から逆算）を使用。

## 撤退条件（スクリプト自動判定）

- 5ページ連続で0件 → 終了
- ページ内最大月商が5万以下 → 以降スキップ
