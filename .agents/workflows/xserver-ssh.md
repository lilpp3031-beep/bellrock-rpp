---
description: XサーバーにSSH接続してWordPressファイルを操作する
---

# XサーバーSSH接続ワークフロー

// turbo-all

## 手順

1. XサーバーにSSH接続する
```bash
ssh -p 10022 -i ~/.ssh/xs832303.key xs832303@sv16827.xserver.jp
```

2. WordPressテーマディレクトリに移動する
```bash
cd ~/pathbright.jp/public_html/wp-content/themes/cocoon-child-master/
```

3. 現在のファイル一覧を確認する
```bash
ls -la
```

## 注意事項
- SSH鍵は `~/.ssh/xs832303.key` に配置済み
- ポート番号は **10022**（通常の22ではない）
- テーマファイルパス: `/home/xs832303/pathbright.jp/public_html/wp-content/themes/cocoon-child-master/`
