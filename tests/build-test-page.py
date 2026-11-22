"""Builds tests/app.html and tests/admin.html: the real app pages, with the backend swapped for tests/mock-supabase.js."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
tests = root / "tests"
CFG = '<script>window.CJ_CONFIG={url:"x",anonKey:"y"}</script>'

def rewrite(html):
    html = html.replace('<script src="vendor/supabase.js"></script>', '<script src="mock-supabase.js"></script>')
    html = html.replace('<script src="config.js"></script>', CFG)
    # everything else is loaded from the repo root
    html = re.sub(r'(src|href)="(?!https?:|mock-supabase|#|data:)([^"]+)"', lambda m: f'{m.group(1)}="../{m.group(2)}"', html)
    return html

app = rewrite((root / "index.html").read_text())
app = app.replace('navigator.serviceWorker.register("../sw.js")', 'void 0')
(tests / "app.html").write_text(app)
(tests / "admin.html").write_text(rewrite((root / "admin.html").read_text()))
# scripts the app loads later (pdf.js, Excel) are fetched relative to the page
link = tests / "vendor"
if not link.exists():
    link.symlink_to("../vendor")
print("built tests/app.html and tests/admin.html")
