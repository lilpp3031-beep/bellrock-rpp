"""
RPP広告入札自動調整スクリプト
楽天市場のRPP広告キーワードのCPCを自動調整して、PR検索順位7位以内を維持します。

使い方:
  python3 rpp_bid_adjuster.py           # テストモード（確認のみ）
  python3 rpp_bid_adjuster.py --run     # 実際に入札を更新する
"""

import asyncio
import json
import sys
import time
import urllib.parse
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional

# ======================================================================
# 設定
# ======================================================================

RMS_LOGIN_ID  = "lilpp3031"       # R-Login ID
RMS_PASSWORD  = "hikaru0331"      # R-Login パスワード
RAKUTEN_EMAIL = "lilpp3031@gmail.com"
RAKUTEN_PASS  = "lawson0331"      # 楽天会員パスワード

SHOP_ID = "430448"                # bellrock の楽天ショップID

# 入札調整ルール
TARGET_MAX_RANK  = 7              # この順位以内を維持（7位以内）
MIN_KEYWORD_CPC  = 40             # 楽天の最小キーワードCPC
MAX_KEYWORD_CPC  = 500            # 入札の上限
BID_INCREASE     = 10             # 増額ステップ（円）
# 段階的な減額ルール（上位キーワードの過度な削減を防ぐ）
BID_DECREASE_RANK1_2 = 2          # PR1-2位（かなり上位）: 2円減額
BID_DECREASE_RANK3   = 1          # PR3位（やや上位）: 1円減額

BASE_URL         = "https://ad.rms.rakuten.co.jp"
SEARCH_DELAY     = 1.5            # 楽天検索間隔（秒）

# LINE Messaging API設定
LINE_CHANNEL_ACCESS_TOKEN = "kYypu5k2td00KrpmWZQnPYZR14/Dg5ne8QzWI9xGhaL0z8NL8ZoBOu+hzhw63UnCoAsGeADGkYsH7IoSGNoAiwtu5nzAEYnNL7VVkWxrk18GCjGqDhV6wKG2tYhDFQfu1qY2UWMY55gsUkraHkWvwAdB04t89/1O/w1cDnyilFU="
LINE_USER_ID     = "U296b168d90edc8f642649e7f763c5e62"
LINE_API_URL     = "https://api.line.me/v2/bot/message/push"

# ======================================================================

TEST_MODE = "--run" not in sys.argv

# ログファイルを開く（デバッグ用）
LOG_FILE = open(f"rpp_debug_{datetime.now().strftime('%H%M%S')}.log", "w", encoding="utf-8", buffering=1)


async def login(page):
    """RPP広告管理ページへログイン（標準RMSログインフロー）"""
    print("ログイン中...")
    # 標準RMSログインを使用（sp_id=1）
    await page.goto("https://glogin.rms.rakuten.co.jp/?sp_id=1")
    await page.wait_for_load_state("domcontentloaded")
    await asyncio.sleep(1)

    # R-Login ページが表示されている
    if "glogin.rms.rakuten.co.jp" in page.url:
        print("  Step 1: R-Login ID/パスワード入力...")
        await page.fill("input[placeholder='R-Login IDを入力']", RMS_LOGIN_ID)
        await page.fill("input[placeholder='パスワードを入力']", RMS_PASSWORD)
        await page.click("button:has-text('楽天会員ログインへ')")
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(2)
        print(f"  [DEBUG] R-Login後URL: {page.url}")

    # 楽天アカウント - メールアドレス入力
    if "account.rakuten.com" in page.url:
        print("  Step 2: 楽天メールアドレス入力...")
        try:
            email_field = page.locator("input[type='email'], input#user_id, input[name='username'], input[type='text']").first
            await email_field.wait_for(timeout=10000)
            await email_field.fill(RAKUTEN_EMAIL)
            await asyncio.sleep(0.5)
            await page.keyboard.press("Enter")
            await page.wait_for_load_state("domcontentloaded")
            await asyncio.sleep(2)
            print(f"  [DEBUG] メール入力後URL: {page.url}")
        except Exception as e:
            print(f"  メール入力エラー: {e}")

    # 楽天アカウント - パスワード入力
    if "account.rakuten.com" in page.url:
        print("  Step 3: 楽天パスワード入力...")
        try:
            await page.wait_for_selector("input[type='password']", timeout=12000)
            pw_field = page.locator("input[type='password']").first
            await pw_field.fill(RAKUTEN_PASS)
            await asyncio.sleep(0.5)
            await page.keyboard.press("Enter")
            await page.wait_for_load_state("domcontentloaded", timeout=20000)
            await asyncio.sleep(2)
            print(f"  [DEBUG] パスワード入力後URL: {page.url}")
        except Exception as e:
            print(f"  パスワード入力エラー: {e}")

    # R-Login お知らせページ（次へボタン）
    if "glogin.rms.rakuten.co.jp" in page.url:
        print("  Step 4: R-Loginお知らせページ通過...")
        try:
            next_btn = page.locator("a:has-text('次へ'), button:has-text('次へ'), input[value='次へ']")
            if await next_btn.count() > 0:
                await next_btn.first.click()
                await page.wait_for_load_state("domcontentloaded")
                await asyncio.sleep(1)
        except Exception as e:
            print(f"  お知らせページエラー: {e}")

    # RMSメインメニューの初期化（セッション確立）
    if "mainmenu.rms.rakuten.co.jp" in page.url:
        print("  RMSメインメニューでセッション初期化中...")
        # メインメニュー本体を読み込む（クエリパラメータを削除）
        await page.goto("https://mainmenu.rms.rakuten.co.jp/")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(3)  # セッション確立を待つ

    # RPPページへナビゲート
    await page.goto(f"{BASE_URL}/rpp/items")
    await page.wait_for_load_state("networkidle")

    if "system_error" in page.url or "login" in page.url.lower():
        raise RuntimeError("ログイン失敗。認証情報を確認してください。")

    print("ログイン完了\n")


async def api_get(page, path: str) -> dict:
    """認証済みセッションでGETリクエスト"""
    resp = await page.request.get(f"{BASE_URL}{path}")
    return await resp.json()


async def api_put(page, path: str, body: Any) -> tuple[bool, dict]:
    """認証済みセッションでPUTリクエスト"""
    resp = await page.request.put(
        f"{BASE_URL}{path}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        data = await resp.json()
    except Exception:
        data = {}
    return resp.ok, data


async def get_all_items(page) -> List[Dict]:
    """キーワードが登録されているアクティブな商品を全取得"""
    items = []
    page_num = 1
    while True:
        data = await api_get(page, f"/rpp/api/items?page={page_num}&sortBy=-clientUpdateDatetime")
        # APIレスポンス形式を確認
        if "data" not in data:
            print(f"[DEBUG] API response: {data}")
            if isinstance(data, dict) and "items" in data:
                page_items = data["items"]
            else:
                print(f"警告: 予期しないAPI形式。ページ処理を中止します。")
                break
        else:
            page_items = data["data"]["items"]

        active = [i for i in page_items if not i["isExcluded"] and i["keywordCounts"] > 0]
        items.extend(active)
        if len(page_items) < 24:
            break
        page_num += 1
    return items


async def get_keywords(page, item_id: int) -> List[Dict]:
    """商品のキーワード一覧（CPC・keywordHash込み）を取得"""
    data = await api_get(page, f"/rpp/api/keywords?itemId={item_id}")
    return data["data"]["keywords"]


async def update_keyword_cpc(page, item_mng_id: str, keyword_hash: str,
                              keyword: str, new_cpc: int) -> bool:
    """キーワードCPCをAPIで更新"""
    body = [{"keywordHash": keyword_hash, "keyword": keyword, "cpc": new_cpc}]
    ok, resp = await api_put(page, f"/rpp/api/keywords?itemMngId={item_mng_id}", body)
    return ok


async def check_pr_rank(page, keyword: str) -> Optional[int]:
    """
    楽天検索でキーワードのPR順位を確認。
    自店舗商品がPR枠に見つかった場合その順位(1-N)を返す。
    見つからなければ None を返す。
    """
    url = f"https://search.rakuten.co.jp/search/mall/{urllib.parse.quote(keyword)}/"

    # 検索ページを開いて完全ロード待ち
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)

    result = await page.evaluate(f"""
    () => {{
        const items = document.querySelectorAll('.searchresultitem[data-track-doc-type="rpp"]');
        for (const item of items) {{
            if (item.getAttribute('data-shop-id') === '{SHOP_ID}') {{
                return parseInt(item.getAttribute('data-position-relative'));
            }}
        }}
        return null;
    }}
    """)
    return result


def send_line_message(text: str) -> bool:
    """LINE Messaging APIでメッセージを送信"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {LINE_CHANNEL_ACCESS_TOKEN}"
        }
        payload = {
            "to": LINE_USER_ID,
            "messages": [
                {
                    "type": "text",
                    "text": text
                }
            ]
        }
        response = requests.post(LINE_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ LINE通知送信成功")
            return True
        else:
            print(f"⚠️  LINE通知送信失敗: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"⚠️  LINE通知エラー: {e}")
        return False


async def run_adjustment(page):
    """メイン調整ループ"""
    print(f"{'=' * 60}")
    print(" RPP入札自動調整ツール")
    print(f" 実行モード: {'テスト（変更なし）' if TEST_MODE else '本番（入札を更新）'}")
    print(f" 目標: PR {TARGET_MAX_RANK}位以内を維持")
    print(f"{'=' * 60}\n")

    items = await get_all_items(page)
    print(f"{len(items)}件のアクティブ商品を処理します\n")

    results = []
    errors  = []

    for item in items:
        item_id     = item["itemId"]
        item_mng_id = item["itemMngId"]
        item_name   = item["itemName"][:35]

        print(f"■ {item_mng_id} ({item_name}...)")

        keywords = await get_keywords(page, item_id)

        for kw in keywords:
            keyword      = kw["keyword"]
            current_cpc  = kw["cpc"]
            rec_cpc      = kw.get("recommendationCpc", current_cpc)
            keyword_hash = kw["keywordHash"]

            # PR順位チェック（楽天検索をスクレイピング）
            rank = await check_pr_rank(page, keyword)
            await asyncio.sleep(SEARCH_DELAY)

            # 入札額の決定（段階的な調整）
            if rank is None:
                # PR圏外 → 増額
                new_cpc = min(current_cpc + BID_INCREASE, MAX_KEYWORD_CPC)
                verdict = f"圏外 → {new_cpc}円へ増額"
            elif rank <= 2:
                # PR1-2位（かなり上位） → 穏やかに減額（2円）
                new_cpc = max(current_cpc - BID_DECREASE_RANK1_2, MIN_KEYWORD_CPC)
                verdict = f"PR{rank}位（かなり上位）→ {new_cpc}円へ減額"
            elif rank == 3:
                # PR3位（やや上位） → さらに穏やかに減額（1円）
                new_cpc = max(current_cpc - BID_DECREASE_RANK3, MIN_KEYWORD_CPC)
                verdict = f"PR{rank}位（やや上位）→ {new_cpc}円へ減額"
            elif rank <= TARGET_MAX_RANK:
                # 目標範囲内（4〜7位） → 変更なし
                new_cpc = current_cpc
                verdict = f"PR{rank}位（目標内）→ 変更なし"
            else:
                # 8位以下 → 増額
                new_cpc = min(current_cpc + BID_INCREASE, MAX_KEYWORD_CPC)
                verdict = f"PR{rank}位（圏外近い）→ {new_cpc}円へ増額"

            changed = new_cpc != current_cpc
            status  = "✓" if not changed else ("→" if not TEST_MODE else "→(テスト)")

            print(f"  {status} [{keyword}] CPC:{current_cpc}円 / 推奨:{rec_cpc}円  {verdict}")

            # 実際に更新（本番モードのみ）
            if changed and not TEST_MODE:
                ok = await update_keyword_cpc(page, item_mng_id, keyword_hash, keyword, new_cpc)
                if not ok:
                    print(f"    ⚠️ 更新失敗: {keyword}")
                    errors.append({"itemMngId": item_mng_id, "keyword": keyword})

            results.append({
                "itemMngId":   item_mng_id,
                "keyword":     keyword,
                "rank":        rank,
                "oldCpc":      current_cpc,
                "newCpc":      new_cpc,
                "recCpc":      rec_cpc,
                "changed":     changed,
                "verdict":     verdict,
            })

        print()

    # ===== サマリー =====
    print(f"{'=' * 60}")
    print(" 実行結果サマリー")
    print(f"{'=' * 60}")
    print(f"処理キーワード数: {len(results)}")
    changed_list = [r for r in results if r["changed"]]
    in_range     = [r for r in results if r["rank"] is not None and r["rank"] <= TARGET_MAX_RANK]
    out_range    = [r for r in results if r["rank"] is None or r["rank"] > TARGET_MAX_RANK]

    print(f"  目標範囲内  (PR1〜{TARGET_MAX_RANK}位): {len(in_range)}件")
    print(f"  目標範囲外 / 圏外: {len(out_range)}件")
    print(f"  入札変更対象: {len(changed_list)}件")
    if TEST_MODE:
        print(f"  ※テストモードのため実際の更新は行っていません")
        print(f"  ※本番実行: python3 rpp_bid_adjuster.py --run")
    if errors:
        print(f"  エラー: {len(errors)}件")

    # ===== ログ保存 =====
    log_file = f"rpp_adjustment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(log_file, "w", encoding="utf-8") as f:
        json.dump({
            "executedAt": datetime.now().isoformat(),
            "testMode":   TEST_MODE,
            "results":    results,
            "errors":     errors,
        }, f, ensure_ascii=False, indent=2)
    print(f"\nログ保存: {log_file}")

    # ===== LINE通知 =====
    error_msg = f"エラー: {len(errors)}件" if errors else "✅ エラーなし"
    mode_str = "テスト実行" if TEST_MODE else "本番実行"

    line_text = f"""RPP入札自動調整 実行完了

実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
モード: {mode_str}

📊 結果サマリー
• 処理キーワード: {len(results)}件
• 目標範囲内: {len(in_range)}件
• 目標範囲外: {len(out_range)}件
• 入札変更: {len(changed_list)}件

{error_msg}"""

    send_line_message(line_text)


async def main():
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page    = await context.new_page()

        if not RAKUTEN_PASS:
            print("⚠️  RAKUTEN_PASS が空です。スクリプト上部の RAKUTEN_PASS を設定してください。")
            print("   または既にログイン済みのブラウザセッションを使う場合は")
            print("   login() をコメントアウトして手動ログイン後に再実行してください。")
            await browser.close()
            return

        await login(page)
        await run_adjustment(page)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
