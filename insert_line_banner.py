import base64
import json
import urllib.request
import urllib.error
import time
import ssl
import csv
from typing import List, Dict, Any

# macOSの証明書エラー回避用
ssl._create_default_https_context = ssl._create_unverified_context

# ======================================================================
# 設定項目（実行前に必ず書き換えてください）
# ======================================================================

# ■ 1. 楽天RMS APIキー
SERVICE_SECRET = b"SP430448_mSTF0gOFuuzvBz31"
LICENSE_KEY = b"SL430448_cPy8ycZxKjMIlUkQ"

# ■ 2. バナー画像とリンクのURL
BANNER_IMAGE_URL = "https://image.rakuten.co.jp/bellrock/cabinet/11794386/imgrc0109051832.jpg"
LINE_LINK_URL = "https://lin.ee/sEDFahB"

# 挿入するHTMLタグの組み立て
BANNER_HTML = f'<div style="text-align: center; margin: 20px 0;"><a href="{LINE_LINK_URL}"><img src="{BANNER_IMAGE_URL}" width="100%"></a></div>'

# ■ 3. バナーの挿入位置： 'top' (一番上) または 'bottom' (一番下)
INSERT_POSITION = 'top'

# ■ 4. テストモード（Trueの場合、実際に更新せず取得のみ行います。最初は必ずTrueで！）
TEST_MODE = False

# ======================================================================

class RakutenRMSItemAPI:
    BASE_URL = "https://api.rms.rakuten.co.jp"
    
    def __init__(self, service_secret: bytes, license_key: bytes):
        auth_string = base64.b64encode(service_secret + b':' + license_key).decode('utf-8')
        self.headers: Dict[str, str] = {
            'Authorization': 'ESA ' + auth_string,
            'Content-Type': 'application/json; charset=utf-8'
        }

    def search_all_items(self) -> List[Dict[str, Any]]:
        """全商品の情報を取得する"""
        url = f"{self.BASE_URL}/es/2.0/items/search/"
        all_items = []
        
        print("▶ 商品の一覧と現在の説明文を取得中...")
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req) as res:
                response = json.loads(res.read().decode())
            
            items = response.get('results', [])
            for res_item in items:
                item_data = res_item.get('item', {})
                manage_number = item_data.get('manageNumber')
                sp_text = item_data.get('smartphoneItemInfo', '')
                if manage_number:
                    all_items.append({
                        "manageNumber": manage_number,
                        "spItemText": sp_text
                    })
            
            print(f"  - {len(items)}件の情報を取得しました。")
            
        except urllib.error.HTTPError as e:
            error_msg = str(e.read(), 'utf-8')
            print(f"取得エラー: {e.code} - {error_msg}")
        except Exception as e:
            print(f"取得エラー: {e}")
            
        return all_items

def main():
    print("==================================================")
    print(" 楽天RMS スマホ商品説明文 LINEバナー一括挿入ツール")
    print("==================================================")
    
    if TEST_MODE:
        print("\n★★★ 現在【テストモード】で動作しています ★★★")
        print("実際のデータ更新は行われません。\n")
        
    if SERVICE_SECRET.startswith(b"SP") is False:
        print("エラー: スクリプト内の「SERVICE_SECRET」「LICENSE_KEY」などの設定項目が入力されていません。")
        print("ファイルを開いてキーを入力してから再度実行してください。")
        return

    api = RakutenRMSItemAPI(SERVICE_SECRET, LICENSE_KEY)
    
    # 1. 全商品のデータ(管理番号と説明文)を一括取得
    items = api.search_all_items()
    if not items:
        print("商品が見つかりませんでした。APIキーが間違っていないか確認してください。")
        return
        
    print(f"\n合計 {len(items)} 件の商品が見つかりました。\n")
    
    # 対象を絞る
    if TEST_MODE:
        items = items[:1]
        print(f"テストモードのため、対象を 1商品 ({items[0]['manageNumber']}) のみに絞りました。")
        
    # 2. 各商品のスマートフォン用商品説明文を取得して更新用のリストを作成
    csv_rows = []
    print("\n▶ 各商品の商品説明文を解析してバナーを挿入中...")
    
    for idx, item in enumerate(items):
        item_code = item['manageNumber']
        current_text = item['spItemText']
        
        # すでにバナーが入っているか簡易チェック（二重挿入防止）
        if LINE_LINK_URL in current_text or BANNER_IMAGE_URL in current_text:
            print(f"  - {item_code}: 既にバナーが含まれているためスキップします。")
            if not TEST_MODE:
                continue
            
        # 文字列の結合（'top'なら先頭、'bottom'なら末尾）
        if INSERT_POSITION == 'top':
            new_text = BANNER_HTML + current_text
        else:
            new_text = current_text + BANNER_HTML
            
        # CSVの行データとして追加 (SKU移行後: 商品管理番号, スマートフォン用商品説明文)
        csv_rows.append([item_code, new_text])
        
        # 進行状況表示
        if (idx + 1) % 10 == 0:
            print(f"  - {idx + 1}/{len(items)} 件処理完了...")
            
        time.sleep(0.05) # 少しだけウェイトを入れる

    # 3. CSVを出力する
    if len(csv_rows) > 0:
        csv_filename = "normal-item.csv"
        
        if TEST_MODE:
            print("\n★★★ テスト結果 ★★★")
            print(f"対象商品: {csv_rows[0][0]}")
            print("以下のHTMLが作成されます:\n")
            # プレビュー表示
            preview_text = str(csv_rows[0][1])
            if len(preview_text) > 300:
                print(preview_text[:300] + "...\n(以下省略)\n")
            else:
                print(preview_text + "\n")
            print("※実際のファイル生成および更新は行われていません。表示を確認し、問題なければTEST_MODEをFalseにして再実行してください。")
        else:
            print(f"\n▶ 更新用のCSVファイル ({csv_filename}) を作成中...")
            try:
                with open(csv_filename, mode='w', encoding='utf-8-sig', newline='') as f:
                    writer = csv.writer(f)
                    # ヘッダー行を記述
                    writer.writerow(["商品管理番号", "スマートフォン用商品説明文"])
                    # データを記述
                    writer.writerows(csv_rows)
                
                print(f"すべての作業が完了しました！\n生成された {csv_filename} をRMSにアップロードしてください。")
            except Exception as e:
                 print(f"CSVファイルの作成中にエラーが発生しました: {e}")
    else:
        print("\n更新対象の商品がありませんでした（全商品に既にバナーがあるか、データ取得に失敗しました）。")

if __name__ == "__main__":
    main()
