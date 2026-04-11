---
description: WordPressテーマファイルをSSH経由で編集する
---

# WordPress テーマファイル編集ワークフロー

// turbo-all

## 手順

1. XサーバーにSSH接続する
```bash
ssh -p 10022 -i ~/.ssh/xs832303.key xs832303@sv16827.xserver.jp
```

2. テーマディレクトリに移動する
```bash
cd ~/pathbright.jp/public_html/wp-content/themes/cocoon-child-master/
```

3. 編集対象のファイルの内容を確認する（例: page-pathbright.php）
```bash
cat page-pathbright.php
```

4. PHPスクリプトでファイルを編集する
- `sed` コマンドまたは PHP の `str_replace` / `preg_replace` を使用してファイルを書き換える
- 直接 `vim` や `nano` で編集する場合は `nano ファイル名` を使用

5. 編集後のファイルを確認する
```bash
cat page-pathbright.php | head -n 50
```

6. ブラウザでサイトの表示を確認する
- URL: https://pathbright.jp/
- キャッシュクリア: `?v=タイムスタンプ` をつけてアクセス

## 注意事項
- 編集前に必ずバックアップを取る: `cp ファイル名 ファイル名.bak`
- CSSの変更は `<style>` タグ内（page-pathbright.php 内のインラインCSS）
- WordPress管理画面: https://pathbright.jp/wp-admin/
