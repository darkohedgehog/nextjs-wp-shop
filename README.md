# Živić Elektro webshop

Next.js App Router frontend; WordPress/WooCommerce je izvor proizvoda, kupaca i narudžbi. Synesis maloprodaja je odvojen katalog i nije uključena u ovaj cjenik.

## Lokalni razvoj

Koristiti Node.js 20.9 ili noviji (provere izvršene na Node 24). Postojeću lokalnu konfiguraciju zadržati privatnom; ne dodavati `.env` datoteke u Git.

```sh
npm ci
npm run dev
```

Lokalni frontend može koristiti stvarni WordPress. Kreiranje narudžbe, registracija i reset lozinke tada menjaju stvarni sistem ili šalju email. Automatski testovi ispod koriste samo memorijske odgovore i ne stvaraju kupce/narudžbe.

## Tok podataka

- Javni katalog: GraphQL; Woo REST dopunjava aktuelne i B2B cene.
- Prijava: WordPress JWT, identitet potvrđen preko `/wp-json/wp/v2/users/me?context=edit`. Token ostaje u HttpOnly cookie-ju. `wpUser` u localStorage sadrži profil za UI, nikada nije dokaz identiteta.
- Kupci/narudžbe: server proverava identitet i vlasništvo. Gost pristupa pojedinačnoj narudžbi pomoću `order_key`.
- COD/BACS: server određuje kupca, B2B grupu, dozvoljena polja stavki i dostavu. B2C iznose računa WooCommerce, grupne iznose server izvodi iz Woo metadata. Dostava ostaje 5,50 € za B2C i 0 € za B2B.
- Pouzeće ostaje `processing` + `set_paid=true`; BACS `processing` + `set_paid=false`, prema potvrđenom poslovnom pravilu.
- Dodela B2B grupe pri registraciji je zadržana; admin postupak odobravanja je u WordPressu.
- Kartica koristi zaseban WordPress `wc_next_prepare_checkout` handler. Njegov kod nije u ovom repozitorijumu; nije menjan ni testiran.
- WordPress HTML prikazuje se kroz `safeHtml`; JSON-LD escapuje `<`.

## Sidrena cijena i cjenik

Plugin i uputstva su u [`wordpress/zivic-price-lists`](wordpress/zivic-price-lists/README.md). Sidrena cena je zaseban podatak; nije Woo `sale_price`.

Detalj proizvoda čita `zpl_anchor` kroz postojeći REST odgovor i prikazuje samo kompletan, evidentiran podatak. Neobjavljen CSV ne sprečava prikaz sidrene cene. Nedostajući podatak se ne zamenjuje trenutnom cenom ili nulom.

`/price-list` čita javni manifest plugina. Dok nema publikacije, prikazuje stanje bez cjenika. Generisanje CSV-a ostaje blokirano dok obavezni podaci nisu kompletni; ne zaobilaziti validaciju. Arhiva ostaje sačuvana.

## Provere

```sh
node --test src/lib/*.test.ts tests/*.test.cjs
npm run lint
npx tsc --noEmit
npm audit
npm run build
```

`npm run build` uključuje `postbuild` generisanje sitemap datoteka i može čitati konfigurisani WordPress. Za izolovani build postoji `node tests/build-with-fixtures.cjs`; koristi lokalne GraphQL odgovore i testne Woo vrednosti, bez menjanja `.env` datoteka ili sitemapa.

Detalji provera i preostale granice: [`docs/2026-09-18-hardening-verification.md`](docs/2026-09-18-hardening-verification.md).

## Pre objave

Proveriti stvarni B2B nalog, prikaz grupne cene i odgovarajuću testnu narudžbu, Woo porez/zaokruživanje i guest order-key povratak. Pravni obuhvat i datum sidrene cene, CSV podaci i raspored objava proveravaju se odvojeno. Cookie dijalog sprema izbor; u ovom kodu nisu pronađene opcionalne analitičke skripte. Svaka buduća takva integracija mora poštovati izbor korisnika.

Commit, push, WordPress instalacija i VPS objava su odvojeni koraci, ne izvršavaju se testnim skriptama.
