"""בונה את index.html מקוד האפליקציה (src/app.html) עם החיבור ל-Supabase."""
import re, pathlib
root = pathlib.Path(__file__).parent
app = (root / "src" / "app.html").read_text()
app = re.sub(r"^<title>.*?</title>\s*", "", app, flags=re.S)
app = app.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
app = app.replace("/_blob/e659200739c3afba0768da39720081ed", "icons/emblem.png")
head = """<!doctype html>
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
<style>:root{padding-top:0;padding-bottom:0}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
<script src="vendor/supabase.js"></script>
<script src="config.js"></script>
<script src="supabase-shim.js"></script>
</head>
<body>
"""
tail = """
<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>
</body>
</html>
"""
(root / "index.html").write_text(head + app + tail)
print("built index.html", len(head + app + tail))
