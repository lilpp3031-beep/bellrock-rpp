/**
 * SellerSprite セラー分析データ一括抽出スクリプト
 *
 * 使い方:
 * 1. Amazonセラーページを開く（例: https://www.amazon.co.jp/s?me=XXXXXXXXX）
 * 2. SellerSpriteのセラー分析パネルを開く（SSアイコンをクリック）
 * 3. テーブルが表示されたことを確認
 * 4. ブラウザのDevTools > Console を開く（F12）
 * 5. このスクリプト全体をコピーして貼り付けてEnter
 * 6. 全ページ自動処理後、JSONが出力されるのでコピーして保存
 */

(async function extractSellerSpriteData() {
  'use strict';

  // ============================================================
  // フィルタ条件
  // ============================================================
  const FILTERS = {
    minPrice: 950,
    minMonthlySales: 70000,
    maxMonthlySales: 500000,
    minGrossMargin: 30,   // 粗利益率（一次フィルタ）
    maxVariations: 10,
    minReviews: 1,
    maxReviews: 150,
    minSellers: 1,
    maxSellers: 10,
  };

  // 撤退条件
  const MAX_CONSECUTIVE_EMPTY_PAGES = 5;
  const MIN_PAGE_MAX_MONTHLY_SALES = 50000;

  // ============================================================
  // ユーティリティ
  // ============================================================
  function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[¥,円%]/g, '').trim()) || 0;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function log(msg) {
    console.log(`[SS-Extract] ${msg}`);
  }

  // ============================================================
  // テーブル行の抽出
  // ============================================================
  function extractTableRows() {
    // SellerSpriteのテーブル行を探す（複数のセレクタを試行）
    const selectors = [
      '.ss-table tbody tr',
      '.seller-sprite-table tbody tr',
      '[class*="seller"] table tbody tr',
      'table tbody tr',
    ];

    let rows = [];
    for (const sel of selectors) {
      rows = document.querySelectorAll(sel);
      if (rows.length > 0) {
        log(`テーブル発見: ${sel} (${rows.length}行)`);
        break;
      }
    }

    if (rows.length === 0) {
      log('警告: テーブル行が見つかりません。SellerSpriteパネルが開いているか確認してください。');
      return [];
    }

    const products = [];
    rows.forEach((row, i) => {
      const tds = row.querySelectorAll('td');
      if (tds.length < 20) return; // データ行でない

      // ASIN取得（data-asin属性 or リンクから）
      let asin = '';
      const asinEl = row.querySelector('[data-asin]') || row.querySelector('a[href*="/dp/"]');
      if (asinEl) {
        asin = asinEl.dataset?.asin || (asinEl.href?.match(/\/dp\/([A-Z0-9]{10})/) || [])[1] || '';
      }

      // URL取得
      const linkEl = row.querySelector('a[href*="/dp/"]') || row.querySelector('a[href*="amazon.co.jp"]');
      const url = linkEl ? linkEl.href : '';

      const product = {
        index: i + 1,
        asin,
        name: tds[4]?.innerText?.trim() || '',
        brand: tds[6]?.innerText?.trim() || '',
        category: tds[7]?.innerText?.trim() || '',
        bsr: tds[8]?.innerText?.trim() || '',
        sales_count_raw: tds[9]?.innerText?.trim() || '',
        sales_amount_raw: tds[10]?.innerText?.trim() || '',
        variations_raw: tds[12]?.innerText?.trim() || '',
        price_raw: tds[13]?.innerText?.trim() || '',
        reviews_raw: tds[15]?.innerText?.trim() || '',
        rating_raw: tds[17]?.innerText?.trim() || '',
        fba_fee_raw: tds[19]?.innerText?.trim() || '',
        gross_margin_raw: tds[20]?.innerText?.trim() || '',
        sellers_raw: tds[22]?.innerText?.trim() || '',
        url,
      };

      // 数値パース
      product.price = parseNumber(product.price_raw);
      product.sales_count = parseNumber(product.sales_count_raw);
      product.sales_amount = parseNumber(product.sales_amount_raw);
      product.variations = parseNumber(product.variations_raw);
      product.reviews = parseNumber(product.reviews_raw);
      product.rating = parseNumber(product.rating_raw);
      product.fba_fee = parseNumber(product.fba_fee_raw);
      product.gross_margin = parseNumber(product.gross_margin_raw);
      product.sellers = parseNumber(product.sellers_raw);

      // 月商算出
      product.monthly_sales = product.sales_amount > 0
        ? product.sales_amount
        : product.price * product.sales_count;

      products.push(product);
    });

    return products;
  }

  // ============================================================
  // 一次フィルタ適用
  // ============================================================
  function applyFilter(products) {
    return products.filter(p => {
      if (p.price < FILTERS.minPrice) return false;
      if (p.monthly_sales < FILTERS.minMonthlySales) return false;
      if (p.monthly_sales > FILTERS.maxMonthlySales) return false;
      if (p.gross_margin < FILTERS.minGrossMargin) return false;
      if (p.variations > FILTERS.maxVariations) return false;
      if (p.reviews < FILTERS.minReviews) return false;
      if (p.reviews > FILTERS.maxReviews) return false;
      if (p.sellers < FILTERS.minSellers) return false;
      if (p.sellers > FILTERS.maxSellers) return false;
      return true;
    });
  }

  // ============================================================
  // ページネーション: 次ページボタンを探してクリック
  // ============================================================
  async function clickNextPage() {
    const nextSelectors = [
      '.ant-pagination-next:not(.ant-pagination-disabled)',
      '[class*="pagination"] [class*="next"]:not([disabled])',
      'button[class*="next"]:not([disabled])',
      'li[class*="next"]:not([class*="disabled"]) a',
    ];
    for (const sel of nextSelectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        btn.click();
        await sleep(1500);
        // 「更新」ボタンがあればクリック
        const updateBtn = document.querySelector('[class*="refresh"]') ||
                          Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('更新'));
        if (updateBtn) {
          updateBtn.click();
          await sleep(1000);
        }
        return true;
      }
    }
    return false;
  }

  // ============================================================
  // メイン処理
  // ============================================================
  const allFiltered = [];
  const seenAsins = new Set();
  let consecutiveEmpty = 0;
  let pageNum = 1;
  let totalProcessed = 0;

  log('=== SellerSprite データ抽出開始 ===');
  log(`フィルタ条件: 価格${FILTERS.minPrice}円以上, 月商${FILTERS.minMonthlySales/10000}〜${FILTERS.maxMonthlySales/10000}万, 粗利${FILTERS.minGrossMargin}%以上`);

  while (true) {
    log(`--- ページ ${pageNum} 処理中 ---`);
    await sleep(500);

    const products = extractTableRows();
    log(`  取得行数: ${products.length}`);

    if (products.length === 0) {
      log('  テーブルデータなし → 終了');
      break;
    }

    totalProcessed += products.length;

    // ページ最大月商チェック（撤退条件）
    const maxPageSales = Math.max(...products.map(p => p.monthly_sales));
    if (pageNum > 2 && maxPageSales < MIN_PAGE_MAX_MONTHLY_SALES) {
      log(`  ページ最大月商 ¥${maxPageSales.toLocaleString()} < ¥${MIN_PAGE_MAX_MONTHLY_SALES.toLocaleString()} → 以降スキップ`);
      break;
    }

    // フィルタ適用
    const filtered = applyFilter(products);

    // 重複排除（親ASIN単位）
    let pageHits = 0;
    for (const p of filtered) {
      const key = p.asin || p.name;
      if (key && seenAsins.has(key)) continue;
      if (key) seenAsins.add(key);
      allFiltered.push(p);
      pageHits++;
      log(`  ✓ HIT: ${p.name.substring(0, 40)} | ¥${p.price.toLocaleString()} | 月商¥${p.monthly_sales.toLocaleString()} | 粗利${p.gross_margin}% | レビュー${p.reviews} | セラー${p.sellers}`);
    }

    if (pageHits === 0) {
      consecutiveEmpty++;
      log(`  該当なし（連続${consecutiveEmpty}ページ）`);
      if (consecutiveEmpty >= MAX_CONSECUTIVE_EMPTY_PAGES) {
        log('  5ページ連続0件 → 終了');
        break;
      }
    } else {
      consecutiveEmpty = 0;
    }

    // 次ページへ
    const hasNext = await clickNextPage();
    if (!hasNext) {
      log('次ページなし → 全ページ完了');
      break;
    }
    pageNum++;
  }

  // ============================================================
  // 結果出力
  // ============================================================
  log(`\n=== 抽出完了 ===`);
  log(`総処理商品数: ${totalProcessed}`);
  log(`一次フィルタ通過: ${allFiltered.length}件`);

  if (allFiltered.length === 0) {
    console.warn('[SS-Extract] 該当商品なし。条件を満たす商品が見つかりませんでした。');
    return;
  }

  // 月商降順でソート
  allFiltered.sort((a, b) => b.monthly_sales - a.monthly_sales);

  // JSONとして出力（コピー用）
  const output = JSON.stringify(allFiltered, null, 2);
  console.log('\n========== コピー開始 ==========');
  console.log('SS_EXTRACT_RESULT:' + JSON.stringify(allFiltered));
  console.log('========== コピー終了 ==========\n');
  log('上記の SS_EXTRACT_RESULT: から始まる行をコピーして、process_results.py に渡してください。');

  return allFiltered;
})();
