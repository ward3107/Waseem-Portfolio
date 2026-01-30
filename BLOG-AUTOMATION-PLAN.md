# Automated Blog Content Renewal - Plan for Later

## Goal
Implement a hybrid blog system that combines manual featured posts with automated weekly RSS feed updates covering AI News, Web Dev, Tech Industry, and portfolio-related niches.

---

## Quick Summary

**Your Preferences:**
- **Content Source**: Hybrid (RSS feeds + manual posts)
- **Update Frequency**: Weekly
- **Topics**: AI News, Web Dev, Tech Industry, Your Niche

**Recommended Solution:**
- RSS feed integration from major tech blogs
- Weekly content refresh (7-day cache)
- Manual posts always show first (featured content)
- External posts marked with source badges
- All feeds have enabled/disable toggles

---

## Key Implementation Steps

### 1. Install Dependencies
```bash
npm install rss-parser axios date-fns
npm install --save-dev @types/rss-parser tsx
```

### 2. Create RSS Feed Configuration
**File**: `lib/rss-feeds.ts`
- Add feed URLs for OpenAI, Google AI, React Blog, TechCrunch, etc.
- Each feed has: url, category, name, enabled flag

### 3. Create RSS Parser
**File**: `lib/rss-parser.ts`
- Parse RSS feeds using `rss-parser`
- Convert to BlogPost format
- Calculate read time, strip HTML, truncate excerpts

### 4. Create Content Merger
**File**: `lib/content-merger.ts`
- Combine manual posts + RSS posts
- Filter to last 7 days (weekly refresh)
- Sort by date (newest first)
- In-memory cache for 7 days

### 5. Update Blog Component
**File**: `components/Blog.tsx`
- Add loading state with spinner
- Add error state with retry button
- Show source badges for external posts
- External links open in new tab

---

## Recommended RSS Sources

### AI News
- OpenAI Blog: `https://openai.com/blog/rss.xml`
- Google AI: `https://blog.google/technology/ai/rss/`
- Anthropic: `https://www.anthropic.com/index/rss`

### Web Development
- React Blog: `https://react.dev/blog/rss.xml`
- Vercel: `https://vercel.com/blog/rss.xml`
- CSS-Tricks: `https://css-tricks.com/feed/`

### Tech Industry
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`
- Wired: `https://www.wired.com/feed/rss`

### Portfolio/Automation Niche
- Zapier: `https://zapier.com/blog/rss/`
- HubSpot: `https://blog.hubspot.com/marketing/rss.xml`

---

## Two Implementation Approaches

### Option A: Client-Side Fetching (Simple)
- Fetches RSS feeds when user visits
- 7-day cache in memory
- No redeployment needed
- Slower initial load

### Option B: Build-Time Generation (Fastest)
- Script runs during `npm run build`
- Content is static (fast loading)
- Best for SEO
- Requires redeployment for updates

---

## Files to Create

1. `lib/rss-feeds.ts` - RSS configuration
2. `lib/rss-parser.ts` - Parsing logic
3. `lib/content-merger.ts` - Merge manual + RSS
4. `scripts/fetch-rss-content.ts` - Build script (optional)

## Files to Modify

1. `components/Blog.tsx` - Dynamic loading
2. `types/index.ts` - Update BlogPost interface
3. `contexts/LanguageContext.tsx` - Add translations
4. `package.json` - Add dependencies

---

## Notes for Later Implementation

- **CORS Issue**: Browser-based RSS fetching may be blocked. Use build-time generation or CORS proxy.
- **Rate Limiting**: Don't fetch too many feeds at once. Add delays between fetches.
- **Error Handling**: Some feeds may fail silently. Always have fallbacks.
- **Content Quality**: Consider filtering out low-quality or irrelevant posts.
- **Performance**: Limit to ~50 posts total to avoid slow rendering.

---

## When Ready to Implement

1. Start with 3-5 RSS feeds only (test first)
2. Add more feeds gradually
3. Monitor performance
4. Check for CORS errors
5. Add content filtering if needed
6. Consider GitHub Actions for weekly auto-build
