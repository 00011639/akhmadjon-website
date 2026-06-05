# Akhmadjon Khasanjonov — Portfolio Website
**CA State Champion 2026 · Greco-Roman Wrestler · California, USA**

---

## What's Built

| File | Description |
|------|-------------|
| `index.html` | Homepage — hero photo, Ali quote, stats, achievements preview |
| `about.html` | Full story — Tashkent origin, timeline, medals, California chapter |
| `achievements.html` | US 2026 results, videos, competition brackets, 21 diplomas |
| `sacrifice.html` | The Price — cutting weight video, cauliflower ear, Greco vs Freestyle, Saitiev |
| `training.html` | Services — classes, personal training, competition prep |
| `contact.html` | Contact form → email notification + Supabase database storage |
| `css/style.css` | Full shared stylesheet — Black/White/Red, mobile responsive |
| `js/main.js` | Cursor, scroll reveals, language switcher, view counter, contact form, lightbox |
| `backend/server.js` | Express API — view counter + contact form handler |
| `backend/package.json` | Node.js dependencies |

---

## Deploy in 4 Steps

### Step 1 — Supabase (Database) — FREE

1. Go to [supabase.com](https://supabase.com) → Create New Project
2. Name it `akhmadjon-website` · Choose a strong password · Region: US West
3. Go to **SQL Editor** and run this to create the two tables:

```sql
-- View counter table
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO page_views (id, count) VALUES (1, 0);

-- Contact form submissions
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`

---

### Step 2 — Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. **Security → 2-Step Verification** → enable it (required)
3. **Security → App Passwords** → Create new → name it "Website"
4. Copy the 16-character password → this is your `GMAIL_APP_PASS`

---

### Step 3 — Deploy Backend on Railway — FREE TIER

1. Go to [railway.app](https://railway.app) → Login with GitHub
2. **New Project → Deploy from GitHub Repo** → select this repo
3. Set the **Root Directory** to `backend`
4. Add **Environment Variables** (Settings → Variables):
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   GMAIL_USER=akhmadjonusa2001@gmail.com
   GMAIL_APP_PASS=your-app-password
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   PORT=3000
   ```
5. Railway will automatically detect Node.js and deploy
6. Copy your Railway URL (looks like `https://akhmadjon-backend.up.railway.app`)

---

### Step 4 — Deploy Frontend on Vercel — FREE

1. Go to [vercel.com](https://vercel.com) → Login with GitHub
2. **New Project → Import** this repository
3. **Root Directory**: leave as `/` (root)
4. Add one **Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
   ```
5. Deploy → Vercel gives you a URL like `https://akhmadjonwrestler.vercel.app`

6. **Update the frontend API calls** — in `js/main.js`, change the fetch URLs to use your Railway backend:
   ```javascript
   // Replace '/api/views' with your full Railway URL
   const API = 'https://your-railway-backend.up.railway.app';
   const res = await fetch(`${API}/api/views`, ...);
   ```

---

### Custom Domain (Optional)

1. Buy domain on [Namecheap](https://namecheap.com) — `akhmadjonwrestler.com` or similar (~$10-15/year)
2. In Vercel: **Settings → Domains** → add your domain
3. Follow DNS setup instructions (takes 5-30 minutes to propagate)

---

## Languages

The site uses **Google Translate Widget** for multilingual support:
- English (default)
- Russian (RU)
- Uzbek (ЎЗ / LAT)
- Arabic (عر) — triggers RTL layout automatically

Language preference is saved in `localStorage` and persists across pages.

---

## Local Development

```bash
# Install backend dependencies
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# → edit .env with your Supabase keys and Gmail app password

# Start the backend server
npm run dev
# Server runs at http://localhost:3000
```

Then open `index.html` directly in your browser, or use a simple static server:
```bash
# From the project root
npx serve .
# Open http://localhost:5000
```

---

## Supabase — Check Messages

1. Go to [supabase.com](https://supabase.com) → your project → **Table Editor**
2. Open the `contacts` table → see all messages with name, email, phone, message, timestamp
3. Open `page_views` → see total visitor count

---

## Assets Used

```
images/
├── flag-1.jpg          Homepage hero background
├── flag-2.jpg          Achievements page hero
├── flag-3.jpg          About page hero
├── trophy-outside.jpg  Trophy + peace sign
├── trophy-closeup.jpg  CA State Bear trophy closeup
├── us-open.jpg         USA Wrestling official backdrop
├── polo-alto.png       First win in California
├── childhood-1.jpg     Young Akhmadjon, Tashkent
├── childhood-2.jpg     Youth wrestling crew, Tashkent
├── broken-ears.jpg     Cauliflower ear — sacrifice page
├── medals-uzbekistan.jpg  30+ medals collection
├── ali-ring.jpg        Muhammad Ali — quote section
├── ali-press.jpg       Muhammad Ali — press photo
├── bracket-1,2,3.jpg   Competition bracket photos
├── final-bracket.jpg   Championship final bracket
├── diploma-1..21.jpg   21 official competition diplomas
├── cutting-weight.mp4  6.6s cutting weight video (hero bg)
└── adam-saitiev.mp4    43s Adam Saitiev footage
```

---

Built with pure HTML, CSS, and JavaScript. No framework dependencies.  
Backend: Node.js · Express · Supabase · Nodemailer  
**CA State Champion 2026 · Greco-Roman Wrestling**
