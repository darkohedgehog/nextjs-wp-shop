# Webshop price list implementation plan

## Approved scope

Local `/price-list` page and WordPress plugin for anchor prices and webshop CSV generation. No installation, activation, production writes, Synesis integration, retail uploads, commits or deployment. The user approved this scope in this conversation on 2026-09-16.

## Design

- WooCommerce owns prices. Store historical gross EUR anchor amounts separately from regular/sale prices, with reference date and explicit status (recorded, not offered, unknown). Never infer history from creation time or current price.
- Plugin under `wordpress/zivic-price-lists/`: product/variation fields, settings, administrator-only generation, opt-in daily cron, immutable files, read-only public manifest. No automatic deletion of archives in this version.
- Export uses raw WooCommerce B2C prices, Croatian base tax rates and current sale schedules, not customer/group-specific filters. Validate required catalog metadata before publication. Unsupported product types or unresolved anchor prices block the export rather than silently disappearing.
- Products marked not offered on the reference date are stored distinctly but block publication until their legal CSV representation is confirmed. The source decisions do not specify that representation.
- CSV contains name, SKU, brand, unit, unit price where applicable, retail price, promotion flag/name, anchor price/date, barcode and availability. Product unit/brand/barcode metadata must be configured explicitly. Export includes published catalog products and enabled variations; password-protected/hidden products are excluded as non-public catalog data.
- Require object type/address/code settings and anonymous EUR pricing confirmation before generating. No invented merchant address or historical prices.
- Public manifest contains only publication metadata and links. Files are atomically renamed before publishing the manifest. Failed generation leaves the last successful publication intact. No credentials or customer data in the public API.
- Frontend fetches manifest server-side with timeout and strict schema/URL validation. Empty, unavailable and outdated states are distinct; no fabricated download. Link from footer and include in sitemap. Date presentation uses Europe/Zagreb.
- This slice exposes anchor data via the plugin REST product response, but the existing catalog/detail/card display rollout is a separate next slice. Do not claim complete regulatory readiness from the price-list page alone.

## Tasks and acceptance

1. Correct audited dependencies within current major versions where possible; explicitly upgrade Sharp to patched 0.35.x. Run npm audit, lint, TypeScript and existing unit tests.
2. Test manifest validation with good/empty/invalid payloads, unsafe links, extra fields, duplicate publications and date ordering. Implement server adapter and `/price-list`.
3. Test PHP domain rules: immutable anchor semantics, missing/new reference data, CSV escaping, monetary values, filenames and price selection. Implement plugin admin, storage and public endpoints; run PHP lint and tests locally.
4. Document installation/configuration, external scheduler requirement, export limitations and local WordPress/WooCommerce acceptance checklist. No production connections are needed to prepare code.
5. Review application API authorization, checkout, data exposure, performance, accessibility and testing. Report evidenced findings separately; do not rewrite authentication/payment behavior in this slice.
6. Run final checks, report changes and clearly distinguish unit-tested code from pending WordPress integration and browser acceptance.

## Sources and remaining integration checks

- https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1212.html
- https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1213.html
- WooCommerce CRUD API: https://developer.woocommerce.com/docs/best-practices/data-management/crud-objects
- Check installed WordPress/WooCommerce/B2BKing versions, base tax settings, real catalog size, brand/barcode/unit mapping and hosting scheduler before activation. These are not available in this frontend checkout.
