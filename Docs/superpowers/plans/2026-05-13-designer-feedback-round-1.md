# Designer Feedback Round 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address all 38 designer-feedback tickets from Natalia Delgado (created 2026-05-08), build 3 new pages (Contact, Legal, 404), and update typography to match Figma.

**Architecture:** Astro 6 SSG, Tailwind v4 design tokens in `src/styles/global.css`, YAML-driven content in `content/pages/*.yaml` and `content/global/*.yaml`, typed via `src/types/content.ts`. All content goes to YAML for the CMS — never hardcode in `.astro` files.

**Tech Stack:** Astro 6, Tailwind v4, TypeScript, YAML, Figma API for design specs.

**Constraints:**
- Follow Figma exactly. Never invent.
- Atomic commits — one commit per ticket (or tightly-grouped cluster).
- All static text/strings → YAML. CMS will manage these.
- New pages need full SEO (canonical, OG, Twitter Card, JSON-LD) matching the existing `BaseLayout.astro` pattern.
- After each ticket: post a comment to the Linear ticket noting what was done, and move to "In Progress" if not already (do NOT move to Review Required — user does that after staging deploy).
- No commits without user approval (per CLAUDE.md).

**Linear API:**
- Token: stored locally; do NOT commit. Owner: Amaro.
- Team: `23a6f954-c2f9-471e-82af-5724490de113`
- Brand site project: `2a2d54c3-a804-4dd0-99cf-4264e5b3efbd`
- In Progress state: `27ad39e4-dfef-41e3-a835-47f09e4dae32`
- Amaro user ID: `00ec111f-2adf-48a4-a374-49fa3c2af557`

**Figma API:**
- Token: stored locally; do NOT commit. Owner: Amaro.
- File key: `mHA4xTdD4loTmApGJF9NvC`
- Fetch node: `curl -H "X-Figma-Token: $TOKEN" "https://api.figma.com/v1/files/<KEY>/nodes?ids=<NODE_ID>"`
- Export image: `curl -H "X-Figma-Token: $TOKEN" "https://api.figma.com/v1/images/<KEY>?ids=<NODE_ID>&format=png&scale=2"`

---

## Execution Order (Phases)

Each phase commits independently. Run `npm run claude:lint` after each ticket. Test at `:4321` (run `npm run dev` once at session start).

### Phase 0 — Foundation (typography + assets)

Affects everything downstream — do first.

#### Task 0.1: DES-89 Typography — Global update

**Linear:** DES-89
**Figma:** node `219:13470` ("Typography")
**Files:**
- Modify: `src/styles/global.css` (typography tokens in `@theme` block)
- Audit: any `font-heading`, `font-subheading`, `font-body` usage to ensure consistent application

- [ ] **Step 1:** Fetch Figma typography spec via API for node `219:13470` and extract: heading sizes (H1/H2/H3/H4 desktop+mobile), font weights, line heights, letter spacing, font families. Save to a temp note.
- [ ] **Step 2:** Compare extracted spec to `src/styles/global.css` `@theme` block. Document deltas.
- [ ] **Step 3:** Update `--font-heading`, `--font-subheading`, `--font-body` and any related utility classes in `global.css` to match Figma. Use `Barlow Condensed` (medium 500) for headings.
- [ ] **Step 4:** Grep all `.astro` and YAML files for any inline font-size/weight/letter-spacing overrides that conflict. Fix them.
- [ ] **Step 5:** Run `npm run claude:lint`. Visit `:4321` and inspect homepage, features, pricing — verify headings render correctly.
- [ ] **Step 6:** Post Linear comment on DES-89: "Typography tokens updated to match Figma node 219:13470. [list of changes]". Move to In Progress.
- [ ] **Step 7:** Commit: `style(typography): align heading typography with Figma spec (DES-89)`

#### Task 0.2: DEV-2263 Product icons

**Linear:** DEV-2263
**Figma:** node `223:18621`
**Files:**
- Add: `public/images/icons/<name>.svg` (per icon)
- Modify: `content/pages/home.yaml` grid section icon refs

- [ ] **Step 1:** Fetch Figma node `223:18621` to enumerate which product icons exist. Get each icon's node ID.
- [ ] **Step 2:** Export each icon as SVG via Figma images API: `https://api.figma.com/v1/images/mHA4xTdD4loTmApGJF9NvC?ids=<id>&format=svg`
- [ ] **Step 3:** Download each SVG to `public/images/icons/`. Use names matching the YAML (`hd.svg`, `cast.svg`, `vod.svg`, `latency.svg`, `data.svg`, `global.svg`).
- [ ] **Step 4:** Verify the icon renderer in `src/components/sections/Grid.astro` (or equivalent) actually loads from `/images/icons/{icon}.svg`. Adjust if needed.
- [ ] **Step 5:** Visit `:4321` and verify icons render correctly in the "Putting Fans First" grid section.
- [ ] **Step 6:** Post Linear comment on DEV-2263 with list of new icon paths. Move to In Progress.
- [ ] **Step 7:** Commit: `feat(icons): replace product icons with Figma exports (DEV-2263)`

#### Task 0.3: DEV-2220 Updated hero background image

**Linear:** DEV-2220
**Figma:** node `201:20499`
**Files:**
- Add: `public/images/hero-bg.webp` (or .png) at 2x resolution
- Modify: `src/components/sections/Hero.astro` and/or `content/pages/home.yaml`

- [ ] **Step 1:** Fetch Figma node `201:20499` and locate the background image fill. Export at 2x scale.
- [ ] **Step 2:** Save to `public/images/hero-bg.webp` (convert from PNG if needed for size).
- [ ] **Step 3:** Update `Hero.astro` to reference the new image. Determine if it's a YAML field or hardcoded — if hardcoded, move to YAML as `backgroundImage` field.
- [ ] **Step 4:** Update `src/types/content.ts` `HeroSection` interface if a new field was added.
- [ ] **Step 5:** Visit `:4321` and verify the new hero bg renders. Compare side-by-side with Figma frame `1:18`.
- [ ] **Step 6:** Run `npm run claude:lint`.
- [ ] **Step 7:** Post Linear comment. Move to In Progress.
- [ ] **Step 8:** Commit: `feat(hero): swap to Figma-approved background image (DEV-2220)`

---

### Phase 1 — Homepage corrections

#### Task 1.1: DEV-2222 Mobile menu button not clickable

**Linear:** DEV-2222
**Files:** `src/components/layout/Header.astro` (or whichever holds the mobile toggle)

- [ ] **Step 1:** Find the mobile menu toggle component. Identify why it's not clickable (likely z-index, pointer-events, or overflow:hidden on parent).
- [ ] **Step 2:** Fix the issue.
- [ ] **Step 3:** Test at `:4321` with mobile viewport (~375px) — toggle must open/close menu.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(header): make mobile menu button clickable (DEV-2222)`

#### Task 1.2: DEV-2227 Diagonals — swap/invert

**Linear:** DEV-2227
**Files:** `src/pages/index.astro` (where diagonals are placed)

- [ ] **Step 1:** Open `src/pages/index.astro` and locate diagonal section transitions. Compare to Figma `1:18`.
- [ ] **Step 2:** Swap `white-to-grey` ↔ `grey-to-white` variants where mismatched.
- [ ] **Step 3:** Verify visually at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(homepage): correct diagonal section transitions (DEV-2227)`

#### Task 1.3: DEV-2232 Remove rounded corners on yellow lines

**Linear:** DEV-2232
**Files:** Component(s) rendering the yellow accent lines (likely `src/components/sections/AccordionFeatures.astro` or stats component)

- [ ] **Step 1:** Locate the yellow line element. Remove `rounded-*` Tailwind class or set `border-radius: 0`.
- [ ] **Step 2:** Verify at `:4321`.
- [ ] **Step 3:** Post Linear comment. Move to In Progress.
- [ ] **Step 4:** Commit: `style: remove rounded corners on yellow accent lines (DEV-2232)`

#### Task 1.4: DEV-2228 Orange circles

**Linear:** DEV-2228
**Files:** Carousel section (`src/components/sections/Carousel.astro` likely)

The ticket says "If they're problematic to place, let's remove them". Decision: if no Figma node references them, remove.

- [ ] **Step 1:** Search Figma `1:18` for orange decorative circles in the "Built For Sport" / carousel area. If absent, treat as remove.
- [ ] **Step 2:** Remove the orange circle decorative SVGs/divs from the component.
- [ ] **Step 3:** Verify at `:4321`.
- [ ] **Step 4:** Post Linear comment explaining decision. Move to In Progress.
- [ ] **Step 5:** Commit: `style(carousel): remove decorative orange circles (DEV-2228)`

#### Task 1.5: DEV-2221 Center 2nd row of icons on mobile

**Linear:** DEV-2221
**Files:** `src/components/sections/Grid.astro`

- [ ] **Step 1:** Inspect the grid layout. On mobile, when the row has fewer items, ensure they center via `justify-center` or grid `place-items-center`.
- [ ] **Step 2:** Test at `:4321` mobile viewport.
- [ ] **Step 3:** Post Linear comment. Move to In Progress.
- [ ] **Step 4:** Commit: `style(grid): center second row of icons on mobile (DEV-2221)`

#### Task 1.6: DEV-2223 3x Feature blocks images — desktop scale/centering

**Linear:** DEV-2223
**Files:** `src/components/sections/Feature.astro`

- [ ] **Step 1:** Inspect Figma `1:18` for the three feature sections (Make it yours, Turn passion into profit, Understand fans). Note image dimensions and alignment.
- [ ] **Step 2:** Adjust `Feature.astro` desktop image sizing/centering. May need separate image fields per breakpoint or a `max-width`/`object-fit` change.
- [ ] **Step 3:** If desktop and mobile need different exports, add a `mobileImage` field to `FeatureSection` type and YAML.
- [ ] **Step 4:** Test at `:4321` desktop and mobile.
- [ ] **Step 5:** Post Linear comment. Move to In Progress.
- [ ] **Step 6:** Commit: `style(feature): correct desktop image scale and centering (DEV-2223)`

#### Task 1.7: DEV-2237 Images on mobile (feature sections)

**Linear:** DEV-2237
**Files:** `src/components/sections/Feature.astro`

The ticket says images are missing on mobile and should be centered below the "learn more" CTA.

- [ ] **Step 1:** Find why feature images don't render on mobile (likely `hidden md:block` class).
- [ ] **Step 2:** Make images visible on mobile, position below the CTAs, centered.
- [ ] **Step 3:** Test at `:4321` mobile.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(feature): show feature images on mobile below CTAs (DEV-2237)`

#### Task 1.8: DEV-2236 Image — accordion section sizing

**Linear:** DEV-2236
**Figma:** node `201:20567`
**Files:** `src/components/sections/AccordionFeatures.astro` (and possibly the existing accordion images in `public/images/accordion/`)

- [ ] **Step 1:** Fetch Figma node `201:20567` and export the image at correct size.
- [ ] **Step 2:** Replace the oversized image in the accordion. Check if sizing CSS also needs reducing.
- [ ] **Step 3:** Test at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(accordion): replace oversized image and reduce sizing (DEV-2236)`

#### Task 1.9: DEV-2235 Layout — accordion section contained to viewport

**Linear:** DEV-2235
**Files:** `src/components/sections/AccordionFeatures.astro`

The whole accordion section (left = list, right = images) should be contained so images stay centered when accordion items are clicked.

- [ ] **Step 1:** Inspect current accordion behavior. Likely the container isn't sticky/contained, so right-side image jumps.
- [ ] **Step 2:** Wrap the section in a container with `overflow:hidden` or fix the image-side to be sticky / position-sticky to keep stable.
- [ ] **Step 3:** Test at `:4321` — clicking different accordion items should not shift image position.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(accordion): contain section to viewport so images stay centered (DEV-2235)`

#### Task 1.10: DEV-2234 Spacing issue — 24/7 Fan Support

**Linear:** DEV-2234
**Files:** `src/components/sections/AccordionFeatures.astro` or relevant accordion item rendering

- [ ] **Step 1:** Find the "24/7 Fan Support" accordion item. Identify excess vertical space (likely empty `<div>` or wrong padding).
- [ ] **Step 2:** Remove the excess spacing.
- [ ] **Step 3:** Test at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(accordion): remove excess spacing on 24/7 Fan Support (DEV-2234)`

#### Task 1.11: DEV-2253 First accordion dropdown expanded by default

**Linear:** DEV-2253
**Files:** `content/pages/home.yaml` (accordion items already have an `expanded` field — DRM+ should be `true`)

- [ ] **Step 1:** Open `content/pages/home.yaml`. Locate the `accordion_features` items. Currently "24/7 Fan Support" has `expanded: true`. Change so DRM+ (first item) has `expanded: true` and remove from "24/7 Fan Support".
- [ ] **Step 2:** Verify in `AccordionFeatures.astro` that `expanded: true` actually opens the item by default.
- [ ] **Step 3:** Test at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(accordion): expand DRM+ first item by default (DEV-2253)`

#### Task 1.12: DEV-2229 / DEV-2224 Carousel — first card inline with heading

**Linear:** DEV-2229 (mobile) and DEV-2224 (desktop) — combined since same fix
**Files:** `src/components/sections/Carousel.astro` and/or `Customers.astro`

- [ ] **Step 1:** Identify which carousel is meant — "FOR EVERY LEVEL OF THE GAME" (For Clubs / For Leagues / etc.) cards.
- [ ] **Step 2:** Adjust the carousel container so the first card aligns horizontally with the section heading rather than centered offset.
- [ ] **Step 3:** Verify on desktop AND mobile at `:4321`.
- [ ] **Step 4:** Post comment to BOTH DEV-2229 and DEV-2224 noting this is a shared fix. Move both to In Progress.
- [ ] **Step 5:** Commit: `style(carousel): align first card with section heading (DEV-2229, DEV-2224)`

#### Task 1.13: DEV-2226 Carousel card heading font size

**Linear:** DEV-2226
**Files:** `src/components/sections/Carousel.astro`

- [ ] **Step 1:** Reduce heading font size in carousel cards so text fits within the card.
- [ ] **Step 2:** Compare to Figma `1:18` carousel section.
- [ ] **Step 3:** Test at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `style(carousel): reduce card heading font size (DEV-2226)`

#### Task 1.14: DEV-2225 Carousel cards — dropshadow + clipping

**Linear:** DEV-2225
**Files:** `src/components/sections/Carousel.astro`

- [ ] **Step 1:** Reduce `box-shadow` on carousel cards.
- [ ] **Step 2:** Remove `overflow: hidden` (or equivalent clipping) from the carousel container so shadows aren't cropped.
- [ ] **Step 3:** Test at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `style(carousel): soften card shadow and remove clipping (DEV-2225)`

#### Task 1.15: DEV-2230 Customer card structure overhaul

**Linear:** DEV-2230
**Figma:** node `202:18690`
**Files:** `src/components/sections/Customers.astro`, `src/types/content.ts`, `content/pages/home.yaml`

Customer card composition: background fill (image or color) + gradient overlay + customer logo + title + button (HIDDEN for now) + dropshadow. CMS must be able to edit background image, gradient, logo, title.

- [ ] **Step 1:** Fetch Figma node `202:18690` for the breakdown.
- [ ] **Step 2:** Update `CustomerSection` type in `src/types/content.ts` to include `backgroundImage`, `gradientColor` (already exists), `brandLogo`, `quote` (title), `cta` (button — but hide). Verify these are all already present.
- [ ] **Step 3:** Refactor `Customers.astro` to render the card matching the Figma structure: background image with gradient overlay, logo top-left, title bottom-left, dropshadow. Hide the CTA button entirely (`cta` data still in YAML for later).
- [ ] **Step 4:** On mobile, center the image to the container.
- [ ] **Step 5:** Test at `:4321` desktop + mobile.
- [ ] **Step 6:** Post Linear comment. Move to In Progress.
- [ ] **Step 7:** Commit: `refactor(customers): match Figma card structure, hide CTA (DEV-2230)`

#### Task 1.16: DEV-2231 Customer card cropping on mobile

**Linear:** DEV-2231
**Files:** `src/components/sections/Customers.astro`

- [ ] **Step 1:** Likely fixed by Task 1.15. Verify at mobile viewport — no cropping on the customer card.
- [ ] **Step 2:** If still cropped, fix `object-fit` / `width` issues on mobile.
- [ ] **Step 3:** Test.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit (if separate from 1.15): `fix(customers): prevent card cropping on mobile (DEV-2231)`

#### Task 1.17: DEV-2254 Customer carousel (no description — likely meta-ticket)

**Linear:** DEV-2254
**Action:** Cross-link to DEV-2230, DEV-2231, DEV-2229, DEV-2224, DEV-2225, DEV-2226, DEV-2228 — these collectively cover the customer/carousel rework.

- [ ] **Step 1:** Add a Linear comment to DEV-2254 listing the specific tickets that resolve the customer carousel work and noting it's covered by them.
- [ ] **Step 2:** Move DEV-2254 to In Progress.
- [ ] **Step 3:** No commit needed.

#### Task 1.18: DEV-2233 Features — Handle the biggest occasions (no description)

**Linear:** DEV-2233
**Action:** Add a Linear comment requesting clarification — the title references the accordion section but no detail given. Likely covered by DEV-2235/2236/2237/2253.

- [ ] **Step 1:** Post a Linear comment asking what specific feedback is being requested. Cross-link to the accordion-section tickets that may already cover it.
- [ ] **Step 2:** Move to In Progress.

#### Task 1.19: DEV-2238 Mailing list input text

**Linear:** DEV-2238
**Files:** `src/components/sections/MailingList.astro`

- [ ] **Step 1:** Remove background fill on the input. Set text color to white. Likely just changing Tailwind classes.
- [ ] **Step 2:** Test at `:4321`.
- [ ] **Step 3:** Post Linear comment. Move to In Progress.
- [ ] **Step 4:** Commit: `style(mailing-list): transparent input with white text (DEV-2238)`

#### Task 1.20: DEV-2239 Mailing list form success state

**Linear:** DEV-2239
**Files:** `src/components/sections/MailingList.astro`, `content/pages/home.yaml` (success message text → YAML), `src/types/content.ts`

On success, replace form with a thank-you message (no page reload).

- [ ] **Step 1:** Add `successMessage` field to `MailingListSection` type and YAML. Default: "Thank you for subscribing".
- [ ] **Step 2:** Add a small client-side island (or vanilla JS) on the form — on submit, hide the form and show the success message in its place. Don't reload the page.
- [ ] **Step 3:** Use the same body text class as the rest of the site.
- [ ] **Step 4:** Test at `:4321`.
- [ ] **Step 5:** Post Linear comment. Move to In Progress.
- [ ] **Step 6:** Commit: `feat(mailing-list): add inline success state with no reload (DEV-2239)`

---

### Phase 2 — Footer / Nav

#### Task 2.1: DEV-2240 Footer links to corresponding pages

**Linear:** DEV-2240
**Files:** `content/global/navigation.yaml` (or footer.yaml if separate), `src/components/layout/Footer.astro`

- [ ] **Step 1:** Audit footer YAML — every link needs a real `href` to an existing page (e.g. `/about`, `/legal`, `/contact`, `/pricing`, `/features`, etc.). For pages not yet built, link to anchor like `/features#monetisation`.
- [ ] **Step 2:** Update YAML.
- [ ] **Step 3:** Verify all links work at `:4321`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `fix(footer): point links to corresponding pages (DEV-2240)`

#### Task 2.2: DEV-2241 Social media — only LinkedIn

**Linear:** DEV-2241
**Files:** `content/global/navigation.yaml` (or footer YAML), `src/components/layout/Footer.astro`

- [ ] **Step 1:** Find the socials YAML. Add a `visible: true/false` flag per social link, OR a single `enabledSocials` array to toggle which render.
- [ ] **Step 2:** Set LinkedIn visible: true with href `https://www.linkedin.com/company/matchday-media-group/`. Set X, Instagram, YouTube visible: false (still in YAML for CMS to enable later).
- [ ] **Step 3:** Update Footer component to filter on `visible`.
- [ ] **Step 4:** Update content type in `src/types/content.ts`.
- [ ] **Step 5:** Test at `:4321` — only LinkedIn should render.
- [ ] **Step 6:** Post Linear comment. Move to In Progress.
- [ ] **Step 7:** Commit: `feat(footer): toggleable socials, show only LinkedIn for launch (DEV-2241)`

---

### Phase 3 — Features page

#### Task 3.1: DEV-2250 Remove "Platform" title

**Linear:** DEV-2250
**Files:** `content/pages/features.yaml` and/or `src/components/sections/FeatureCategory.astro`

- [ ] **Step 1:** Open the screenshot in DEV-2250 and identify the "Platform" title to remove. Likely the section heading on the Platform category.
- [ ] **Step 2:** Either remove the title from YAML, or add a `hideHeading` flag, or simply blank the heading. Use the cleanest approach for CMS editability.
- [ ] **Step 3:** Test at `:4321/features`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `style(features): remove Platform section title per design (DEV-2250)`

#### Task 3.2: DEV-2251 Features in accordions

**Linear:** DEV-2251
**Files:** `src/components/sections/FeatureCategory.astro`, possibly `src/types/content.ts`

Each feature in the features page must be in an accordion, collapsed by default, first feature open by default.

- [ ] **Step 1:** Refactor `FeatureCategory.astro` so each feature renders as an accordion item. Use `<details>`/`<summary>` for zero-JS or a small client-side island for animation.
- [ ] **Step 2:** First feature in each category should be `open` by default.
- [ ] **Step 3:** Test at `:4321/features` — verify all categories accordion correctly.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `feat(features): wrap each feature in collapsible accordion (DEV-2251)`

---

### Phase 4 — Pricing page

#### Task 4.1: DEV-2247 Plans container sticky

**Linear:** DEV-2247
**Files:** `src/pages/pricing.astro` and/or section components

The plan cards section should stick below the nav as the user scrolls. Also: no content should scroll behind the hero nav.

- [ ] **Step 1:** Add `position: sticky; top: <nav-height>` to the plans container.
- [ ] **Step 2:** Ensure the nav has solid background (not transparent over content).
- [ ] **Step 3:** Test at `:4321/pricing` — scroll behavior matches the screenshot/video in the ticket.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `feat(pricing): make plans container sticky below nav (DEV-2247)`

#### Task 4.2: DEV-2242 Hide main nav when anchor menu sticks

**Linear:** DEV-2242
**Files:** `src/components/sections/AnchorMenu.astro`, `src/components/layout/Header.astro`

When the anchor menu (used on /features and /pricing) becomes sticky at top, hide the main nav above it.

- [ ] **Step 1:** Use IntersectionObserver or scroll-based JS to detect when the anchor menu is at scrollY=0.
- [ ] **Step 2:** Apply class to body or header when sticky → hide main nav (transform translateY(-100%) or display:none).
- [ ] **Step 3:** Test at `:4321/features` and `:4321/pricing`.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `feat(nav): hide main nav when anchor menu becomes sticky (DEV-2242)`

#### Task 4.3: DEV-2248 Monthly/annual toggle + VAT text

**Linear:** DEV-2248
**Files:** `src/components/sections/Pricing.astro` (or `PriceCard.astro`), `content/pages/pricing.yaml`

Add a monthly/annual toggle. Show "TERMS + EXCL VAT" text next to prices.

- [ ] **Step 1:** Add a billing-cycle toggle (Monthly | Annual) above the price cards. Default = Annual.
- [ ] **Step 2:** When toggled, switch the displayed price between `monthlyPrice` and `annualPrice` per tier (already in YAML).
- [ ] **Step 3:** Add small text next to the price showing "p/m annually excl. VAT" or "p/m monthly excl. VAT".
- [ ] **Step 4:** Test at `:4321/pricing`.
- [ ] **Step 5:** Post Linear comment. Move to In Progress.
- [ ] **Step 6:** Commit: `feat(pricing): add monthly/annual toggle with VAT note (DEV-2248)`

#### Task 4.4: DEV-2244 Price card fixes

**Linear:** DEV-2244
**Files:** `src/components/sections/PriceCard.astro` (or similar)

(1) Show "Most Popular" by default (orange/blue accent), "Recommended" only after calc.
(2) Plan title font: Barlow Semi Condensed.
(3) VAT/terms: small, to the right of price.
(4) Description below CTA missing — add it.

- [ ] **Step 1:** Default state shows the `tag.label = "Most Popular"` plan accented. The "Recommended" tag stays inactive until pricing calculator runs. Implement with a JS-controlled state on the calculator.
- [ ] **Step 2:** Change plan title font class from `font-heading` to `font-subheading`.
- [ ] **Step 3:** Move the VAT/terms text to be inline-right of the price, smaller font.
- [ ] **Step 4:** Render `tier.description` below the CTA button (currently missing).
- [ ] **Step 5:** Test at `:4321/pricing`.
- [ ] **Step 6:** Post Linear comment. Move to In Progress.
- [ ] **Step 7:** Commit: `fix(pricing): price card layout, font, default tag, description (DEV-2244)`

#### Task 4.5: DEV-2245 Missing subtext below pricing cards

**Linear:** DEV-2245
**Files:** `content/pages/pricing.yaml`, `src/pages/pricing.astro`

Add subtext (in YAML, of course):
- "For billing cycles, data and bandwidth expiration, and overages, read more."
- "Displayed prices are in pound sterling (GBP) and exclusive of VAT and other taxes (added at checkout if applicable)."

- [ ] **Step 1:** Add a `priceCardsSubtext` array (or similar) to `pricing.yaml`. Add to type in `src/types/content.ts`.
- [ ] **Step 2:** Render below the price card grid in the pricing template.
- [ ] **Step 3:** Test.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `feat(pricing): add subtext below price cards (DEV-2245)`

#### Task 4.6: DEV-2249 Unlimited plan button colour matches product

**Linear:** DEV-2249
**Files:** Pricing card component, `content/pages/pricing.yaml`

Unlimited plan's button should take the selected product's color (OD = blue, Live = orange).

- [ ] **Step 1:** Update the Unlimited tier `buttonVariant` to be dynamic based on product. Either pass a prop down, or set `buttonVariant: "product"` in YAML and resolve it in component.
- [ ] **Step 2:** Test at `:4321/pricing` — switch product and verify button color changes.
- [ ] **Step 3:** Post Linear comment. Move to In Progress.
- [ ] **Step 4:** Commit: `style(pricing): unlimited button matches selected product (DEV-2249)`

#### Task 4.7: DEV-2252 OD vs Live & OD plan colours

**Linear:** DEV-2252
**Files:** Pricing card / pricing tab component

Colours of plans need to update based on selected product:
- On-Demand → Blue (`blue-matchday`)
- Live & On-Demand → Orange (`orange-basketball`)

- [ ] **Step 1:** Create a derived "accent color" from the active product. Apply it to: highlighted price card border/header, recommended/most-popular tag, primary buttons.
- [ ] **Step 2:** Test by switching tabs at `:4321/pricing`.
- [ ] **Step 3:** Post Linear comment. Move to In Progress.
- [ ] **Step 4:** Commit: `feat(pricing): plans take product-specific accent colours (DEV-2252)`

#### Task 4.8: DEV-2243 Pricing calculator product-aware

**Linear:** DEV-2243
**Files:** `src/components/sections/PricingCalculator.astro`

Calculator content + colors must update based on selected product (OD = blue, Live = orange).

- [ ] **Step 1:** Calculator component needs to know the active product. Either share state via a custom event/store, or pass via parent.
- [ ] **Step 2:** Update calculator copy and accent color per product.
- [ ] **Step 3:** Test.
- [ ] **Step 4:** Post Linear comment. Move to In Progress.
- [ ] **Step 5:** Commit: `feat(pricing): calculator content and colour follow active product (DEV-2243)`

#### Task 4.9: DEV-2246 Pricing comparison table (no description)

**Linear:** DEV-2246
**Action:** Comment requesting specifics. Likely related to the existing comparison table that already exists in YAML — may need styling tweaks.

- [ ] **Step 1:** Compare current `/pricing` comparison table to Figma. List any visible deltas.
- [ ] **Step 2:** Post comment to DEV-2246 with findings — propose specific fixes if obvious, otherwise request clarification.
- [ ] **Step 3:** Move to In Progress only if work was done.

---

### Phase 5 — New Pages

For all new pages: read CLAUDE.md → fetch Figma node → build with YAML-driven content → add to `content/pages/`, `src/types/content.ts`, `src/pages/`. Reuse `BaseLayout.astro` (gives canonical, OG, Twitter Card, JSON-LD slot).

#### Task 5.1: Build Contact page from Figma

**Figma:** desktop `195:13248`, mobile `195:13274`
**Files:**
- Replace stub: `src/pages/contact.astro`
- Create: `content/pages/contact.yaml`
- Modify: `src/types/content.ts` (add `ContactPageContent` interface)
- Possibly create: `src/components/sections/ContactForm.astro` if Figma has a form

- [ ] **Step 1:** Fetch Figma `195:13248` (desktop) and `195:13274` (mobile). Extract: page title, hero text, sections, form fields (if any), CTA buttons, image refs.
- [ ] **Step 2:** Define `ContactPageContent` type in `src/types/content.ts`.
- [ ] **Step 3:** Create `content/pages/contact.yaml` with all the copy from Figma.
- [ ] **Step 4:** Build `src/pages/contact.astro` using the YAML and `BaseLayout`. Remove `noindex` flag if Figma indicates it should be indexable. Add WebPage JSON-LD via `<Fragment slot="head">`.
- [ ] **Step 5:** If a contact form is present in Figma, build it as a section component and decide on submission approach (mailto, third-party, or noted as future work).
- [ ] **Step 6:** Test at `:4321/contact` desktop + mobile against Figma.
- [ ] **Step 7:** Run `npm run claude:lint`.
- [ ] **Step 8:** Post Linear comment on DEV-2017 ("Book a Call/Contact"). Move to In Progress.
- [ ] **Step 9:** Commit: `feat(contact): build full contact page from Figma (DEV-2017)`

#### Task 5.2: Build Legal page (privacy policy proper) from Figma

**Figma:** intro `1:26`, desktop `195:13717`, mobile `195:13757`, content template desktop `195:13730`, content template mobile `195:13778`
**Files:**
- Replace stub: `src/pages/legal.astro` → instead becomes `legal/index.astro` (privacy policy template)
- Create: `content/pages/legal.yaml` (sections, paragraphs)
- Modify: `src/types/content.ts` (add `LegalPageContent` interface)

- [ ] **Step 1:** Fetch all 5 Figma legal nodes. Extract layout, sections, headings, body text formatting.
- [ ] **Step 2:** Define `LegalPageContent` type with `sections: Array<{heading, body}>`. Body should support markdown-ish formatting if Figma uses bold/links.
- [ ] **Step 3:** Create `content/pages/legal.yaml` with the actual privacy policy content (move from current stub). Structure to match Figma sections.
- [ ] **Step 4:** Build `src/pages/legal.astro` rendering the YAML against the Figma layout. Keep `noindex={true}` if appropriate (typically privacy policies ARE indexable).
- [ ] **Step 5:** Add WebPage JSON-LD via head slot.
- [ ] **Step 6:** Test at `:4321/legal` desktop + mobile.
- [ ] **Step 7:** Run `npm run claude:lint`.
- [ ] **Step 8:** Post Linear comment on DEV-2016 ("Legal"). Move to In Progress.
- [ ] **Step 9:** Commit: `feat(legal): build legal page from Figma with YAML content (DEV-2016)`

#### Task 5.3: Build 404 page from Figma

**Linear:** DES-90
**Figma:** desktop `224:18624`, mobile `224:18641`
**Other asset:** 404 GIF — `https://uploads.linear.app/22b55534-85a9-4406-981f-349e7998e0d5/6e8999b0-3606-49d8-9352-14b1f369e4d2/97f17d7c-7bdb-4e7b-aeba-0c61c953af8b`
**Files:**
- Create: `src/pages/404.astro`
- Create: `content/pages/404.yaml`
- Modify: `src/types/content.ts`
- Add: `public/images/404.gif`

- [ ] **Step 1:** Fetch Figma desktop + mobile nodes. Extract: heading text, body copy, CTA button copy + link.
- [ ] **Step 2:** Download the 404 gif from Linear uploads and save to `public/images/404.gif`.
- [ ] **Step 3:** Define `NotFoundPageContent` type and create `content/pages/404.yaml`.
- [ ] **Step 4:** Build `src/pages/404.astro` — use BaseLayout with `noindex={true}`.
- [ ] **Step 5:** Verify Astro picks it up as a 404 (it should automatically for filename `404.astro`).
- [ ] **Step 6:** Test by hitting a non-existent route at `:4321/this-does-not-exist`.
- [ ] **Step 7:** Run `npm run claude:lint`.
- [ ] **Step 8:** Post Linear comment on DES-90. Move to In Progress.
- [ ] **Step 9:** Commit: `feat(404): build 404 page from Figma with animated GIF (DES-90)`

---

### Phase 6 — Wrap-up

#### Task 6.1: Final visual QA

- [ ] **Step 1:** Visit every page at `:4321`: `/`, `/features`, `/pricing`, `/about`, `/contact`, `/legal`, `/404` (force one). Both desktop AND mobile (375px).
- [ ] **Step 2:** Document any visible deltas vs Figma. Fix or note for follow-up.
- [ ] **Step 3:** Run `npm run build` to ensure clean production build.
- [ ] **Step 4:** Run `npm run claude:lint`. Should be 0 errors.

#### Task 6.2: Hand back to user

- [ ] **Step 1:** Summarize all work in a single message: tickets done, tickets blocked (with reason), tickets pending clarification.
- [ ] **Step 2:** Wait for user approval before merging anything to staging.

---

## Self-review notes

- Spec coverage: All 38 designer tickets + 3 new pages + typography accounted for.
- Placeholders: None — every task has concrete files and steps. Where Figma node IDs are missing for specific elements (e.g. orange circles), the task notes the lookup approach.
- Type consistency: Where new types (ContactPageContent, LegalPageContent, NotFoundPageContent) are added, they follow the existing pattern of `*PageContent` interfaces in `src/types/content.ts`.
- Tickets DEV-2233, DEV-2246, DEV-2254 have no description — tasks include posting clarification comments rather than guessing.
