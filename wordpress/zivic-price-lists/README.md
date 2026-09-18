# Živić Webshop Cjenici — local candidate 0.2.0

Version 0.2.0 prepared locally; retail upload requires acceptance in WordPress after upgrading the previously installed 0.1.0. This plugin does not establish complete regulatory compliance by itself.

## Scope

- Independent historical anchor metadata for simple products and variations. Gross EUR amount, reference date, recorded/unknown/not-offered status; latest editor and time are private metadata. No copying current prices on activation and no checkout price hooks.
- WooCommerce → Cjenici webshopa: merchant settings, manual validated publication, optional daily publication at 07:00 Europe/Zagreb.
- Public `GET /wp-json/zivic-price-lists/v1/publications` contains store identity and immutable CSV publication links. No authentication or customer information in this endpoint.
- CSV with UTF-8 BOM, semicolon delimiter, double-quote escaping and decimal point; identifiers remain strings. Potential spreadsheet formulas are rejected. Files persist under `wp-content/uploads/zivic-price-lists/` with distinct object/address/code/sequence/UTC timestamp/ID filenames.
- Successful files are never overwritten or automatically deleted. Retention is unlimited in v0.1, exceeding the proposed minimum archive duration; plan storage management before 5,000 publications.
- Last successful manifest remains available after validation, disk or manifest-write failures. A completed orphan CSV can remain if the WordPress option write fails; it is not linked as a publication. Inspect manually instead of automatic destructive cleanup.
- Synesis retail files are published separately through WooCommerce → Cjenici maloprodaje (see below). They never participate in the webshop CSV validation or WooCommerce catalog.

## Ručna objava maloprodaje (0.2.0)

1. U WordPressu otvorite Dodaci → Dodaj novi → Prenesi dodatak. Odaberite ZIP verzije 0.2.0 i zamijenite postojeću verziju istog dodatka. Postojeće sidrene cijene, postavke i CSV objave ostaju spremljene.
2. Otvorite **WooCommerce → Cjenici maloprodaje**. Potrebne su ovlasti `manage_woocommerce` i `upload_files`.
3. Unesite naziv i adresu fizičke prodavaonice.
4. Pod **Aktualni cjenik s usporedbom cijena** učitajte `Cjenik_s_usporedbom_cijena_na_dan_10092026.xls`. Unesite stvarni datum aktualnog cjenika; datum u nazivu datoteke označava povijesnu usporedbu i nije automatski datum aktualnih cijena.
5. Pod **Cijene na referentni datum** učitajte `Cijena_na_dan_10092026.xls` i provjerite referentni datum 10.09.2026.
6. Kliknite **Spremi i objavi maloprodajne cjenike**. Nakon ažuriranja frontenda provjerite `/price-list`, oba datuma i oba preuzimanja kao neprijavljeni posjetitelj.

Kod promjene cijena učitajte samo novi aktualni cjenik. Prazan izbor datoteke zadržava prethodnu. Referentnu datoteku mijenjajte samo radi ispravka povijesnih podataka. Ako nema promjene, nije potreban novi upload. Novi artikli i prazne povijesne vrijednosti prenose se bez promjena; plugin ne izmišlja sidrene cijene.

Podržani su XLS, XLSX i CSV, do 20 MB odnosno nižeg WordPress/PHP limita. Datoteke se objavljuju izvorno, za preuzimanje; ne prikazuju se svi redovi Excela u pregledniku i ne pretvaraju se automatski u CSV. Provjerite sadržaj prije objave: cijela izvorna datoteka postaje javna. Ovo nije potvrda propisanog formata cjenika.

Zamjena uklanja prethodni link s frontenda, ali zadržava datoteku u Medijskoj zbirci. **Ukloni ovu objavu s frontenda** uklanja link, ne briše datoteku niti blokira stari izravni URL. Neuspjeli prijenos ili spremanje zadržava prethodne javne linkove; uspješno prenesena datoteka može ostati neobjavljena u Medijskoj zbirci ako kasniji korak ne uspije.

Javni `GET /wp-json/zivic-price-lists/v1/retail` vraća naziv/adresu prodavaonice i najviše dvije objave (`current`, `anchor`). Frontend dohvaća maloprodaju neovisno o webshopu, bez cachea i vjerodajnica, uz provjeru formata i WordPress upload URL-a. Prilagođeni CDN/upload direktoriji nisu podržani bez prilagodbe. Nema cron rasporeda za maloprodaju ni ovisnosti o ACF-u.

Prije prihvata u WordPressu provjerite: prvi upload oba XLS-a, zamjenu samo aktualnog, nepromijenjenu referentnu datoteku, neispravan tip/preveliku datoteku, uklanjanje pojedinog linka i neovisan prikaz kad webshop nema objavljen CSV. Lokalne testne zamjene WordPress funkcija ne dokazuju stvarno MIME filtriranje ili ograničenja hostinga.

## Before any activation or publication

1. Verify actual WordPress, PHP (8.1+), WooCommerce and B2BKing versions on a local/staging copy. Classic WooCommerce product editor is the supported admin UI. Confirm variation saving through its AJAX editor.
2. Enter product anchor amounts from verified historical records, including the applicable reference date. Amounts are **already gross with PDV**, even if regular Woo prices are stored net. Never use sale price as anchor. Correcting an anchor is manual; this version records latest editor/time, not a complete change audit.
3. Unknown historical amounts and products explicitly not offered on the reference date **block the entire export**. This preserves the distinction without inventing a legally unconfirmed blank/zero representation. Obtain the rule for new products before enabling automatic exports on a catalog containing them.
4. Fill SKU, brand, barcode and applicable unit/quantity. Brand can come from `pwb-brand` or `product_brand`; GTIN can come from WooCommerce's `get_global_unique_id`. Explicit plugin fields override these. Variations own their own SKU/barcode/anchor/unit fields; brand can come from the parent taxonomy. Review items with no brand/barcode rather than entering fabricated placeholders.
5. Name active special sales in the product plugin field. Export computes current scheduled sale price from raw edit-context prices. It supports Woo's built-in regular/sale pricing, **not third-party public dynamic pricing rules**, bundles, external or grouped products. Unsupported published types stop generation.
6. Check the public catalog selection: published simple products plus published variations of published variable parents; hidden/password-protected parents are excluded. Confirm this selection covers the entire webshop's reportable assortment. Stock status is `instock` → available, other values → unavailable; confirm the required treatment of backorders before use.
7. Confirm EUR currency and Croatian base location/tax settings. Export bypasses customer price filters and converts net amounts using base tax rates; compare gross prices against anonymous frontend and checkout. It does not export B2B groups or customer discounts. Tax-exempt and inclusive-price cases must also be verified.
8. Store name, address, object type and code must reflect the actual webshop registration; do not derive them from the wholesale warehouse name without checking.

## Local acceptance / later installation

Copy `zivic-price-lists/` into the local site's `wp-content/plugins/` and activate only when authorized. Activation itself schedules nothing. Saving the daily checkbox enables the schedule; deactivation removes scheduled events and preserves files/metadata.

For production timing, a host-managed scheduler must invoke due WordPress cron events regularly (for example every five minutes). WP-Cron alone depends on requests and does not guarantee the 08:00 deadline. This repository deliberately contains no production cron command or credential.

Verify success, empty catalog, missing metadata, not-offered anchor, expired/future sale, zero price, tax, variation, unsupported type, concurrent generation, failed writes and archive retention on the local Woo site. Generation is paged (100 products); it runs in one request. Benchmark the real catalog against PHP time/memory limits before enabling scheduling. It is not a transactional inventory snapshot; avoid bulk catalog edits during generation.

Ensure WordPress/CDN allow public CSV downloads and crawler access to the new manifest path, with CSV content type. The Next frontend validates same-origin default WordPress upload links; custom upload roots/CDNs require an explicit adapter change and tests. No credentials should be added to links.

Connect Next.js using the existing WordPress URL settings. `/price-list` is server-rendered, uncached, has a five-second upstream timeout, and labels old publications by date. Before plugin availability it displays an unavailable message, not a fake download. The footer links to the page and sitemap configuration includes it.

## Tests

```sh
php tests/domain-test.php
php tests/publication-test.php
php tests/retail-test.php
```

Publication tests use a standalone WordPress/Woo contract fixture and temporary files. They **do not replace** actual Woo integration tests. PHP syntax was also checked locally using PHP 8.2.

## Follow-up scope

The existing Next product allowlist currently drops `zpl_anchor`; this slice does not yet display anchor prices on product detail/cards/advertising. Add that in a separate reviewed slice covering both REST and GraphQL data paths. Do not announce a compliant launch until that rollout, new-product policy, data completeness, real Woo acceptance and scheduler verification are finished.

Legal source for the preparation: NN 101/2026 decisions 1212 and 1213. A CSV column layout proposed here is a technical schema, not an officially certified format.
