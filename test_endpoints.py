import urllib.request
import json
import base64
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
headers = {
    'Authorization': b'ESA ' + base64.b64encode(b'SP430448_mSTF0gOFuuzvBz31:SL430448_cPy8ycZxKjMIlUkQ'),
    'Content-Type': 'application/json; charset=utf-8'
}
manage_number = "compass1772335069"
sp_text = ""

update_url = f"https://api.rms.rakuten.co.jp/rms/2.0/items/{manage_number}"
update_data = {
    "manageNumber": manage_number,
    "smartphoneItemInfo": "",
    "version": 7
}

print(f"\nTesting PUT {update_url}")
req = urllib.request.Request(update_url, data=json.dumps(update_data).encode("utf-8"), headers=headers, method="PUT")
try:
    with urllib.request.urlopen(req) as res:
        print("  SUCCESS", res.status, res.read().decode())
except urllib.error.HTTPError as e:
    print("  ERROR", e.code, e.read().decode())
except Exception as e:
    print("  EXCEPTION", e)
