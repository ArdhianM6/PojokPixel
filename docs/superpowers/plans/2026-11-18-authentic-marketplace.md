# Authentic Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PojokPixel's storefront more trustworthy and distinctive by removing unsupported proof and presenting real listing information clearly.

**Architecture:** Keep the current React/Vite structure and existing product data model. Update home/catalog/product-detail renderers and creator listing defaults in place, then make focused CSS adjustments for responsive presentation and reduced motion.

**Tech Stack:** React 19, TypeScript, Vite, CSS.

**Spec:** `docs/superpowers/specs/authentic-marketplace.md`

## Global Constraints

- Preserve PojokPixel's cube mark and charcoal/orange/light-neutral identity.
- Never invent sales, review, verification, licensing, or update claims.
- Keep the catalog and buyer/creator flows working.
- Use user-triggered motion only and respect reduced-motion preferences.
- Do not add dependencies.

## Review Focus

- Listings without reviews must show an unrated state, not a default five-star rating.
- Zero checkout records must not be described as purchases or sales.
- Example product links must not appear as working purchase access.
- Creator listings with omitted descriptions must not claim verification or lifetime updates.
- Phone product cards must retain readable title, price, and action without overflow.

---

### Task 1: Remove unsupported proof from storefront

**Files:** `src/pages/HomePage.tsx`, `src/pages/CatalogPage.tsx`, `src/data/marketplace.ts`

- [x] Remove static sample testimonials and the home testimonial section unless sourced from actual persisted reviews.
- [x] Remove unsupported rating, sales, bestseller, and popularity claims from storefront cards.
- [x] Keep sorting functional, but label sales/rating sort only where the backing values exist or remove unavailable options.
- [x] Remove example access URLs from product records.

### Task 2: Make creator listing defaults honest

**Files:** `src/data/marketplace.ts`, `src/pages/CreatorPage.tsx`

- [x] Default new product rating and review count to zero.
- [x] Replace verification and guaranteed update/license copy with neutral product-detail language.
- [x] Ensure product cards and detail views render an unrated state for zero reviews.

### Task 3: Simplify featured home presentation

**Files:** `src/pages/HomePage.tsx`, `src/styles.css`

- [x] Disable automatic featured-product rotation and pointer tilt; retain explicit previous/next controls if the carousel remains.
- [x] Replace generic unsupported marketing claims with direct copy about the marketplace's actual categories.
- [x] Remove redundant all-caps labels and reduce nonfunctional decorative badges.
- [x] Preserve mobile layout and honor reduced-motion preferences.

### Task 4: Review and publish

**Files:** the scoped files above.

- [x] Review the diff for truthfulness and unintended visual regressions.
- [x] Run the production build and inspect desktop/mobile pages.
- [ ] Commit and push changes to the existing GitHub branch; verify the Vercel deployment is Ready.
