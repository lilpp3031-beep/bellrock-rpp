# 1688/Alibaba ページのスクレイピング設定

## 問題
1688とAlibabaはボット検出を行い、通常のPlaywrightヘッドレスブラウザをブロックします。解決策はChrome DevTools Protocol (CDP)を使って、あなたの認証済みChromeセッションを再利用することです。

## 解決方法

### ステップ1: Chrome を認証状態で起動
以下のコマンドをターミナルで実行して、リモートデバッグポート付きでChromeを起動します：

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 &
```

### ステップ2: 1688にログイン
1. 起動されたChromeウィンドウで `https://www.1688.com` にアクセス
2. 通常のログイン手順でアカウントにログイン
3. ブラウザを開いたままにしておく（ログイン状態を保持）

### ステップ3: LP生成を実行
Web UIで以下の操作を実行：
1. URLタブを選択
2. 1688の商品URL（例：`https://detail.1688.com/offer/654424222725.html`）を入力
3. トーン&マナーを選択
4. 「LP を生成」をクリック

→ 認証済みセッション経由で画像とデータが抽出されます

## トラブルシューティング

**Q: Chrome が起動しない or ポート9222に接続できない**
```bash
# プロセスを確認
ps aux | grep "remote-debugging-port=9222"

# ポートが使用されていないか確認
lsof -i :9222
```

**Q: スクレイパーがまだログインページを取得している**
- Chromeが実際にログインページを通過したか確認
- 異なるブラウザタブで `http://localhost:9222/json/version` にアクセスして、CDPが応答するか確認

## 技術詳細
- **Chrome DevTools Protocol (CDP)**: Playwrightがあなたのメインブラウザインスタンスに接続
- **認証状態の共有**: ブラウザのクッキーとセッション情報が利用可能
- **ボット検出の回避**: 実ブラウザとして認識されるため、1688/Alibabaのボット検出を通過
