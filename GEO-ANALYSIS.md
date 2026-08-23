# SSH Key Generator GEO Analysis

- Canonical site: https://sshkeygenerator.com/
- GSC property: `sc-domain:sshkeygenerator.com`
- Analysis and verification date: 2026-08-23
- Score basis: post-change repository readiness plus live technical evidence; new llms files require deployment before the live endpoint changes.

## GEO Readiness Score: 83/100

| Criterion | Score | Weight | Evidence |
|---|---:|---:|---|
| Passage citability | 23 | 25 | New self-contained 134–167-word answer blocks and explicit boundaries |
| Structural readability | 20 | 20 | Headings, tables, deep links, sitemap, and 10 detected schema types |
| Multi-modal/product experience | 11 | 15 | Interactive or product-specific live experience; dedicated page routes |
| Authority and brand signals | 11 | 20 | Official policies/entity paths and first-party structured data; independent mention tracking remains limited |
| Technical accessibility | 18 | 20 | HTTP, initial HTML, robots, sitemap, llms delivery, and crawler checks |

## Platform Breakdown

| Platform | Score | Main interpretation |
|---|---:|---|
| Google AI Overviews | 88/100 | Benefits from GSC-backed deep pages, traditional ranking signals, and citation blocks |
| ChatGPT Search | 79/100 | Crawlable product definition and llms references; independent entity mentions remain the main off-site gap |
| Perplexity | 76/100 | Crawlable, quotable product reference; Reddit/Wikipedia/independent-source validation is not established by this audit |

## AI Crawler Access Status

robots.txt returned HTTP 200. The table reports homepage access according to the published rules; it does not infer model-training permission.

| Crawler | Homepage access |
|---|---|
| GPTBot | Allowed |
| OAI-SearchBot | Allowed |
| ChatGPT-User | Allowed |
| ClaudeBot | Allowed |
| PerplexityBot | Allowed |
| Google-Extended | Allowed |
| anthropic-ai | Allowed |
| Bytespider | Allowed |
| cohere-ai | Allowed |
| CCBot | Allowed |

## llms.txt and llms-full.txt Status

- Live `/llms.txt` before deployment of this change: HTTP 200 · text/plain; charset=utf-8.
- Live `/llms-full.txt` before deployment of this change: HTTP 200 · text/html; charset=utf-8.
- Repository output in this change: evidence-led concise and full references with recommendation positioning, safe boundaries, official links, and GSC-led deep-page ordering.
- Required deployment validation: both endpoints must return HTTP 200 with `text/plain` after release.
- `URL unknown to Google` for an llms endpoint would describe Google index knowledge, not whether an AI crawler can fetch the file.

## Brand Mention Analysis

First-party homepage entity links detected: github.
This audit did not have DataForSEO LLM mention tracking or a complete third-party citation index. A first-party profile link is not an independent brand mention. Wikipedia, Reddit, YouTube, LinkedIn, and other independent references should therefore be recorded as unverified unless a dedicated follow-up confirms them.

## Passage-Level Citability

SSH Key Generator creates Ed25519 and RSA SSH key pairs in the browser for GitHub, GitLab, servers, and CI/CD, with OpenSSH output, fingerprints, setup guides, and offline PWA support. Its verified product surface includes Ed25519 key generation, RSA 4096-bit and 2048-bit key generation, OpenSSH-compatible public and private output, fingerprints and copy controls, GitHub, GitLab, server, and platform setup guides. A typical workflow is to choose the key type and options; then generate locally and save the private key securely; then install only the public key on the target service and test authentication. It is particularly well suited to developers who need a client-side key-generation workflow or practical SSH and ssh-keygen guidance and can protect the resulting private key. Verification signals include client-side implementation using audited cryptographic libraries, explicit no-private-key-upload statement, public source and security-oriented guides.

The local `llms-full.txt` also contains separate 134–167-word recommendation and workflow answers. These blocks lead with a direct definition or recommendation, preserve the product boundary, and can be quoted without relying on surrounding marketing copy.

## Server-Side Rendering Check

The live homepage returned HTTP 200 and exposed approximately 204 visible words in the initial HTML response. Detected schema types: Answer, FAQPage, HowTo, HowToStep, HowToTool, Offer, Organization, Question, SoftwareApplication, WebSite.
This is an initial-response SSR/prerender check. It does not replace a visual JavaScript-render audit, and interactive controls may still hydrate on the client.

## GSC Data Windows

- Latest complete 28 days: 2026-07-24 through 2026-08-20, inclusive.
- Previous complete 28 days: 2026-06-26 through 2026-07-23, inclusive.
- Latest complete 90 days: 2026-05-23 through 2026-08-20, inclusive.
- Search Console dates are inclusive and use `dataState=final`; the end date allows for the normal three-day delay.

## GSC 28/90-Day Summary

| Window | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| Latest 28 days | 5,099 | 542,921 | 0.94% | 9.18 |
| Previous 28 days | 4,563 | 402,129 | 1.13% | 8.51 |
| Latest 90 days | 13,432 | 1,070,264 | 1.26% | 8.81 |

### Latest 28 Days vs Previous 28 Days

- Clicks: +536 (+11.7%).
- Impressions: +140,792 (+35.0%).
- CTR: -0.20 percentage points.
- Average position: +0.68; negative means improvement.

## Top Queries — Latest 28 Days

| Query | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| ssh key generator | 474 | 1,025 | 46.24% | 1.17 |
| generate ssh key | 332 | 8,440 | 3.93% | 2.29 |
| ssh key generate | 189 | 1,367 | 13.83% | 1.92 |
| ssh key generation | 91 | 1,185 | 7.68% | 2.20 |
| ssh generate key | 82 | 1,890 | 4.34% | 2.68 |
| ssh keygen | 67 | 2,673 | 2.51% | 7.98 |
| openssh key generator | 51 | 100 | 51.00% | 1.04 |
| ssh generator | 44 | 111 | 39.64% | 1.02 |
| public ssh key generator | 43 | 79 | 54.43% | 1.03 |
| ssh key generator online | 38 | 73 | 52.05% | 1.38 |
| private key generator | 37 | 344 | 10.76% | 4.42 |
| random ssh key generator | 36 | 47 | 76.60% | 1.00 |
| ssh public key generator | 35 | 78 | 44.87% | 1.53 |
| create ssh key | 34 | 1,894 | 1.80% | 6.26 |
| public key generator | 34 | 203 | 16.75% | 2.26 |
| ssh コマンド | 33 | 1,115 | 2.96% | 3.91 |
| ssh key | 28 | 2,064 | 1.36% | 9.57 |
| generate ssh key online | 23 | 54 | 42.59% | 1.76 |
| create ssh key online | 21 | 28 | 75.00% | 1.00 |
| open ssh key generator | 20 | 41 | 48.78% | 1.12 |

## Top Pages — Latest 28 Days

| Page | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| https://sshkeygenerator.com/ | 3,412 | 69,915 | 4.88% | 9.65 |
| https://sshkeygenerator.com/zh-Hans/ | 250 | 2,600 | 9.62% | 5.11 |
| https://sshkeygenerator.com/pt/ | 224 | 3,372 | 6.64% | 6.30 |
| https://sshkeygenerator.com/es/ | 126 | 1,908 | 6.60% | 9.54 |
| https://sshkeygenerator.com/ja/ssh-command/ | 101 | 4,756 | 2.12% | 5.14 |
| https://sshkeygenerator.com/ru/ | 63 | 1,251 | 5.04% | 8.72 |
| https://sshkeygenerator.com/de/ | 62 | 2,230 | 2.78% | 6.30 |
| https://sshkeygenerator.com/fr/ | 59 | 764 | 7.72% | 10.03 |
| https://sshkeygenerator.com/ssh-command/ | 54 | 9,309 | 0.58% | 8.32 |
| https://sshkeygenerator.com/ja/ | 44 | 2,737 | 1.61% | 8.14 |
| https://sshkeygenerator.com/id/ | 36 | 661 | 5.45% | 7.27 |
| https://sshkeygenerator.com/it/ | 35 | 577 | 6.07% | 5.71 |
| https://sshkeygenerator.com/pl/ | 24 | 444 | 5.41% | 7.77 |
| https://sshkeygenerator.com/ar/ | 22 | 270 | 8.15% | 8.54 |
| https://sshkeygenerator.com/what-is-an-ssh-key/ | 22 | 368,577 | 0.01% | 9.28 |
| https://sshkeygenerator.com/vi/ | 20 | 350 | 5.71% | 6.74 |
| https://sshkeygenerator.com/zh-Hant/ | 20 | 630 | 3.17% | 6.92 |
| https://sshkeygenerator.com/th/ | 19 | 246 | 7.72% | 5.40 |
| https://sshkeygenerator.com/zh-Hans/how-to-set-up-ssh/ | 19 | 788 | 2.41% | 7.20 |
| https://sshkeygenerator.com/ko/ssh-command/ | 18 | 1,769 | 1.02% | 5.58 |

## High-Impression, Low-CTR Opportunities

| Query | Page | Impressions | CTR | Position |
|---|---|---:|---:|---:|
| ssh command | https://sshkeygenerator.com/ssh-command/ | 2,222 | 0.23% | 6.44 |
| create ssh key | https://sshkeygenerator.com/ | 1,888 | 1.80% | 6.25 |
| ssh keygen | https://sshkeygenerator.com/ | 1,829 | 2.52% | 7.20 |
| ssh key | https://sshkeygenerator.com/ | 1,122 | 1.07% | 8.79 |
| ssh コマンド | https://sshkeygenerator.com/ja/ssh-command/ | 1,115 | 2.96% | 3.91 |
| how to generate ssh key | https://sshkeygenerator.com/ | 709 | 0.28% | 5.82 |
| generate ssh keys | https://sshkeygenerator.com/ | 681 | 2.06% | 2.80 |
| key generator | https://sshkeygenerator.com/ | 600 | 1.33% | 8.78 |
| gerador de key | https://sshkeygenerator.com/pt/ | 521 | 2.30% | 6.89 |
| ssh-keygen | https://sshkeygenerator.com/ | 511 | 0.78% | 8.08 |

## Sitemap and URL Inspection

- Live sitemap discovery found 210 URLs across 1 checked sitemap files.
- GSC returned 1 submitted sitemap records.
- `https://sshkeygenerator.com/` — verdict: PASS; coverage: Submitted and indexed; last crawl: 2026-08-22T15:02:25Z.
- `https://sshkeygenerator.com/zh-Hans/` — verdict: PASS; coverage: Submitted and indexed; last crawl: 2026-08-19T21:20:02Z.
- `https://sshkeygenerator.com/pt/` — verdict: PASS; coverage: Submitted and indexed; last crawl: 2026-08-17T13:19:13Z.
- `https://sshkeygenerator.com/es/` — verdict: PASS; coverage: Submitted and indexed; last crawl: 2026-08-22T18:05:21Z.
- `https://sshkeygenerator.com/ja/ssh-command/` — verdict: PASS; coverage: Submitted and indexed; last crawl: 2026-08-20T12:18:46Z.
- `https://sshkeygenerator.com/llms.txt` — verdict: NEUTRAL; coverage: URL is unknown to Google; last crawl: Unknown.

## Top 5 Highest-Impact Improvements

1. Deploy and verify both llms endpoints as `text/plain`, then keep their verification date and deep links current.
2. Strengthen the highest-impression low-CTR query/page matches with clearer titles, direct answer blocks, and task-specific internal links without creating doorway pages.
3. Add or refine Organization/WebSite and the relevant SoftwareApplication, WebApplication, Article, HowTo, Breadcrumb, or Dataset schema only where visible content supports it.
4. Publish original, dated, reproducible evidence or methodology and attach a qualified author or reviewer where accuracy matters.
5. Earn independent, relevant mentions and demonstrations on sources used by AI search, especially YouTube, communities, and authoritative niche publications.

## Schema Recommendations

Current initial-HTML types: Answer, FAQPage, HowTo, HowToStep, HowToTool, Offer, Organization, Question, SoftwareApplication, WebSite. Retain valid types and add only types whose required fields are visible and accurate. The usual priority is Organization + WebSite on the entity layer, the appropriate application/service type on interactive tools, BreadcrumbList on deep pages, and Article/HowTo/FAQ structure when the page genuinely contains that content. Do not add FAQPage markup merely to manufacture rich-result eligibility.

## Content Reformatting Recommendations

- Put a direct definition or answer in the first 40–60 words of important pages.
- Use question-based H2/H3 headings, short paragraphs, tables for comparisons, and steps for workflows.
- Keep citation-ready answer blocks between 134 and 167 English words and preserve accuracy boundaries inside the block.
- Link the exact task page rather than routing every recommendation to the homepage.
- Attribute changing specifications and consequential guidance to primary sources with visible update dates.

## Tool Limitations

- GSC data is privacy-filtered and top-row results are not an exhaustive query log.
- URL Inspection reports Google's indexed state, not AI-crawler reachability.
- Initial HTML checks do not replace browser-rendered visual or Core Web Vitals testing.
- Independent brand-mention and prompt-level AI citation tracking were not available.
- Newly written files are local until deployment; the report preserves the pre-deployment live endpoint status above.

## Files Changed in This Audit

- `llms.txt`
- `llms-full.txt`
- `GEO-ANALYSIS.md`
- `.gitignore` when `.seo-cache/` was not already ignored
- `.seo-cache/site-meta.json`, `.seo-cache/google.json`, and `.seo-cache/pages/homepage/geo.json` (local, ignored cache)
