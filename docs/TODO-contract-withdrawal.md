# Contract Withdrawal TODO

## 1. Repository findings

### Router and project shape

- The project uses Next.js App Router under `src/app`.
- No `pages/` router was found.
- Public pages are implemented as `src/app/<route>/page.tsx`, often delegating larger client UI to `src/components/<feature>/*`.
- API routes are App Router route handlers under `src/app/api/**/route.ts`.
- The existing English route naming convention matches the requested public route: `/withdrawal`.

### Current order-success implementation

- Public route: `src/app/order-success/page.tsx`.
- Client component: `src/components/orders/OrderSuccessClient.tsx`.
- `OrderSuccessClient` reads:
  - `order_id` from `useSearchParams()`.
  - `key` from `useSearchParams()` as `orderKey`.
- It fetches the order through `/api/orders/${orderId}` and appends `?key=<orderKey>` if the URL contains a key.
- Current `/api/orders/[id]` ignores the `key` query parameter and fetches WooCommerce orders by privileged Basic Auth credentials.
- The component currently renders the full billing email from `order.billing.email`.
- Current checkout redirects COD/BACS orders to `/order-success?order_id=${data.id}` without `key`.
- Current account order links also use `/order-success?order_id=${order.id}` without `key`.
- The Stripe helper posts directly to WordPress admin-post. Whether that WordPress flow redirects back with `key` is not visible in this repository.

Order-success access summary:

- `order_id`: yes, available from URL.
- `order_key`: partially available. The component can read `?key=...`, but current COD/BACS and account links do not pass it.
- Customer email: yes, currently fetched and rendered as full `order.billing.email`.
- Order number: currently the UI displays `order.id`; Woo may also return `number`, but the local `Order` type does not model it.

For the withdrawal `/link` endpoint, the data should come from:

- Newly created COD/BACS orders: the Woo REST create-order response likely includes `order_key`; if confirmed during implementation, extend the local `CreateOrderResponse` type and preserve the key in the order-success redirect as `?key=...`.
- Stripe orders: the WordPress `wc_next_prepare_checkout` / payment-return flow should include `order_id` and `key` when redirecting back to `/order-success`; confirm in the WordPress plugin code or a production test order.
- Existing account-order links: currently do not have `order_key`, so do not generate a withdrawal link from account history unless a safe server-side source for the key is added.

### Existing API route patterns

- Routes use `NextRequest` and `NextResponse` from `next/server`.
- Existing routes generally parse JSON manually with `await req.json()`.
- Error handling is local to each route:
  - `NextResponse.json({ error: "..." }, { status })` for structured errors.
  - Some Woo proxy routes forward raw WordPress/Woo response text with `Content-Type: application/json`.
- Woo REST routes generally use `cache: "no-store"` or `cache: 'no-store'` for order/customer/product reads.
- There is no shared API proxy wrapper today.

Relevant existing routes:

- `src/app/api/create-order/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/products/[id]/route.ts`
- `src/app/api/customer/[id]/route.ts`
- `src/app/api/store/cart/route.ts`
- `src/app/api/lost-password/route.ts`
- `src/app/api/reset-password/route.ts`

### WordPress/WooCommerce communication

- Apollo/GraphQL is configured in `src/lib/apollo-client.ts` with a hardcoded `https://wp.zivic-elektro.shop/graphql`.
- Blog/product/category server code also uses GraphQL env variables such as `WP_GRAPHQL_URL`, `NEXT_PUBLIC_WP_GRAPHQL_URL`, and `NEXT_PUBLIC_GRAPHQL_URL`.
- Woo REST API routes use a mix of:
  - `WC_BASE_URL`
  - `WP_REST_ROOT`
  - `WC_KEY` / `WC_SECRET`
  - `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET`
  - `NEXT_PUBLIC_WC_BASE_URL` in some client/cart cases
- `next.config.ts` has hardcoded rewrites for Woo Store API cart endpoints.
- No current source code usage of `NEXT_PUBLIC_WP_URL` was found.

For this feature, use only the existing requested env var:

```ts
const wpBaseUrl = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "")
```

This is safe to read server-side in route handlers. It is public by name and only contains the WordPress base URL, not credentials.

### Fetch/client utilities and types

- No shared REST client wrapper exists.
- Types are mostly local to components/routes, with a few shared types under `src/types`.
- The current order type is local inside `OrderSuccessClient`.
- `src/types/order.ts` contains checkout/create-order request types, but it is not used by the withdrawal flow yet.
- Utility examples:
  - `src/utils/seo.ts` for metadata.
  - `src/utils/siteMetaData.ts` for site/page metadata.
  - `src/utils/price.ts` for price formatting outside order-success.
  - `src/components/ui/useLocalToast.tsx` and `src/components/ui/Toast.tsx` for client toasts.

### UI conventions

- The site uses Tailwind classes directly in components.
- Visual style is dark, glassy cards with cyan/emerald accents, borders, shadows, and rounded `2xl`/`3xl`/`4xl` containers.
- Existing legal/support precedent: `src/components/complaint/Complaint.tsx`.
- Existing order context precedent: `src/components/orders/OrderSuccessClient.tsx`.
- Forms use controlled React state, native `required`, manual validation, local error text, disabled submit buttons, and sometimes simple spinner elements.
- Buttons are usually `button` or `Link` with inline Tailwind classes and icons from `react-icons`.
- Existing shared UI helpers are small; no shadcn/ui or form component library is present.

### SEO/meta conventions

- Static pages such as About and Contact use `generateMetadata()` plus `buildMetadata()`.
- Site metadata is centralized in `src/utils/siteMetaData.ts`.
- Add a `withdrawal` page entry there or call `buildMetadata()` directly with a local title/description.

### Validation conventions

- No Zod/Yup/react-hook-form/Formik usage was found in `src` or `package.json`.
- Validation is manual:
  - client-side trim checks and email `includes("@")`.
  - route-side required field checks and JSON parse guards.
- Do not add a validation dependency for this feature unless requirements change.

### Croatian copy style

- User-facing text is mostly Croatian, with some mixed Serbian wording in older files.
- For this feature, use Croatian-only copy from the product brief.
- Use masked customer email returned by the withdrawal API, not full billing email.

### Tests, lint, typecheck, formatting

- No test files or test script were found.
- Available scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
- TypeScript is strict (`"strict": true`) and `noEmit`.
- ESLint uses Next core web vitals and Next TypeScript config.
- No Prettier config was found.

## 2. Proposed files to add/change

Use App Router structure.

Create:

- `src/app/withdrawal/page.tsx`
  - Server page for `/withdrawal`.
  - Uses `generateMetadata()` with `buildMetadata()`.
  - Renders a client component in `Suspense`, similar to `order-success`.

- `src/components/withdrawal/WithdrawalClient.tsx`
  - Client UI for both token and fallback modes.
  - Calls only local Next API routes.
  - Owns loading, error, selection, submit, and success states.

- `src/types/contract-withdrawal.ts`
  - Shared DTOs for order fixture/verify response/submit response/client payloads.
  - Keep types strict and avoid `any`.

- `src/app/api/contract-withdrawal/_shared.ts`
  - Server-only helper for:
    - `wpBaseUrl` resolution from `NEXT_PUBLIC_WP_URL`.
    - WordPress endpoint URL construction.
    - dev mock fixtures.
    - JSON proxy helper and safe JSON/text parsing.
  - Keep this file free of client imports.

- `src/app/api/contract-withdrawal/health/route.ts`
- `src/app/api/contract-withdrawal/link/route.ts`
- `src/app/api/contract-withdrawal/verify-token/route.ts`
- `src/app/api/contract-withdrawal/request-link/route.ts`
- `src/app/api/contract-withdrawal/submit/route.ts`

Modify:

- `src/utils/siteMetaData.ts`
  - Add `pages.withdrawal` metadata:
    - title: `Odustanak od ugovora | Živić Elektro`
    - description: Croatian summary for the withdrawal form.
    - path: `/withdrawal`
    - banner: reuse a current legal/support-safe OG image, likely `/og/contact.jpeg` or `/og/home.jpeg`.

- `src/components/orders/OrderSuccessClient.tsx`
  - Future implementation only: add a "Pravo na odustanak od ugovora" card.
  - Call `/api/contract-withdrawal/link` only when both `orderId` and `orderKey` are available.
  - Render returned `withdrawal_url` as the CTA.
  - Do not expose full email as part of the withdrawal card.

- `src/components/checkout/CheckoutPage.tsx`
  - Future implementation only if confirmed needed: preserve `order_key` returned by `/api/create-order` in the redirect to order-success.
  - Do not change payment method logic, shipping, B2B logic, terms logic, cart clearing, or Stripe handling.

## 3. Proposed route/page structure

Public routes:

```txt
/withdrawal
/withdrawal?t=<token>
```

Files:

```txt
src/app/withdrawal/page.tsx
src/components/withdrawal/WithdrawalClient.tsx
```

Local API proxy routes:

```txt
GET  /api/contract-withdrawal/health
POST /api/contract-withdrawal/link
POST /api/contract-withdrawal/verify-token
POST /api/contract-withdrawal/request-link
POST /api/contract-withdrawal/submit
```

Files:

```txt
src/app/api/contract-withdrawal/health/route.ts
src/app/api/contract-withdrawal/link/route.ts
src/app/api/contract-withdrawal/verify-token/route.ts
src/app/api/contract-withdrawal/request-link/route.ts
src/app/api/contract-withdrawal/submit/route.ts
```

## 4. Data flow

### With token

1. Customer opens `/withdrawal?t=<token>`.
2. `WithdrawalClient` reads `t` from `useSearchParams()`.
3. Client calls local `POST /api/contract-withdrawal/verify-token` with `{ "token": "<token>" }`.
4. Next API route:
   - In development and token is `dev-token`, returns mock order data without calling production WordPress.
   - Otherwise proxies to WordPress:
     `POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/verify-token`
5. Client renders order number, masked email, and line items.
6. Customer chooses entire order or selected items, optionally adds comment, confirms checkbox.
7. Client calls local `POST /api/contract-withdrawal/submit`.
8. Next API route:
   - In development and token is `dev-token`, returns mock submit response.
   - Otherwise proxies to WordPress:
     `POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/submit`
9. Client shows request ID, timestamp, and masked email confirmation.

### Without token

1. Customer opens `/withdrawal`.
2. Client renders fallback form with:
   - Broj narudžbe
   - E-mail korišten pri kupnji
3. Client calls local `POST /api/contract-withdrawal/request-link`.
4. In development, route returns the generic success message without sending email.
5. In production, route proxies to:
   `POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/request-link`
6. Client always renders the same generic success message:
   `Ako se podaci podudaraju, poslat ćemo sigurni link na e-mail adresu korištenu pri kupnji.`

### Order-success card

1. Order-success page has `order_id`.
2. If it also has `key`, call local `POST /api/contract-withdrawal/link`.
3. The local route proxies to:
   `POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/link`
4. Render the returned `withdrawal_url` in the card CTA.
5. If `key` is missing, render a safe static card linking to `/withdrawal` or hide the generated-link CTA.

## 5. API contracts

### Shared WordPress base

Use this in the server helper:

```ts
const wpBaseUrl = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, "")
```

Do not add a new env var.

### WordPress target endpoints

```txt
GET  ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/health
POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/link
POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/verify-token
POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/request-link
POST ${NEXT_PUBLIC_WP_URL}/wp-json/contract-withdrawal/v1/submit
```

### GET `/api/contract-withdrawal/health`

Response:

```json
{
  "ok": true
}
```

Development behavior:

- Return `{ "ok": true, "mock": true }` without calling production WordPress.

### POST `/api/contract-withdrawal/link`

Request:

```json
{
  "order_id": 123,
  "order_key": "wc_order_..."
}
```

Expected success response:

```json
{
  "ok": true,
  "withdrawal_url": "https://www.zivic-elektro.shop/withdrawal?t=..."
}
```

Development behavior:

- If `process.env.NODE_ENV !== "production"` and `order_key` is `dev-token`, return:

```json
{
  "ok": true,
  "withdrawal_url": "/withdrawal?t=dev-token"
}
```

- Other normal order keys can still proxy to WordPress if intentionally tested.

### POST `/api/contract-withdrawal/verify-token`

Request:

```json
{
  "token": "..."
}
```

Development response for `dev-token`:

```json
{
  "ok": true,
  "order": {
    "id": 12345,
    "order_number": "12345",
    "status": "processing",
    "created_at": "2026-06-05T12:00:00+02:00",
    "customer_email_masked": "k***@example.com",
    "customer_name": "Test Kupac",
    "withdrawal_requested": false,
    "withdrawal_request_id": "",
    "window_days": 14,
    "items": [
      { "item_id": 1, "product_id": 101, "name": "Test proizvod A", "quantity": 1 },
      { "item_id": 2, "product_id": 102, "name": "Test proizvod B", "quantity": 2 }
    ]
  }
}
```

### POST `/api/contract-withdrawal/request-link`

Request:

```json
{
  "order_number": "12345",
  "email": "kupac@example.com"
}
```

Response:

```json
{
  "ok": true,
  "message": "Ako se podaci podudaraju, poslat ćemo sigurni link na e-mail adresu korištenu pri kupnji."
}
```

Security requirement:

- Always return generic success text to the browser for valid request shape.
- Do not reveal whether the order exists.

### POST `/api/contract-withdrawal/submit`

Request:

```json
{
  "token": "...",
  "scope": "order",
  "item_ids": [],
  "comment": "Opcionalna napomena",
  "confirmed": true
}
```

For selected items:

```json
{
  "token": "...",
  "scope": "items",
  "item_ids": [1, 2],
  "comment": "",
  "confirmed": true
}
```

Development response for `dev-token`:

```json
{
  "ok": true,
  "request_id": "WD-DEV-12345",
  "submitted_at": "05.06.2026. 12:30",
  "customer_email_masked": "k***@example.com"
}
```

Route-side validation:

- `token` must be a non-empty string.
- `scope` must be `order` or `items`.
- `item_ids` must be non-empty when `scope` is `items`.
- `confirmed` must be `true`.
- `comment` should be trimmed and length-limited before proxying.

## 6. UI states

### Shared page copy

Use Croatian-only copy:

- Heading: `Odustanak od ugovora`
- Intro: `Ako želite odustati od online kupnje u zakonskom roku, ispunite obrazac u nastavku. Zahtjev ćemo evidentirati i poslati potvrdu na e-mail adresu korištenu pri kupnji.`

### With token UI

States:

- Verifying token: spinner or simple loading text, e.g. `Učitavanje podataka o narudžbi...`
- Verification success:
  - show order number.
  - show masked email.
  - show item list.
  - show mode radio buttons:
    - `Odustajem od cijele narudžbe`
    - `Odustajem od odabranih stavki`
  - show item checkboxes only for selected-items mode.
  - show textarea:
    - `Komentar / napomena (opcionalno)`
  - show confirmation checkbox:
    - `Potvrđujem da želim odustati od ugovora za navedenu narudžbu ili odabrane stavke.`
  - final CTA:
    - `Potvrđujem odustanak`
- Submit loading:
  - disable controls and button.
- Submit success:
  - `Zahtjev za odustanak je zaprimljen.`
  - `Potvrda prijema zahtjeva poslana je na e-mail adresu korištenu pri kupnji.`
  - show request ID and timestamp.
- Invalid/expired token:
  - show a generic Croatian error and offer fallback `/withdrawal` form.
- Already requested:
  - if `withdrawal_requested` is true, show existing request ID and do not show submit CTA.

### Without token UI

Fields:

- `Broj narudžbe`
- `E-mail korišten pri kupnji`

Submit success text:

`Ako se podaci podudaraju, poslat ćemo sigurni link na e-mail adresu korištenu pri kupnji.`

Validation:

- Require both fields.
- Email only needs the existing project-level lightweight validation style.
- Do not reveal existence/non-existence of an order.

### Order-success card copy

Card title:

`Pravo na odustanak od ugovora`

Body:

`Ako se predomislite, možete podnijeti zahtjev za odustanak od ugovora u zakonskom roku, ako se na kupljeni proizvod ili uslugu primjenjuje pravo na odustanak.`

CTA:

`Odustani od ugovora ovdje`

## 7. Local mock testing plan

No new env vars.

Use:

```txt
process.env.NODE_ENV !== "production"
```

Mock behavior:

- `/withdrawal?t=dev-token` verifies with mock order data.
- `POST /api/contract-withdrawal/verify-token` returns mock order data for `dev-token`.
- `POST /api/contract-withdrawal/submit` returns mock submit response for `dev-token`.
- `POST /api/contract-withdrawal/request-link` returns the generic success message in development without sending email.
- `GET /api/contract-withdrawal/health` returns local mock health in development.
- Normal non-mock tokens may still proxy to WordPress when intentionally tested.

Manual local checks:

1. Run `npm run dev`.
2. Open `http://localhost:3000/withdrawal?t=dev-token`.
3. Verify mock order renders.
4. Submit entire order.
5. Verify success ID `WD-DEV-12345`.
6. Reload and submit selected items.
7. Open `http://localhost:3000/withdrawal`.
8. Submit fallback form and verify the generic message.
9. Confirm no production WordPress call is made for `dev-token`.

Verification commands after implementation:

```bash
npm run lint
npm run build
```

## 8. Production rollout checklist

- Confirm `NEXT_PUBLIC_WP_URL=https://wp.zivic-elektro.shop` exists in production.
- Deploy/enable the WordPress plugin namespace:
  `/wp-json/contract-withdrawal/v1`.
- Verify production health:
  `/api/contract-withdrawal/health`.
- Confirm WordPress plugin response schemas match the DTOs in `src/types/contract-withdrawal.ts`.
- Confirm plugin enforces withdrawal eligibility, window, exclusions, and duplicate-request rules server-side.
- Confirm plugin sends confirmation email and stores request ID.
- Confirm order-success has `order_id` and `order_key` before rendering generated withdrawal URL.
- Confirm COD/BACS order-success redirect preserves `order_key` if needed.
- Confirm Stripe return flow provides `key`; if not, update the WordPress return/admin-post flow, not the checkout payment behavior.
- Verify fallback lookup never reveals whether an order exists.
- Verify browser never receives full customer email from withdrawal API responses.
- Verify no order auto-cancel/refund behavior exists in frontend or proxy routes.
- Run `npm run lint`.
- Run `npm run build`.
- Test with one controlled real production order because there is no WordPress staging environment.

## 9. Open risks/questions

- Does Woo REST `/wp-json/wc/v3/orders` create response currently return `order_key` in this environment? If yes, preserve it in the order-success redirect. If no, the WordPress side needs to provide a safe return URL containing the key.
- Does the Stripe `wc_next_prepare_checkout` flow redirect to `/order-success` with both `order_id` and `key`? This is not visible in the Next.js repo.
- Current `/api/orders/[id]` fetches by privileged server credentials using only order ID and currently returns full billing email to the browser. This is existing behavior, but the withdrawal feature should not expand this exposure.
- Historical account orders do not have `order_key` in the URL. The withdrawal generated-link card should not depend on account links unless a safe key source is added.
- Product/service eligibility for statutory withdrawal must remain WordPress/plugin authority. The frontend should display plugin state but not decide legal eligibility.
- Existing copy has mixed Croatian/Serbian wording in older areas. This feature should use Croatian wording consistently.

## 10. Estimated implementation sequence

1. Add shared withdrawal DTOs in `src/types/contract-withdrawal.ts`.
2. Add server-only proxy/mock helper in `src/app/api/contract-withdrawal/_shared.ts`.
3. Add `health`, `verify-token`, `request-link`, `submit`, and `link` route handlers.
4. Add `pages.withdrawal` metadata in `src/utils/siteMetaData.ts`.
5. Add `src/app/withdrawal/page.tsx` using App Router and `buildMetadata()`.
6. Add `src/components/withdrawal/WithdrawalClient.tsx` with token and fallback modes.
7. Add local dev mock verification for `/withdrawal?t=dev-token`.
8. Add order-success withdrawal card in `src/components/orders/OrderSuccessClient.tsx`.
9. Confirm `order_key` availability. If needed, minimally extend `CreateOrderResponse` and preserve `order_key` in the COD/BACS order-success redirect without changing payment behavior.
10. Run `npm run lint`.
11. Run `npm run build`.
12. Perform local manual QA for token, selected-items, full-order, fallback, invalid token, and mock success states.
13. Perform controlled production rollout checks against the deployed WordPress plugin.

## Safety constraints to keep during implementation

- Do not auto-cancel orders.
- Do not auto-refund payments.
- Do not expose full customer email in withdrawal UI/API responses.
- Do not reveal whether an order exists in fallback lookup.
- Do not require login for guest customers.
- Do not add new env vars.
- Do not make production WordPress calls in local dev for `dev-token`.
- Do not change checkout/payment behavior.
