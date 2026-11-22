"""Builds the app from its source parts.

src/app.css       -> app.css
src/js/*.js       -> app.js   (joined in file-name order, inside one private scope, like the original single file)
src/markup.html   -> the body of index.html

Each file name gets a short content hash in its URL, so phones always load the newest version
right after an update and keep using the cached copy until then.
"""
import hashlib, pathlib, re

root = pathlib.Path(__file__).parent
src = root / "src"

css = (src / "app.css").read_text()
parts = sorted((src / "js").glob("*.js"))
js = '(function(){\n"use strict";\n' + "\n".join(
    f"/* ===== {p.name} ===== */\n" + p.read_text() for p in parts) + "})();\n"
markup = (src / "markup.html").read_text().replace("/_blob/e659200739c3afba0768da39720081ed", "icons/emblem.png")

def tag(text):
    return hashlib.sha1(text.encode()).hexdigest()[:10]

(root / "app.css").write_text(css)
(root / "app.js").write_text(js)
shim = (root / "supabase-shim.js").read_text()

head = f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>יומן הרכב</title>
<meta name="description" content="מעקב טיפולים, דלק, הוצאות ותזכורות לרכב">
<meta name="theme-color" content="#0c0f13">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="יומן הרכב">
<meta property="og:title" content="יומן הרכב">
<meta property="og:description" content="מעקב טיפולים, דלק, הוצאות ותזכורות לרכב">
<meta property="og:image" content="https://adircordoba24-svg.github.io/car-journal/icons/icon-512.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<style>:root{{padding-top:0;padding-bottom:0}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<link rel="stylesheet" href="app.css?v={tag(css)}">
<script src="vendor/supabase.js"></script>
<script src="config.js"></script>
<script src="supabase-shim.js?v={tag(shim)}"></script>
</head>
<body>
"""
tail = f"""
<script src="app.js?v={tag(js)}"></script>
<script>if("serviceWorker" in navigator){{window.addEventListener("load",function(){{navigator.serviceWorker.register("sw.js").catch(function(){{}});}});}}</script>
</body>
</html>
"""
html = head + markup + tail
(root / "index.html").write_text(html)
print(f"built index.html {len(html)} · app.css {len(css)} · app.js {len(js)} ({len(parts)} parts)")
