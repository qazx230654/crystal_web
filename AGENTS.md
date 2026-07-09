# Crystal Web Project Guide

## Product Direction

Crystal Web is a boutique crystal brand storefront and admin system. The visual language should feel quiet, refined, warm, and premium rather than loud or overly decorative.

Core atmosphere:
- Boutique crystal brand
- Warm ivory and cream backgrounds
- Champagne gold accents
- Soft shadows and translucent white surfaces
- Generous whitespace
- Calm typography with clear contrast between title, label, and body text

## UI Style Rules

- Use ivory/cream as the page foundation: `crystal-cream`, `crystal-pearl`, and white translucency.
- Use gold as a restrained accent: `crystal-gold` and `crystal-champagne`.
- Use `crystal-ink` for primary text and primary actions.
- Use `crystal-muted` for supporting text.
- Avoid saturated palettes, heavy gradients, dark dashboards, and decorative blobs.
- Prefer thin borders, soft shadows, and spacious layout over heavy cards.
- Cards should feel like product/editorial surfaces, not boxed widgets.
- Keep border radius restrained. Use rounded pills for buttons only; normal cards should stay around 6-8px unless already established.
- Add motion sparingly: fade/slide reveals, shimmer accents, and hover lift are preferred. Avoid distracting looping animation for functional screens.

## Component Rules

- Use `components/ui/button.tsx` for primary links and actions whenever practical.
- Use Lucide React for all icons. Do not introduce another icon library.
- Use shadcn/ui components from `components/ui` for new form controls, dialogs, tabs, tables, badges, and cards.
- Use Magic UI only for small premium accents such as shimmer or subtle text shine. Do not use heavy 3D or canvas effects unless explicitly requested.
- Keep existing domain components reusable:
  - `components/site-chrome.tsx` for header/footer/cart shell
  - `components/product-card.tsx` for product listing cards
  - `components/section-heading.tsx` for section titles
  - `components/custom-form.tsx` for custom bracelet flow

## Naming Rules

- React components: `PascalCase`
- Hooks: `useCamelCase`
- Utility functions: `camelCase`
- TypeScript types: `PascalCase`
- API route payload fields: keep current API casing; do not rename persisted Supabase fields unless a migration is included.
- CSS utility classes: prefer Tailwind utilities. Use global classes only for reusable brand primitives such as `luxury-surface`, `luxury-eyebrow`, and `luxury-reveal`.
- Files and folders in routes: follow Next.js App Router conventions.

## Admin UI Rules

- Admin pages should be calm, scannable, and operational.
- Keep headers consistent:
  - Eyebrow: small uppercase
  - H1: serif, `text-4xl`
  - Right actions: shadcn Button style or matching `border-crystal-line bg-white px-4 py-2 text-sm text-crystal-muted`
- Use filters before tables when data can grow.
- Prefer inline expandable details over unnecessary route jumps.
- Avoid deleting business data directly. Use soft delete/archive fields such as `deleted_at`.

## Frontend Interaction Rules

- Public pages should use rich product imagery.
- Primary CTAs should use `Button` with `asChild`.
- Icon-only controls must have `title` or accessible labels.
- Text must not overlap at mobile widths.
- Preserve RWD behavior when editing layout.
- All new interactive controls need loading/disabled/error states when they call APIs.

## Backend/Data Rules

- Supabase is the source for products and orders.
- Product images upload to Supabase Storage and store public URLs in `products`.
- Use soft archive for products via `deleted_at`; do not hard delete.
- Admin APIs must call `requireAdmin`.
- Public product lists must exclude archived products.
- Avoid printing or committing secrets from `.env.local`.

## Verification Rules

- After code changes, run `npm run build`.
- After every build, restart the dev server because Next build rewrites `.next` and can make the browser lose CSS chunks.
- Restart flow:
  - stop the current process on port 3000
  - `rm -rf .next`
  - `npm run dev`
  - verify a local route returns 200 or the expected auth redirect

## Git Rules

- Do not revert unrelated user changes.
- Keep commits scoped by feature.
- Never commit `.env.local` or secrets.
