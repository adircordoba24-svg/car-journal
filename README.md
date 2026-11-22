# יומן הרכב

אפליקציה אישית למעקב אחרי הרכב: תדלוקים וצריכה, טיפולים, הוצאות וקבלות, תזכורות וסוכני AI.

- **אתר:** GitHub Pages (`index.html`, נבנה מ־`src/app.html` עם `python3 build.py`)
- **נתונים וקבלות:** Supabase (`supabase/schema.sql`)
- **AI:** פונקציה ב־Supabase (`supabase/functions/claude`) שמחזיקה את מפתח ה־API. Sonnet 5.5 לקבלות ולצ׳אט, Opus 5.5 לתכנון ולניתוח.

להתקנה באייפון: פותחים את האתר ב־Safari, שיתוף ואז ״הוסף למסך הבית״.


## איך עובדים על הקוד (מעודכן)

- **קוד המקור:** `src/app.css`, `src/markup.html`, `src/js/*.js` (8 חלקים לפי נושא).
- **בנייה:** `python3 build.py` יוצר `index.html`, `app.css`, `app.js`.
- **בדיקות:** `python3 tests/build-test-page.py && node tests/smoke.test.js` (‏27 בדיקות בטלפון מדומה, מול שרת מדומה עם נתונים מומצאים).
- **GitHub Actions:** כל עדכון ל־`main` עובר את הבדיקות, ורק אם הכל עבר הוא עולה לאוויר.
- **סביבת ניסוי:** ענף `staging`, בכתובת `/car-journal/staging/` עם פס אדום "סביבת ניסוי". היא משתמשת באותו שרת, אז כדאי להיכנס אליה עם משתמש בדיקה.
- **מסך מנהל:** `admin.html`, רק למנהלים (טבלת `app_admins`).
- **גיבוי לילי:** פונקציית `backup` רצה ב־02:15 ושומרת 14 ימים בדלי הפרטי `backups`.
