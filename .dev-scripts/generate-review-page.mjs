// Generates a shareable "leave a review" landing page at /public/review/ .
// Give this link (or a QR of it) to happy clients so they can drop a Google
// review in two taps — reviews are the #1 local-ranking lever.
//
// ⚠️ SET YOUR REAL GOOGLE REVIEW LINK BELOW (REVIEW_URL). Until you paste the
// exact "write a review" link, the button falls back to a Google Maps search
// for your business (still works, just one extra tap). See how-to in the
// Notion task list.
//
// The page is noindex (it's a share/QR utility, not search content).
//
// Run: node .dev-scripts/generate-review-page.mjs   (also run by `npm run build`)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const SITE = 'https://waseemp.vercel.app';

// 👉 Paste your exact Google "write a review" link here when you have it, e.g.
//    https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
//    or your short g.page/r/... link.
const REVIEW_URL =
  'https://www.google.com/maps/search/?api=1&query=Waseem%20web%20developer%20Kfar%20Yasif';

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>השאירו ביקורת · וסים — בניית אתרים</title>
  <meta name="description" content="תודה שבחרתם בי! ביקורת קצרה בגוגל עוזרת מאוד לעסק קטן." />
  <meta name="robots" content="noindex, follow" />
  <meta name="theme-color" content="#483AA0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    :root{--purple:#483AA0;--purple-2:#6C5CE7;--gold:#D4AF37;--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#475569;--border:#e2e8f0}
    @media (prefers-color-scheme: dark){:root{--bg:#0a0820;--card:#14122e;--text:#f1f5f9;--muted:#94a3b8;--border:#2a2650}}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Rubik','Segoe UI',system-ui,-apple-system,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.7;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;-webkit-font-smoothing:antialiased}
    .card{background:var(--card);border:1px solid var(--border);border-radius:24px;max-width:480px;width:100%;padding:40px 28px;text-align:center;box-shadow:0 20px 60px rgba(72,58,160,.12)}
    .stars{font-size:34px;letter-spacing:4px;color:var(--gold);margin-bottom:18px}
    h1{font-size:clamp(24px,6vw,32px);font-weight:800;letter-spacing:-.5px;margin-bottom:12px}
    p{color:var(--muted);font-size:17px;margin-bottom:22px}
    ol{text-align:right;max-width:340px;margin:0 auto 26px;padding-inline-start:0;list-style:none;display:grid;gap:12px}
    ol li{display:flex;gap:12px;align-items:flex-start;font-size:16px}
    ol li b{background:var(--purple-2);color:#fff;min-width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:800}
    .btn{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(90deg,var(--purple),var(--purple-2));color:#fff;font-weight:800;font-size:18px;padding:16px 32px;border-radius:16px;box-shadow:0 12px 30px color-mix(in srgb,var(--purple) 40%,transparent);transition:transform .2s}
    .btn:hover{transform:translateY(-2px)}
    .thanks{margin-top:20px;font-size:14px;color:var(--muted)}
    a.home{color:var(--purple-2);font-weight:600}
  </style>
</head>
<body>
  <main class="card">
    <div class="stars" aria-hidden="true">★★★★★</div>
    <h1>תודה שבחרתם בי! 🙏</h1>
    <p>ביקורת קצרה בגוגל עוזרת מאוד לעסק קטן כמו שלי — זה לוקח פחות מדקה.</p>
    <ol>
      <li><b>1</b><span>לחצו על הכפתור למטה</span></li>
      <li><b>2</b><span>בחרו דירוג כוכבים וכתבו מילה טובה</span></li>
      <li><b>3</b><span>לחצו "פרסום" — וזהו! ❤️</span></li>
    </ol>
    <a class="btn" href="${REVIEW_URL}" target="_blank" rel="noopener">⭐ כתבו ביקורת בגוגל</a>
    <div class="thanks">בזכותכם עסקים נוספים מוצאים אותי. <a class="home" href="${SITE}/">לאתר הראשי</a></div>
  </main>
</body>
</html>
`;

mkdirSync(resolve(publicDir, 'review'), { recursive: true });
writeFileSync(resolve(publicDir, 'review', 'index.html'), html, 'utf8');
console.log('✓ review/index.html');
