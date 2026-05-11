#!/usr/bin/env python3
"""
JAN登録ツール用 Excel生成サーバー (port 8082)
HTMLツールからPOSTされたJSONを受け取り、テンプレートXMLを直接編集してXLSXを返す。
openpyxlを一切使わず、テンプレートのXML構造・メタデータを完全保持。
"""
import json, io, os, re, html, zipfile
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__),
    '.playwright-mcp', 'gjdb-product-upload-20260502.xlsx')

NEW_TEMPLATE = os.path.expanduser('~/Downloads/gjdb_product_uploadform.xlsx')
if os.path.exists(NEW_TEMPLATE):
    TEMPLATE_PATH = NEW_TEMPLATE

# テンプレートの列順（row1ヘッダーと対応）
HEADERS = [
    'GTINステータスコード','GTINステータス','GTIN','GS1事業者コード','事業者名',
    '商品名','商品名（カナ）','取扱品目コード','取扱品目名称','JICFS分類コード',
    'JICFS分類名称','GPC（GS1商品分類）コード','GPC（GS1商品分類）名称','ブランド名',
    '内容量','内容量単位名称','内容量単位コード','表示用規格','商品名（詳細）',
    '消費者向け区分','自社商品コード','品名','商品情報URL','商品コメント',
    'サイズ（幅）','サイズ（幅）単位名称','サイズ（幅）単位コード',
    'サイズ（高さ）','サイズ（高さ）単位名称','サイズ（高さ）単位コード',
    'サイズ（奥行き）','サイズ（奥行き）単位名称','サイズ（奥行き）単位コード',
    '総重量','総重量単位名称','総重量単位コード','希望小売価格','オープン価格フラグ',
    '軽減標準判定区分','消費税区分','消費税率','原産国（地域）コード','原産国（地域）',
    '販売対象国（地域）コード','販売対象国（地域）',
    '情報公開日','出荷可能日','出荷終了日','GTIN使用終了日',
    '言語コード1','言語1','他言語商品情報URL1',
    '言語コード2','言語2','他言語商品情報URL2',
    '言語コード3','言語3','他言語商品情報URL3',
    '言語コード4','言語4','他言語商品情報URL4',
    '言語コード5','言語5','他言語商品情報URL5',
    '登録事業者用メモ','登録日時','更新日時',
]

def col_letter(n):
    """1始まりの列番号 → Excel列文字 (1→A, 27→AA)"""
    result = ''
    while n > 0:
        n, rem = divmod(n - 1, 26)
        result = chr(65 + rem) + result
    return result

def header_to_col(name):
    """ヘッダー名 → Excel列文字"""
    return col_letter(HEADERS.index(name) + 1)

def escape_xml(text):
    return text.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

def to_full_width(text):
    """半角英数記号→全角、半角スペース→全角スペース"""
    if not text: return ''
    result = []
    for c in text:
        code = ord(c)
        if 0x21 <= code <= 0x7E:
            result.append(chr(code + 0xFEE0))
        elif c == ' ':
            result.append('　')
        else:
            result.append(c)
    return ''.join(result)

def fix_kana(text):
    """カナ文字列の正規化：制御文字除去・半角スペース→全角・100文字以内"""
    if not text: return ''
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    text = text.replace(' ', '　')
    return text[:100]

def generate_xlsx(payload):
    groups = payload.get('groups', [])
    selected_gs1 = payload.get('selectedGs1', '')

    # テンプレートを全ファイル読み込み
    with zipfile.ZipFile(TEMPLATE_PATH, 'r') as tmpl_zip:
        tmpl_files = {name: tmpl_zip.read(name) for name in tmpl_zip.namelist()}

    sheet1_xml = tmpl_files['xl/worksheets/sheet1.xml'].decode('utf-8')
    ss_xml     = tmpl_files['xl/sharedStrings.xml'].decode('utf-8')

    # sharedStrings の全エントリをインデックス付きでマップ化
    # <si><t>...</t></si> と <si><r><t>...</t></r></si> 両形式に対応
    si_all = re.findall(r'<si>(.*?)</si>', ss_xml, re.DOTALL)
    ss_total = len(si_all)
    ss_text_to_idx = {}
    for i, si in enumerate(si_all):
        texts = re.findall(r'<t[^>]*>([^<]*)</t>', si)
        combined = html.unescape(''.join(texts))
        if combined and combined not in ss_text_to_idx:
            ss_text_to_idx[combined] = i

    new_si_entries = []

    def get_or_add(text):
        if not text:
            return None
        if text in ss_text_to_idx:
            return ss_text_to_idx[text]
        if text in new_si_entries:
            return ss_total + new_si_entries.index(text)
        new_si_entries.append(text)
        return ss_total + len(new_si_entries) - 1

    def s_cell(row_num, col_name, value):
        """文字列セルXMLを生成 (t="s")"""
        if value is None or value == '':
            return ''
        idx = get_or_add(str(value))
        if idx is None:
            return ''
        c = header_to_col(col_name)
        return f'<c r="{c}{row_num}" t="s"><v>{idx}</v></c>'

    def n_cell(row_num, col_name, value):
        """整数セルXMLを生成"""
        try:
            num = int(value)
            c = header_to_col(col_name)
            return f'<c r="{c}{row_num}"><v>{num}</v></c>'
        except (ValueError, TypeError):
            return ''

    def f_cell(row_num, col_name, value):
        """小数セルXMLを生成"""
        try:
            num = float(value)
            c = header_to_col(col_name)
            return f'<c r="{c}{row_num}"><v>{num}</v></c>'
        except (ValueError, TypeError):
            return ''

    def col_sort_key(cell_xml):
        """セルXMLをr属性の列順でソートするキー"""
        m = re.search(r'r="([A-Z]+)(\d+)"', cell_xml)
        if not m:
            return (0, 0)
        letters = m.group(1)
        n = 0
        for ch in letters:
            n = n * 26 + (ord(ch) - 64)
        return (n, int(m.group(2)))

    # 各バリアントのデータ行XMLを生成
    rows_xml_parts = []
    row_num = 4

    for g in groups:
        brand = g.get('fields', {}).get('brandCustom') or g.get('fields', {}).get('brand', '')
        product_name = to_full_width(g.get('name', '').strip())
        fields = g.get('fields', {})

        for v in g.get('variants', []):
            color = to_full_width(v.get('color', ''))
            size  = to_full_width(v.get('size', ''))
            spec  = '　'.join(filter(None, [color, size]))
            final_name = product_name + ('　' + spec if spec else '')
            brand_fw = to_full_width(brand)

            if v.get('detailEdited'):
                detail = to_full_width(v.get('detail', ''))
                # 詳細に大文字のブランド名が含まれない場合、小文字版を試みる
                # （ユーザーが小文字で入力した場合の対応）
                if brand_fw and brand_fw not in detail:
                    brand_lower_fw = to_full_width(brand.lower())
                    if brand_lower_fw in detail:
                        brand_fw = brand_lower_fw
            else:
                detail = to_full_width('　'.join(filter(None, [brand, product_name, color, size])))

            jan = v.get('jan', '')
            sku = v.get('sku', '')

            cells = [
                s_cell(row_num, 'GTINステータスコード', '02'),
                s_cell(row_num, 'GTIN', jan),
                s_cell(row_num, 'GS1事業者コード', selected_gs1),
                s_cell(row_num, '商品名', final_name),
                s_cell(row_num, '商品名（カナ）', fix_kana(fields.get('nameKana', ''))),
                s_cell(row_num, 'ブランド名', brand_fw),
                s_cell(row_num, '内容量単位名称', fields.get('qtyUnit', '個')),
                s_cell(row_num, '内容量単位コード', '001'),
                s_cell(row_num, '表示用規格', spec),
                s_cell(row_num, '商品名（詳細）', detail),
                s_cell(row_num, '消費者向け区分', fields.get('consumer', '1')),
                s_cell(row_num, 'オープン価格フラグ', '1'),
                s_cell(row_num, '原産国（地域）コード', fields.get('origin', '156')),
                s_cell(row_num, '販売対象国（地域）コード', '392'),
            ]
            if sku:
                cells.append(s_cell(row_num, '自社商品コード', sku))
            if fields.get('itemCode'):
                cells.append(n_cell(row_num, '取扱品目コード', fields['itemCode']))
            if fields.get('gpc'):
                cells.append(n_cell(row_num, 'GPC（GS1商品分類）コード', fields['gpc']))
            if fields.get('jicfs'):
                cells.append(n_cell(row_num, 'JICFS分類コード', fields['jicfs']))
            if fields.get('qty'):
                cells.append(f_cell(row_num, '内容量', fields['qty']))

            cells = [c for c in cells if c]
            cells.sort(key=col_sort_key)
            rows_xml_parts.append(
                f'<row r="{row_num}" spans="1:67">' + ''.join(cells) + '</row>'
            )
            row_num += 1

    new_rows_str = ''.join(rows_xml_parts)

    # テンプレートのsheet1.xmlのsheetDataを編集
    # ヘッダー行（1-3）を保持し、row4以降のデータ行をすべて置換
    def replace_sheet_data(m):
        inner = m.group(1)
        # row r="1", "2", "3" を残し、4以降は削除して新データを挿入
        header_rows = re.findall(r'<row[^>]*r="[123]"[^>]*>.*?</row>', inner, re.DOTALL)
        return '<sheetData>' + ''.join(header_rows) + new_rows_str + '</sheetData>'

    sheet1_fixed = re.sub(
        r'<sheetData>(.*?)</sheetData>',
        replace_sheet_data,
        sheet1_xml,
        flags=re.DOTALL
    )

    # sharedStringsに新エントリを追記してcount/uniqueCount更新
    total = ss_total + len(new_si_entries)
    ss_fixed = re.sub(r'(count=")[^"]*(")', f'\\g<1>{total}\\2', ss_xml)
    ss_fixed = re.sub(r'(uniqueCount=")[^"]*(")', f'\\g<1>{total}\\2', ss_fixed)
    new_si_xml = ''.join(
        f'<si><t xml:space="preserve">{escape_xml(t)}</t></si>'
        for t in new_si_entries
    )
    ss_fixed = ss_fixed.replace('</sst>', new_si_xml + '</sst>')

    # テンプレートの全ファイルをベースに、sheet1とsharedStringsだけ差し替え
    result = io.BytesIO()
    with zipfile.ZipFile(result, 'w', zipfile.ZIP_DEFLATED) as out_zip:
        for name, data in tmpl_files.items():
            if name == 'xl/worksheets/sheet1.xml':
                out_zip.writestr(name, sheet1_fixed.encode('utf-8'))
            elif name == 'xl/sharedStrings.xml':
                out_zip.writestr(name, ss_fixed.encode('utf-8'))
            else:
                out_zip.writestr(name, data)

    return result.getvalue(), row_num - 4


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if urlparse(self.path).path != '/generate':
            self.send_response(404); self.end_headers(); return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body)
            xlsx_bytes, count = generate_xlsx(payload)
            from datetime import date
            fname = f'gjdb_product_upload_{date.today().strftime("%Y%m%d")}.xlsx'
            self.send_response(200)
            self._cors()
            self.send_header('Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            self.send_header('Content-Disposition', f'attachment; filename="{fname}"')
            self.send_header('Content-Length', str(len(xlsx_bytes)))
            self.end_headers()
            self.wfile.write(xlsx_bytes)
            print(f'[OK] {count}件のExcelを生成', flush=True)
        except Exception as e:
            import traceback
            msg = traceback.format_exc().encode()
            self.send_response(500)
            self._cors()
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)
            print(f'[ERROR] {e}', flush=True)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')


if __name__ == '__main__':
    port = 8082
    print(f'JAN Excel生成サーバー起動: http://localhost:{port}', flush=True)
    print(f'テンプレート: {TEMPLATE_PATH}', flush=True)
    HTTPServer(('localhost', port), Handler).serve_forever()
