# GEO + SEO Audit Report

Audit target: `https://sshkeygenerator.com/`  
Audit date: `2026-03-13`  
Business type: browser-based developer tool / SSH key generator

## Executive Summary

This audit followed the same safe, additive GEO+SEO framework you provided and adapted it to the current `ssh-key-generator` project. The live site baseline was solid on mobile performance, but it had clear international SEO, AI crawler, and structured-data gaps:

- localized routes existed in the app, but their first HTML response still carried mostly English head metadata
- `sitemap.xml` lagged behind the real language set
- `llms.txt` and `/.well-known/llms.txt` were missing, and the live host fell back to homepage HTML with `200`
- FAQ rich-result data did not match the visible FAQ set

I implemented safe, additive fixes in the repo. After the next deployment, the projected GEO score improves to `86/100`.

## Scoring

Note: the original plan weights sum to `80`, so the final composite score below is normalized to `100`.

| Area | Weight | Baseline | After Changes |
| --- | ---: | ---: | ---: |
| AI visibility | 25 | 14 | 21 |
| Platform readiness | 10 | 6 | 8 |
| Technical SEO | 15 | 10 | 13 |
| Content quality | 20 | 15 | 18 |
| Schema / structured data | 10 | 5 | 9 |
| Normalized GEO score | 100 | 63/100 | 86/100 |

## Live-Site Findings

### High

1. Localized routes were not fully localized at first HTML response.
   - On `2026-03-13`, fetching `https://sshkeygenerator.com/zh-Hans/` returned HTML with English title, description, OG, and canonical defaults before client-side hydration.
   - Risk: weaker hreflang consistency, poorer AI/web-search citation quality for non-English routes.

2. `sitemap.xml` did not reflect the full supported language set.
   - The app/router supported `fi`, `uk`, `ar`, `th`, `ro`, `cs`, `bn`, `el`, `hu`, but the old sitemap and static head alternates did not include them all.
   - Risk: incomplete international discovery and mixed signals between router, sitemap, and head.

3. `llms.txt` and `/.well-known/llms.txt` were missing.
   - On `2026-03-13`, `https://sshkeygenerator.com/llms.txt` returned homepage HTML with `200`, not a machine-readable LLM document.
   - Risk: bad AI crawler ergonomics and misleading bot responses.

### Medium

4. FAQ structured data did not match the visible FAQ set.
   - Static JSON-LD was missing entries that existed in translations / intended FAQ coverage.
   - Risk: reduced rich-result trust and schema consistency.

5. SEO content was delayed behind lazy rendering.
   - The main explanatory content and FAQ block were only rendered after intersection or a 5-second timer.
   - Risk: weaker answer-block readiness for bots that execute limited JS.

6. Security headers were minimal.
   - Live response headers included `referrer-policy` and `x-content-type-options`, but not `x-frame-options`, `permissions-policy`, or `strict-transport-security`.

### Low

7. External brand footprint appears limited.
   - Spot web searches on `2026-03-13` did not surface obvious third-party citations for `sshkeygenerator.com`.
   - This is not a blocker, but it limits AI citation likelihood outside the site itself.

8. Desktop PageSpeed official API data was not captured.
   - The mobile PageSpeed snapshot succeeded, but later desktop requests hit Google API errors / quota exhaustion during audit.

## Performance Snapshot

Official mobile PageSpeed snapshot captured on `2026-03-13`:

- Performance: `94`
- Accessibility: `97`
- Best Practices: `100`
- SEO: `100`
- FCP: `2.1s`
- LCP: `2.1s`
- TBT: `90ms`
- CLS: `0`
- Speed Index: `4.1s`
- Top opportunity: reduce unused JavaScript, estimated `~70 KiB`

Interpretation:

- Core Web Vitals are already in a healthy range on mobile.
- This project benefits more from crawlability, metadata, and structured-data fixes than from aggressive performance refactors.

## Landed Changes

### 1. International SEO normalization

- Added a centralized language config (`src/i18n/languageConfig.json`, `src/i18n/languageConfig.ts`) as the single source for routes and hreflang output.
- Kept runtime metadata sync aligned with that config.
- Added a build-time SEO asset generator (`scripts/generate-seo-assets.mjs`) that now:
  - regenerates `public/sitemap.xml`
  - generates localized `dist/<lang>/index.html`
  - rewrites localized title, description, canonical, OG, Twitter, and JSON-LD per language
  - injects crawlable fallback links for non-JS crawlers

### 2. GEO / AI visibility upgrades

- Added `public/llms.txt`
- Added `public/.well-known/llms.txt`
- Expanded `public/robots.txt` with explicit allow rules for major search and AI crawlers
- Added `public/_headers` with safe security headers for Cloudflare Pages

### 3. Schema and content alignment

- Reworked page metadata sync in `src/lib/seo.ts` to manage:
  - title
  - description
  - robots
  - canonical
  - OG / Twitter fields
  - localized JSON-LD
- Added / aligned these schema types:
  - `WebSite`
  - `SoftwareApplication`
  - `FAQPage`
  - `HowTo`
  - `Organization`
- Expanded FAQ coverage to include the “best online generator” question, bringing visible content and structured data into alignment.
- Added stable anchor IDs to key content sections and HowTo steps for better citation targeting.

### 4. Content availability improvements

- Removed the delayed SEO-content reveal and rendered the SEO content block immediately in the page flow.
- This keeps the explanatory content and FAQ available earlier for both users and crawlers.

### 5. Housekeeping

- Fixed an unrelated existing lint failure in `src/components/ui/button.tsx` by removing an unused export.

## Remaining Risks

1. The live hosting layer may still be configured for broad SPA fallback.
   - Real `llms.txt` files are now in the repo and build output, but if Cloudflare Pages has a dashboard-level fallback rule for all unknown paths, generic nonexistent URLs can still resolve to `index.html`.
   - Recommended follow-up: verify the production fallback behavior after deployment.

2. No GSC / GA account data was used.
   - This report is strong on crawlability, metadata, and live fetch analysis, but it does not include impression/CTR/query data from Search Console.

3. External citations remain thin.
   - The site is now better prepared to be cited by AI systems, but off-site mentions still need time and distribution to grow.

## Safe Action Plan

### Already implemented

1. Deploy the current branch so the localized HTML, `llms.txt`, sitemap, and headers go live.
2. Re-fetch these URLs after deployment:
   - `/`
   - `/zh-Hans/`
   - `/ar/`
   - `/llms.txt`
   - `/.well-known/llms.txt`
   - `/sitemap.xml`

### Recommended next, still safe

1. Validate the updated rich results in Google Rich Results Test.
2. Submit the refreshed sitemap in Google Search Console and Bing Webmaster Tools.
3. Review Cloudflare Pages fallback behavior for unknown URLs.
4. Add a small “Security / How it works” citation block near the top of the page if you want even stronger AI answer-block extraction.

## Verification

Local verification completed:

- `pnpm build` ✅
- `pnpm lint` ✅
- build output contains:
  - localized `dist/<lang>/index.html`
  - `dist/llms.txt`
  - `dist/.well-known/llms.txt`
  - `dist/_headers`
- generated sitemap includes all supported languages

## Files Touched

- `index.html`
- `public/robots.txt`
- `public/llms.txt`
- `public/.well-known/llms.txt`
- `public/_headers`
- `public/sitemap.xml`
- `scripts/generate-seo-assets.mjs`
- `src/App.tsx`
- `src/lib/seo.ts`
- `src/components/seo/SEOContent.tsx`
- `src/components/seo/FAQSection.tsx`
- `src/components/pages/NotFound.tsx`
- `src/i18n/languageConfig.ts`
- `src/i18n/languageStore.ts`
- `src/components/ui/button.tsx`
- `vite.config.ts`
