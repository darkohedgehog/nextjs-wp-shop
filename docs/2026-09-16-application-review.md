# Pregled webshop aplikacije — 16.09.2026.

## Ažuriranje 18.09.2026.

Ostatak ovog dokumenta čuva istorijske nalaze pre popravki; navedeni brojevi linija više nisu aktuelni. Lokalna implementacija nalaza 1–3, 5, 7–8 i manjih UX predloga opisana je u `2026-09-18-hardening-verification.md`. Korisnik je izričito potvrdio da COD `set_paid=true` i postojeća dodela B2B grupe ostaju poslovno pravilo; odobravanje B2B kupaca vodi admin u WordPressu. Ključevi registracije prebačeni su iz URL-a u Authorization header.

## Obim i ograničenja

Pregled strukture aplikacije, API ruta, prijave, registracije, kupaca/narudžbi, B2B cena, korpe i checkouta, WordPress/GraphQL integracije, kataloga, bloga, SEO konfiguracije, zajedničkog UI-ja i postojećih testova. Nalazi su zasnovani na lokalnom izvornom kodu. Nije rađen penetracioni test produkcije, pregled WordPress dodataka/baze ili tvrdnja da su svi mogući problemi pronađeni. Infrastruktura može dodavati kontrole koje nisu prisutne u repozitorijumu; njihovo postojanje nije provereno.

## Prioritet 1 — pristup podacima i integritet narudžbi

### 1. API kupaca i narudžbi nema proveru vlasništva u aplikaciji

- `src/app/api/customer/[id]/route.ts:50` i `:95`: GET i PUT koriste ID iz URL-a i privilegovane WooCommerce kredencijale. Nema validacije sesije ni veze između prijavljenog kupca i traženog ID-a.
- `src/app/api/orders/[id]/route.ts:4`: čitanje po ID-u, bez provere order key-a ili vlasništva.
- `src/app/api/orders/route.ts:20`: customer filter potiče iz korisničkog query parametra.

Posledica pri dostupnosti ovih ruta: otkrivanje podataka drugih kupaca/narudžbi i menjanje tuđeg profila. Sakrivanje linkova na frontendu nije kontrola pristupa. Predlog: server-side validacija WordPress tokena, server-derived customer ID, eksplicitna guest order-key provera i minimizovani odgovori. Prioritet pre javne objave naredne verzije. Nije menjano u ovoj fazi.

### 2. Kreiranje narudžbe veruje identitetu, iznosima i dostavi iz zahteva

`src/app/api/create-order/route.ts:229`: `customer_id` određuje B2B grupu bez potvrde identiteta. `:256` prosleđuje originalne B2C line items; `:278` u B2B grani zadržava dodatne korisničke atribute. `:324` prosleđuje shipping lines. Napadač može poslati više polja nego legitimni frontend.

Predlog: eksplicitna lista prihvaćenih polja, pozitivne celobrojne količine, server-derived identitet i ponovni obračun proizvoda/dostave/poreza na pouzdanoj strani. I neuspešno dohvatanje B2B cene mora imati definisano odbijanje umesto prosleđivanja originalnih iznosa. Potvrditi ponašanje stvarnog Woo backenda lokalnim integracionim testom.

### 3. Identitet za B2B cenu izveden je iz nepotvrđenog email cookie-ja

`src/app/api/products/[id]/route.ts:66` čita `wpUserEmail` i po njemu nalazi customer grupu. Samo prisustvo tokena/emaila nije verifikacija. `src/app/api/b2b-prices/route.ts` prima groupId iz query-ja bez autentifikacije.

Predlog: jedinstven validiran server-side identitet i kontrola pristupa grupnim cenama. Uz to proveriti zašto lista proizvoda očekuje `zvo_*`, dok list API primarno sanitizuje odgovor privilegovanog Woo REST-a bez istog obračuna kao detail ruta.

## Prioritet 2 — tačnost i održavanje

### 4. Pouzeće označava narudžbu kao plaćenu

`src/app/api/create-order/route.ts:308` postavlja `set_paid = true` za COD. To može promeniti Woo evidenciju plaćanja i povezane automatizacije pre naplate. Predlog: uskladiti stanje sa stvarnom potvrdom naplate i Woo payment gateway pravilima; testirati odvojeno od CSV funkcionalnosti.

### 5. Prijava i GraphQL koriste različite ključeve tokena

`src/app/my-account/login/page.tsx:37` piše `wpToken`; `src/lib/apollo-client.ts:32` čita `wp_jwt`. Deo GraphQL zahteva zato može ostati anoniman posle prijave. Token je istovremeno vraćen browseru i sačuvan u localStorage iako API postavlja HttpOnly cookie. Predlog: jedinstven tok sesije i uklanjanje nepotrebnog browser-readable tokena nakon dogovorene migracije.

### 6. Registracija direktno odobrava B2B grupu

`src/app/api/store-register/route.ts:76`: korisnički `isB2B` dovodi do `b2bking_b2buser=yes` i fiksne grupe 308. Ako poslovno pravilo zahteva odobrenje partnera, ono ovde ne postoji. Potrebna poslovna odluka pre promene. Ista ruta na `:124` stavlja Woo ključeve u URL query; prebaciti na HTTPS Authorization header radi smanjenja rizika zapisivanja kredencijala u URL logove.

### 7. Globalni metadata cache nema istek ili ograničenje

`src/app/(shop)/products/[slug]/page.tsx:115`: module-level Map trajno čuva Promise po slug-u, uključujući null rezultat. Promenjeni podaci mogu ostati zastareli do restarta, a broj ključeva raste. Predlog: request memoization ili ograničeni Next cache sa jasnim rokom/invalidation pravilom.

### 8. Fragmentisana konfiguracija i obrada WordPress grešaka

Delovi aplikacije koriste centralne URL helpers, drugi direktno čitaju različite env varijable. Mnoge rute nemaju timeout, vraćaju sirov upstream odgovor ili `details: String(err)`. Lost-password loguje korisnički email. Predlog: postepeno ujednačavanje timeouta, minimalnih javnih grešaka i redigovanog logovanja bez velikog refaktora odjednom.

## Prioritet 3 — korisničko iskustvo, performanse i testovi

- `ProductCard.tsx:69` postavlja priority za svaku sliku: ograničiti prioritet na stvarno važnu sliku iznad prevoja, ostale ostaviti lazy.
- `Footer.tsx`: više linkova sadrži samo ikone bez pristupačnog imena; dodati aria-label. Facebook link vodi na opštu početnu stranicu, Messenger na administratorski inbox; proveriti nameravana javna odredišta.
- `CookiesToast.tsx`: čuva izbor u localStorage, ali ne demonstrira upravljanje opcionalnim skriptama; proveriti stvarne integracije pre bilo kakve tvrdnje o saglasnosti. Modal nema kompletno upravljanje fokusom/Escape ponašanjem.
- Product/blog/FAQ prikazuju WordPress HTML preko `dangerouslySetInnerHTML`; potvrditi sanitizaciju i prava objavljivanja na WordPress strani. Ne tvrdi se da je XSS potvrđen bez pregleda tog izvora.
- Dokumentacija u README je generička, a withdrawal TODO sadrži istorijsko stanje. Dopuniti stvarnim data-flow, podešavanjem lokalnih fixture-a, testiranjem i postupkom objave.
- Postojeći testovi pre ove faze pokrivaju samo javnu product sanitizaciju i URL helpers. Prioritet sledećih testova: negativni pristup tuđem customer/order ID-u i manipulacija checkout cenama, zatim B2B/B2C tokovi.

## Urađeno u ovoj fazi

- Npm audit: početno 10 ranjivih paketa (1 critical, 6 high, 3 moderate); posle korekcija 0. Bez `--force`.
- Zaključane instalirane verzije uključuju Next 16.3.5, Sharp 0.35.4 i PostCSS 8.5.28; eslint-config-next podignut na 16.3.3. Sharp 0.34 → 0.35 zahteva Node >=20.9; lokalno je Node 24.15.0. Proveriti Node na hostingu pre objave.
- Lokalna `/price-list` i priprema WordPress plugina. Bez menjanja autentifikacije, naplate, Synesisa ili produkcije.

## Preporučeni redosled

1. Zasebno rešiti API vlasništvo i autoritativni obračun narudžbi.
2. Prihvatiti plugin na lokalnoj kopiji stvarnog Woo/B2BKing sistema i proveriti poreske iznose/metadata.
3. Povezati sidrene cene na svim postojećim proizvodnim prikazima (REST + GraphQL), potvrditi pravilo za nove artikle, pa tek onda planirati produkcijsku objavu i raspored.
4. Manje UX/performance predloge sprovoditi pojedinačno, nakon najvažnijih popravki.

## Izvršene lokalne provere

- `npm audit`: 0 ranjivosti nakon završnog ponovnog dohvatanja iz registra.
- `npm run lint`: 0 grešaka; 1 prethodno postojeće upozorenje za nekorišćeni `__dirname` u `eslint.config.mjs`.
- `npx tsc --noEmit`: prolazi.
- `node --test src/lib/*.test.ts`: 11/11 prolazi. Node prijavljuje postojeći tip upozorenja MODULE_TYPELESS_PACKAGE_JSON; nije menjan module type projekta zbog CommonJS sitemap konfiguracije.
- `next build` (Turbopack, Next 16.3.5): prolazi, uz lokalni HTTP fixture za WordPress/GraphQL i lažne Woo kredencijale. Nije dokaz produkcijske povezanosti. `postbuild` nije izvršen da fixture ne prepiše javne sitemap datoteke.
- `/price-list` HTTP provera na produkcijskom lokalnom serveru: empty / ready+archive+old-date / unavailable / invalid URL — sva četiri prolaze. Nije rađena vizuelna browser provera.
- PHP 8.2.27: syntax check svih plugin fajlova, domain testovi i publication contract testovi prolaze. Contract testovi koriste privremene datoteke i stubove WordPress API-ja; nisu test na instaliranom WooCommerce-u.
- Sharp 0.35.4: AVIF encode/decode smoke test prolazi.
- `git diff --check`: prolazi. Nijedan commit, push ili deployment nije izvršen.
