# יומן הרכב

אפליקציה אישית למעקב אחרי הרכב: תדלוקים וצריכה, טיפולים, הוצאות וקבלות, תזכורות וסוכני AI.

- **אתר:** GitHub Pages (`index.html`, נבנה מ־`src/app.html` עם `python3 build.py`)
- **נתונים וקבלות:** Supabase (`supabase/schema.sql`)
- **AI:** פונקציה ב־Supabase (`supabase/functions/claude`) שמחזיקה את מפתח ה־API. Sonnet 5.5 לקבלות ולצ׳אט, Opus 5.5 לתכנון ולניתוח.

להתקנה באייפון: פותחים את האתר ב־Safari, שיתוף ואז ״הוסף למסך הבית״.
